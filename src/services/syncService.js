import { supabase } from './supabaseClient.js';
import { cleanSnapshot } from '../state/initialState.js';
import { exportAccountStorage, selectStorageAccount } from './accountStorage.js';

export class SyncService {
  constructor(client = supabase) {
    this.client = client;
    this.userId = null;
    this.revision = 0;
    this.dirty = false;
    this.status = 'idle';
    this.listeners = new Set();
  }
  setStore(store) { this.store = store; }
  getStore() { return this.store; }
  subscribe(callback) { this.listeners.add(callback); return () => this.listeners.delete(callback); }
  setStatus(status) { this.status = status; for (const callback of this.listeners) callback(status); }
  stop() {
    this.userId = null;
    clearTimeout(this.timer);
    clearInterval(this.poller);
    this.dirty = false;
    this.setStatus('idle');
  }
  async loadUserData(userId) {
    this.stop();
    this.userId = userId;
    this.revision = 0;
    try {
      const [{ data: row, error }, { data: profile, error: profileError }] = await Promise.all([
        this.client.from('user_state').select('payload,revision').eq('user_id', userId).maybeSingle(),
        this.client.from('profiles').select('*').eq('id', userId).single(),
      ]);
      if (error || profileError) throw error || profileError;
      if (this.userId !== userId) return { success: false };
      if (row) {
        this.revision = row.revision;
        selectStorageAccount(userId, row.payload.auxiliary || {});
        this.store.applySnapshot(row.payload);
      } else {
        // Import existing cloud records once, never the unowned demo cache.
        Object.assign(this.store.state.userProfile, {
          name: profile.name, email: profile.email, age: profile.age, gender: profile.gender,
          height: profile.height, currentWeight: profile.current_weight, targetWeight: profile.target_weight,
          goal: profile.fitness_goal, activityLevel: profile.activity_level,
          onboardingCompleted: !!profile.onboarding_completed,
        });
        for (const [key, column] of Object.entries({ targetCalories: 'target_calories', targetProtein: 'target_protein', targetCarbs: 'target_carbs', targetFats: 'target_fats', targetWaterLiters: 'target_water_liters', targetGlasses: 'target_glasses' })) {
          if (profile[column] != null) this.store.state.today[key] = Number(profile[column]);
        }
        const date = this.store.state.today.date;
        const [meals, water] = await Promise.all([
          this.client.from('meal_logs').select('*').eq('user_id', userId).eq('date', date),
          this.client.from('water_logs').select('*').eq('user_id', userId).eq('date', date).maybeSingle(),
        ]);
        if (meals.error || water.error) throw meals.error || water.error;
        if (this.userId !== userId) return { success: false };
        this.store.state.loggedMeals = meals.data.map(meal => ({ ...meal, titleAr: meal.name }));
        this.store.recalculateDailyNutrition();
        if (water.data) Object.assign(this.store.state.today, { consumedGlasses: water.data.consumed_glasses, consumedWaterLiters: water.data.consumed_ml / 1000 });
      }
      this.setStatus('saved');
      this.poller = setInterval(() => this.refresh(), 30000);
      this.poller.unref?.();
      return { success: true };
    } catch (error) {
      this.setStatus('error');
      return { success: false, error: error.message };
    }
  }
  snapshot() { return { ...cleanSnapshot(this.store.getState()), auxiliary: exportAccountStorage() }; }
  schedule() {
    if (!this.userId) return;
    this.dirty = true;
    if (this.status === 'conflict') return;
    this.setStatus('pending');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 500);
  }
  async flush() {
    clearTimeout(this.timer);
    if (this.inflight) {
      await this.inflight;
      return this.dirty ? this.flush() : { success: this.status !== 'error' && this.status !== 'conflict' };
    }
    if (this.status === 'conflict') return { success: false, conflict: true };
    if (!this.userId || !this.dirty) return { success: true };
    const userId = this.userId;
    const payload = this.snapshot();
    this.dirty = false;
    this.setStatus('saving');
    this.inflight = (async () => {
      try {
        const { data, error } = await this.client.rpc('save_user_state', { payload, expected_revision: this.revision });
        if (error) throw error;
        if (this.userId !== userId) return { success: false };
        this.revision = data;
        this.setStatus(this.dirty ? 'pending' : 'saved');
        return { success: true };
      } catch (error) {
        if (this.userId === userId) {
          this.dirty = true;
          this.setStatus(error.code === '40001' ? 'conflict' : 'error');
        }
        return { success: false, error: error.message };
      }
    })();
    try { return await this.inflight; }
    finally { this.inflight = null; }
  }
  async refresh() {
    if (!this.userId || this.inflight || this.status === 'conflict') return;
    if (this.dirty) { await this.flush(); return; }
    const userId = this.userId;
    const { data, error } = await this.client.from('user_state').select('payload,revision').eq('user_id', userId).maybeSingle();
    if (error || this.userId !== userId || this.dirty || !data || data.revision === this.revision) return;
    // Do not replace active form input when a different device changes data.
    if (typeof document !== 'undefined' && document.activeElement?.matches('input,textarea,select')) return;
    this.revision = data.revision;
    selectStorageAccount(userId, data.payload.auxiliary || {});
    this.store.applySnapshot(data.payload);
  }
  async reloadRemote() {
    if (!this.userId) return;
    const result = await this.loadUserData(this.userId);
    this.store.notify();
    return result;
  }
}
export const syncService = new SyncService();
