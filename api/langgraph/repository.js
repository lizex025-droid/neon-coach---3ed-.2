import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { AgentError, localDate } from './contracts.js';

// SQL identifiers only originate from this allowlist, never from request/model values.
const columns = {
  meal_logs: ['date', 'name', 'meal_type', 'items', 'calories', 'protein', 'carbs', 'fats'],
  water_logs: ['date', 'consumed_ml', 'consumed_glasses', 'target_glasses'],
  inbody_records: ['date', 'weight'],
  workout_logs: ['date', 'workout_title', 'exercises', 'completed'],
  shopping_items: ['item_name', 'quantity', 'is_completed']
};
const jsonColumns = new Set(['items', 'exercises']);
const encode = (k, v) => jsonColumns.has(k) ? JSON.stringify(v) : v;
const normalizeRow = row => row && row.date instanceof Date ? { ...row, date: row.date.toISOString().slice(0, 10) } : row;
export class AgentRepository {
  constructor(client, userId) { this.db = client; this.userId = userId; this.effects = []; this.today = localDate('Asia/Amman'); }
  async transaction(fn) {
    await this.db.query('BEGIN');
    try {
      await this.db.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [this.userId]);
      await this.db.query('SET LOCAL ROLE neon_agent');
      await this.db.query("SET LOCAL statement_timeout = '8s'");
      const value = await fn(); await this.db.query('COMMIT'); return value;
    } catch (e) { await this.db.query('ROLLBACK'); throw e; }
  }
  async one(sql, params = []) { return normalizeRow((await this.db.query(sql, params)).rows[0] || null); }
  checkTable(table) { if (!columns[table]) throw new AgentError('UNREGISTERED_RESOURCE', 'البيانات المطلوبة غير مدعومة.'); }
  async list(table, date) {
    this.checkTable(table);
    const orderColumn = table === 'water_logs' ? 'date' : 'created_at';
    return (await this.db.query(`SELECT * FROM public.${table} WHERE user_id=$1${date ? ' AND date=$2' : ''} ORDER BY ${orderColumn} DESC LIMIT 1000`, date ? [this.userId, date] : [this.userId])).rows.map(normalizeRow);
  }
  async get(table, id) {
    this.checkTable(table);
    const record = await this.one(`SELECT * FROM public.${table} WHERE user_id=$1 AND id=$2`, [this.userId, id]);
    if (!record) throw new AgentError('NOT_FOUND', 'السجل غير متاح لهذا الحساب.', 'resolveEntities', 404);
    return record;
  }
  async insert(table, values, id = randomUUID()) {
    this.checkTable(table); const keys = Object.keys(values);
    if (keys.some(k => !columns[table].includes(k))) throw new AgentError('INVALID_FIELDS', 'حقول غير مسموحة.');
    await this.db.query(`INSERT INTO public.${table} (id,user_id,${keys.join(',')}) VALUES ($1,$2,${keys.map((_, i) => '$' + (i + 3)).join(',')})`, [id, this.userId, ...keys.map(k => encode(k, values[k]))]);
    const after = await this.get(table, id); this.effects.push({ table, id, before: null, after }); return after;
  }
  async update(table, id, values) {
    const before = await this.get(table, id); const keys = Object.keys(values);
    if (!keys.length || keys.some(k => !columns[table].includes(k))) throw new AgentError('INVALID_FIELDS', 'حقول غير مسموحة.');
    await this.db.query(`UPDATE public.${table} SET ${keys.map((k, i) => `${k}=$${i + 3}`).join(',')} WHERE user_id=$1 AND id=$2`, [this.userId, id, ...keys.map(k => encode(k, values[k]))]);
    const after = await this.get(table, id); this.effects.push({ table, id, before, after }); return after;
  }
  async remove(table, id) {
    const before = await this.get(table, id);
    await this.db.query(`DELETE FROM public.${table} WHERE user_id=$1 AND id=$2`, [this.userId, id]);
    const remaining = await this.one(`SELECT id FROM public.${table} WHERE user_id=$1 AND id=$2`, [this.userId, id]);
    if (remaining) throw new AgentError('DELETE_FAILED', 'تعذر حذف السجل.');
    this.effects.push({ table, id, before, after: null }); return { ...before, deleted: true };
  }
  async water(a, add) {
    const day = a.date || this.today;
    const existing = await this.one('SELECT * FROM public.water_logs WHERE user_id=$1 AND date=$2 FOR UPDATE', [this.userId, day]);
    const total = (add ? existing?.consumed_ml || 0 : 0) + a.amountMl;
    if (total > 20000) throw new AgentError('WATER_RANGE', 'إجمالي الماء خارج النطاق المسموح.');
    const values = { date: day, consumed_ml: total, consumed_glasses: Math.round(total / 250), target_glasses: this.profile?.target_glasses || 10 };
    return existing ? this.update('water_logs', existing.id, values) : this.insert('water_logs', values);
  }
  async loadContext() {
    this.profile = await this.one('SELECT * FROM public.profiles WHERE id=$1', [this.userId]);
    if (!this.profile) throw new AgentError('PROFILE_REQUIRED', 'أكمل إعداد حسابك أولاً.', 'loadContext');
    const timezone = this.profile.timezone || 'Asia/Amman'; this.today = localDate(timezone);
    const state = await this.snapshot();
    return { ...state, timezone, currentDate: this.today };
  }
  async summary(date = this.today) {
    const row = await this.one('SELECT COALESCE(sum(calories),0) AS calories, COALESCE(sum(protein),0) AS protein, COALESCE(sum(carbs),0) AS carbs, COALESCE(sum(fats),0) AS fats FROM public.meal_logs WHERE user_id=$1 AND date=$2', [this.userId, date]);
    const water = await this.one('SELECT * FROM public.water_logs WHERE user_id=$1 AND date=$2', [this.userId, date]);
    const workouts = await this.list('workout_logs', date);
    const p = this.profile || {};
    return { date, calories: Number(row.calories), protein: Number(row.protein), carbs: Number(row.carbs), fats: Number(row.fats),
      targetCalories: p.target_calories, targetProtein: p.target_protein,
      remainingCalories: Math.max(0, p.target_calories - row.calories), remainingProtein: Math.max(0, p.target_protein - row.protein),
      waterMl: water?.consumed_ml || 0, targetWaterMl: Number(p.target_water_liters || 2.5) * 1000,
      remainingWaterMl: Math.max(0, Number(p.target_water_liters || 2.5) * 1000 - (water?.consumed_ml || 0)), workouts };
  }
  async snapshot() {
    const s = await this.summary();
    const weights = await this.list('inbody_records');
    const meals = await this.list('meal_logs');
    const waters = await this.list('water_logs');
    const workouts = await this.list('workout_logs');
    const latest = [...weights].sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.created_at).localeCompare(String(a.created_at)))[0];
    const days = new Map();
    const day = date => {
      const key = String(date).slice(0, 10);
      if (!days.has(key)) days.set(key, {
        date: key, calories: 0, protein: 0, carbs: 0, fats: 0,
        targetCalories: Number(this.profile?.target_calories) || 0,
        targetProtein: Number(this.profile?.target_protein) || 0,
        targetCarbs: Number(this.profile?.target_carbs) || 0,
        targetFats: Number(this.profile?.target_fats) || 0,
        consumedWaterLiters: 0,
        targetWaterLiters: Number(this.profile?.target_water_liters) || 2.5,
        consumedGlasses: 0,
        targetGlasses: Number(this.profile?.target_glasses) || 10,
        mealCount: 0, workoutCompleted: false, workoutTitle: ''
      });
      return days.get(key);
    };
    for (const meal of meals) {
      const item = day(meal.date);
      item.calories += Number(meal.calories) || 0;
      item.protein += Number(meal.protein) || 0;
      item.carbs += Number(meal.carbs) || 0;
      item.fats += Number(meal.fats) || 0;
      item.mealCount += 1;
    }
    for (const water of waters) Object.assign(day(water.date), {
      consumedWaterLiters: (Number(water.consumed_ml) || 0) / 1000,
      consumedGlasses: Number(water.consumed_glasses) || 0,
      targetGlasses: Number(water.target_glasses) || Number(this.profile?.target_glasses) || 10
    });
    for (const workout of workouts) {
      const item = day(workout.date);
      item.workoutCompleted ||= Boolean(workout.completed);
      if (!item.workoutTitle) item.workoutTitle = workout.workout_title || '';
    }
    for (const weight of weights) {
      const item = day(weight.date);
      if (!item.weightKg) item.weightKg = Number(weight.weight) || 0;
    }
    const dailyHistory = [...days.values()]
      .filter(item => item.date < this.today)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 365)
      .map(item => Object.fromEntries(Object.entries(item).map(([key, value]) => [key, typeof value === 'number' ? Math.round(value * 10) / 10 : value])));
    return {
      today: { date: this.today, consumedCalories: s.calories, consumedProtein: s.protein, consumedCarbs: s.carbs, consumedFats: s.fats,
        targetCalories: s.targetCalories, targetProtein: s.targetProtein, consumedWaterLiters: s.waterMl / 1000, consumedGlasses: Math.round(s.waterMl / 250), targetWaterLiters: s.targetWaterMl / 1000, isWorkoutCompleted: s.workouts.some(w => w.completed) },
      loggedMeals: meals.map(m => ({ ...m, protein: Number(m.protein), carbs: Number(m.carbs), fats: Number(m.fats), titleAr: m.name, mealType: m.meal_type, time: new Date(m.created_at).toLocaleTimeString('ar-JO', { timeZone: this.profile?.timezone || 'Asia/Amman' }) })),
      dailyHistory,
      weightHistory: weights.map(w => ({ ...w, weightKg: Number(w.weight), timestamp: w.created_at })),
      userProfile: { currentWeight: Number(latest?.weight || this.profile?.current_weight), timezone: this.profile?.timezone || 'Asia/Amman' },
      workoutHistory: workouts.map(w => ({ ...w, title: w.workout_title, dateLabel: String(w.date), durationMinutes: w.duration_minutes, totalVolumeKg: Number(w.total_volume_kg), totalSets: (w.exercises || []).reduce((sum, e) => sum + (e.sets || 0), 0), exercises: (w.exercises || []).map(e => ({ ...e, nameAr: e.nameAr || e.name })) })),
      shoppingList: (await this.list('shopping_items')).map(i => ({ ...i, name: i.item_name, category: i.category || 'other', quantity: i.quantity || '', checked: i.is_completed, completed: i.is_completed }))
    };
  }
  async thread(id) {
    // The unique thread ID prevents claiming another owner's thread, even with RLS.
    await this.db.query('INSERT INTO public.neon_threads(id,user_id) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [id, this.userId]);
    const row = await this.one('SELECT * FROM public.neon_threads WHERE id=$1 AND user_id=$2', [id, this.userId]);
    if (!row) throw new AgentError('THREAD_FORBIDDEN', 'هذه المحادثة غير متاحة لهذا الحساب.', 'authenticate', 403);
    return row;
  }
  async request(id) { return this.one('SELECT * FROM public.neon_requests WHERE user_id=$1 AND request_id=$2', [this.userId, id]); }
  async saveRequest(req, hash, response, execution = null) {
    await this.db.query('INSERT INTO public.neon_requests(user_id,request_id,thread_id,input_hash,response,execution,effects) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id,request_id) DO UPDATE SET response=EXCLUDED.response, execution=COALESCE(EXCLUDED.execution,neon_requests.execution)',
      [this.userId, req.requestId, req.threadId, hash, response && JSON.stringify(response), execution && JSON.stringify(execution), JSON.stringify(this.effects)]);
  }
  async saveThread(id, messages, pending, summary) {
    await this.db.query('UPDATE public.neon_threads SET messages=$3,pending=$4,summary=$5,updated_at=now() WHERE id=$1 AND user_id=$2', [id, this.userId, JSON.stringify(messages), pending && JSON.stringify(pending), summary]);
  }
  async undo() {
    const last = await this.one("SELECT * FROM public.neon_requests WHERE user_id=$1 AND undone=false AND jsonb_array_length(effects)>0 ORDER BY created_at DESC LIMIT 1 FOR UPDATE", [this.userId]);
    if (!last) throw new AgentError('NOTHING_TO_UNDO', 'لا توجد عملية قابلة للتراجع.');
    for (const effect of [...last.effects].reverse()) {
      this.checkTable(effect.table);
      const current = await this.one(`SELECT * FROM public.${effect.table} WHERE user_id=$1 AND id=$2`, [this.userId, effect.id]);
      const same = (a, b) => isDeepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
      if (!same(current, effect.after)) throw new AgentError('UNDO_CONFLICT', 'تغيّر السجل بعد العملية؛ لا يمكن التراجع تلقائياً.');
      if (!effect.before) await this.remove(effect.table, effect.id);
      else {
        const values = Object.fromEntries(columns[effect.table].filter(k => effect.before[k] !== undefined).map(k => [k, effect.before[k]]));
        if (current) await this.update(effect.table, effect.id, values); else await this.insert(effect.table, values, effect.id);
      }
    }
    this.effects = []; // An undo cannot itself be selected as the next undo operation.
    await this.db.query('UPDATE public.neon_requests SET undone=true WHERE user_id=$1 AND request_id=$2', [this.userId, last.request_id]);
    return { undoneRequestId: last.request_id };
  }
}
