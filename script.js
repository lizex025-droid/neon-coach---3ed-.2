// links array (edit defaults here)
const defaultLinks = [
  { id: "lnk-1", title: "منصة الدورات", url: "https://example.com" }
];

// sounds array (edit sources here)
const sounds = [
 
];

// YouTube links (edit here)
const ytVideos = [
  { title: "Focus Stream 1", url: "https://www.youtube.com/watch?v=vLEek3I3wac&t=6s" },
  { title: "Study Beats", url: "https://www.youtube.com/watch?v=lkkGlVWvkLk" },
  { title: "Focus Stream 2", url: "https://www.youtube.com/watch?v=vLEek3I3wac" },
  { title: "Deep Focus Mix", url: "https://www.youtube.com/watch?v=74cOUSKXMz0&t=4095s" }
];

// default timer durations (edit minutes here)
const defaultTimerMinutes = 25;

const storageKeys = {
  tasks: "prod_tasks",
  notes: "prod_notes",
  links: "prod_links",
  timer: "prod_timer_state",
  stats: "prod_timer_stats",
  sound: "prod_sound_state",
  login: "prod_login_state"
};

const loginCredentials = {
  email: "ahedbsaisoh@gmail.com",
  password: "Tybs@297"
};

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const app = document.getElementById("app");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const progressText = document.getElementById("progressText");
const filters = document.getElementById("filters");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");

const linkTitle = document.getElementById("linkTitle");
const linkUrl = document.getElementById("linkUrl");
const addLinkBtn = document.getElementById("addLinkBtn");
const linksList = document.getElementById("linksList");

const soundList = document.getElementById("soundList");
const volumeSlider = document.getElementById("volume");
const loopToggle = document.getElementById("loopToggle");

const ytList = document.getElementById("ytList");
const ytPlay = document.getElementById("ytPlay");
const ytPause = document.getElementById("ytPause");
const ytStop = document.getElementById("ytStop");
const ytVolume = document.getElementById("ytVolume");
const ytStatus = document.getElementById("ytStatus");

const timerDisplay = document.getElementById("timerDisplay");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const plus5Btn = document.getElementById("plus5Btn");
const plus10Btn = document.getElementById("plus10Btn");
const focusedMinutes = document.getElementById("focusedMinutes");
const sessionsCount = document.getElementById("sessionsCount");
const baseDocumentTitle = document.title;

let tasks = loadFromStorage(storageKeys.tasks, []);
let notes = loadFromStorage(storageKeys.notes, []);
let links = loadFromStorage(storageKeys.links, defaultLinks);
let currentFilter = "active";
let openNoteId = null;

let timerState = loadFromStorage(storageKeys.timer, {
  running: false,
  remaining: defaultTimerMinutes * 60,
  duration: defaultTimerMinutes * 60,
  started: false,
  endTime: null
});

// ترقية حالة المؤقت المحفوظة قبل إضافة مدة الجلسة الفعلية.
if (!Number.isFinite(timerState.duration)) {
  timerState.duration = Math.max(defaultTimerMinutes * 60, timerState.remaining || 0);
}
if (typeof timerState.started !== "boolean") {
  timerState.started = Boolean(
    timerState.running || timerState.remaining !== defaultTimerMinutes * 60
  );
}

let statsState = loadFromStorage(storageKeys.stats, {
  focusedMinutes: 0,
  sessions: 0
});

let soundState = loadFromStorage(storageKeys.sound, {
  activeId: null,
  volume: 0.6,
  loop: false
});

let timerInterval = null;
let audioMap = new Map();
let ytPlayer = null;
let ytApiReady = false;
let ytPendingVideoId = null;
let ytSelectedVideoId = null;
let ytAutoPlay = false;

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLoginState(isLoggedIn) {
  localStorage.setItem(storageKeys.login, JSON.stringify(isLoggedIn));
  if (isLoggedIn) {
    loginScreen.classList.add("hidden");
    app.classList.remove("is-locked");
  } else {
    loginScreen.classList.remove("hidden");
    app.classList.add("is-locked");
  }
}

function hydrateLoginState() {
  const saved = loadFromStorage(storageKeys.login, false);
  setLoginState(Boolean(saved));
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (email === loginCredentials.email && password === loginCredentials.password) {
    loginError.textContent = "";
    loginForm.reset();
    setLoginState(true);
    return;
  }
  loginError.textContent = "بيانات الدخول غير صحيحة. حاول مرة أخرى.";
}

function renderTasks() {
  taskList.innerHTML = "";
  const filtered = tasks.filter((task) => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });

  filtered.forEach((task) => {
    const row = document.createElement("div");
    row.className = "task-item";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => removeTask(task.id));

    const title = document.createElement("div");
    title.className = "task-title" + (task.done ? " done" : "");
    title.textContent = task.title;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    row.append(deleteBtn, title, checkbox);
    taskList.appendChild(row);
  });

  updateProgress();
}

function updateProgress() {
  const completed = tasks.filter((task) => task.done).length;
  progressText.textContent = `Progress: ${completed} of ${tasks.length} completed`;
}

function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;
  tasks.unshift({ id: `task-${Date.now()}`, title, done: false });
  taskInput.value = "";
  saveToStorage(storageKeys.tasks, tasks);
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  saveToStorage(storageKeys.tasks, tasks);
  renderTasks();
}

function removeTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveToStorage(storageKeys.tasks, tasks);
  renderTasks();
}

function renderNotes() {
  notesList.innerHTML = "";

  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "notes-empty";
    empty.textContent = "لا توجد ملاحظات بعد.";
    notesList.appendChild(empty);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("article");
    const isOpen = note.id === openNoteId;
    item.className = `note-item${isOpen ? " open" : ""}`;

    const row = document.createElement("div");
    row.className = "note-row";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "note-toggle";
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-controls", `note-content-${note.id}`);
    toggle.addEventListener("click", () => toggleNote(note.id));

    const title = document.createElement("span");
    title.className = "note-title";
    title.textContent = note.title;

    const arrow = document.createElement("span");
    arrow.className = "note-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";
    toggle.append(title, arrow);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "note-delete";
    deleteButton.setAttribute("aria-label", `حذف ملاحظة ${note.title}`);
    deleteButton.title = "حذف الملاحظة";
    deleteButton.textContent = "حذف";
    deleteButton.addEventListener("click", () => removeNote(note.id));

    const content = document.createElement("textarea");
    content.id = `note-content-${note.id}`;
    content.className = "note-content";
    content.dir = "auto";
    content.placeholder = "اكتب ملاحظتك هنا...";
    content.value = note.content;
    content.addEventListener("input", (event) => updateNoteContent(note.id, event.target.value));
    content.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      updateNoteContent(note.id, content.value);
      openNoteId = null;
      renderNotes();
    });

    row.append(toggle, deleteButton);
    item.append(row, content);
    notesList.appendChild(item);
  });
}

function addNote() {
  const enteredName = window.prompt("اكتب اسم الملاحظة:");
  if (enteredName === null) return;

  const title = enteredName.trim();
  if (!title) {
    window.alert("يجب كتابة اسم للملاحظة.");
    return;
  }

  const note = {
    id: `note-${Date.now()}`,
    title,
    content: ""
  };

  notes.unshift(note);
  openNoteId = note.id;
  saveToStorage(storageKeys.notes, notes);
  renderNotes();

  const content = document.getElementById(`note-content-${note.id}`);
  if (content) content.focus();
}

function toggleNote(id) {
  openNoteId = openNoteId === id ? null : id;
  renderNotes();

  if (openNoteId) {
    const content = document.getElementById(`note-content-${openNoteId}`);
    if (content) content.focus();
  }
}

function updateNoteContent(id, content) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;
  note.content = content;
  saveToStorage(storageKeys.notes, notes);
}

function removeNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note || !window.confirm(`حذف ملاحظة «${note.title}»؟`)) return;

  notes = notes.filter((item) => item.id !== id);
  if (openNoteId === id) openNoteId = null;
  saveToStorage(storageKeys.notes, notes);
  renderNotes();
}

// تذكيرات المهام المنفصلة أسفل الملاحظات.
(function initializeTaskReminders() {
  const reminderNameInput = document.getElementById("taskReminderName");
  const reminderTimeInput = document.getElementById("taskReminderTime");
  const addReminderButton = document.getElementById("addTaskReminder");
  const remindersList = document.getElementById("tasksReminderList");

  if (!reminderNameInput || !reminderTimeInput || !addReminderButton || !remindersList) return;

  const remindersKey = "tasks_reminder_separate_list_v3";
  const maximumTimeout = 2_147_000_000;
  const TELEGRAM_BOT_TOKEN = "7938575887:AAHdajmPQMC5QFnaWnFMFyERQUKHH3XiXYU";
  const TELEGRAM_CHAT_ID = "7706605238";
  let reminders = [];
  let reminderTimers = [];

  function loadReminders() {
    try {
      const saved = JSON.parse(localStorage.getItem(remindersKey));
      reminders = Array.isArray(saved) ? saved : [];
    } catch {
      reminders = [];
    }

    reminders = reminders.map((item) => ({
      ...item,
      sent: item.sent || { five: false, two: false, exact: false }
    }));
  }

  function saveReminders() {
    localStorage.setItem(remindersKey, JSON.stringify(reminders));
  }

  async function sendTelegramMessage(text) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
        }
      );

      return response.ok;
    } catch (error) {
      console.error("تعذر إرسال تذكير Telegram:", error);
      return false;
    }
  }

  function parseReminderTime(value) {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  function formatDateTime(value) {
    const timestamp = parseReminderTime(value);
    if (timestamp === null) return "وقت غير صالح";
    return new Date(timestamp).toLocaleString("ar-JO", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  function getStatus(reminder) {
    const target = parseReminderTime(reminder.time);
    if (target === null) return "وقت غير صالح";

    const difference = target - Date.now();
    if (difference <= 0) return "انتهى الوقت";

    const totalMinutes = Math.ceil(difference / 60_000);
    if (totalMinutes < 60) return `باقي ${totalMinutes} دقيقة`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `باقي ${hours} ساعة و${minutes} دقيقة` : `باقي ${hours} ساعة`;
  }

  async function addReminder() {
    const name = reminderNameInput.value.trim();
    const time = reminderTimeInput.value;
    const target = parseReminderTime(time);

    if (!name) {
      reminderNameInput.focus();
      reminderNameInput.placeholder = "اكتب اسم المهمة أولًا";
      return;
    }

    if (target === null || target <= Date.now()) {
      reminderTimeInput.focus();
      window.alert("اختر وقتًا صحيحًا في المستقبل.");
      return;
    }

    reminders.unshift({
      id: `reminder-${Date.now()}`,
      name,
      time,
      sent: { five: false, two: false, exact: false },
      createdAt: new Date().toISOString()
    });

    reminderNameInput.value = "";
    reminderNameInput.placeholder = "اسم المهمة";
    reminderTimeInput.value = "";
    saveReminders();
    renderReminders();
    scheduleReminders();
  }

  function deleteReminder(id) {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder || !window.confirm(`حذف تذكير «${reminder.name}»؟`)) return;

    reminders = reminders.filter((item) => item.id !== id);
    saveReminders();
    renderReminders();
    scheduleReminders();
  }

  function reactivateReminder(id) {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return;

    reminder.sent = { five: false, two: false, exact: false };
    saveReminders();
    renderReminders();
    scheduleReminders();
  }

  function clearReminderTimers() {
    reminderTimers.forEach((timer) => clearTimeout(timer));
    reminderTimers = [];
  }

  function scheduleReminders() {
    clearReminderTimers();

    reminders.forEach((reminder) => {
      const target = parseReminderTime(reminder.time);
      if (target === null) return;

      if (target <= Date.now()) {
        if (!reminder.sent?.exact) void fireReminder(reminder.id, "exact");
        return;
      }

      scheduleOne(reminder.id, "five", target - 5 * 60_000);
      scheduleOne(reminder.id, "two", target - 2 * 60_000);
      scheduleOne(reminder.id, "exact", target);
    });
  }

  function scheduleOne(id, type, fireAt) {
    const delay = fireAt - Date.now();
    if (delay <= 0) {
      void fireReminder(id, type);
      return;
    }

    // setTimeout لا يدعم مددًا أطول من نحو 24.8 يومًا؛ الفحص الدوري سيجدها لاحقًا.
    if (delay > maximumTimeout) return;
    reminderTimers.push(setTimeout(() => void fireReminder(id, type), delay));
  }

  async function fireReminder(id, type) {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return;

    reminder.sent = reminder.sent || { five: false, two: false, exact: false };
    if (reminder.sent[type]) return;

    const target = parseReminderTime(reminder.time);
    if (target === null) return;

    const thresholds = {
      five: target - 5 * 60_000,
      two: target - 2 * 60_000,
      exact: target
    };
    if (Date.now() < thresholds[type] - 15_000) return;

    const timingLabels = {
      five: "باقي 5 دقائق على الموعد",
      two: "باقي دقيقتان على الموعد",
      exact: "حان وقت المهمة الآن"
    };
    const telegramMessage = [
      "⏰ تذكير المهام",
      `📝 المهمة: ${reminder.name}`,
      `⏳ التنبيه: ${timingLabels[type]}`
    ].join("\n");

    const delivered = await sendTelegramMessage(telegramMessage);
    if (!delivered) return;

    reminder.sent[type] = true;
    saveReminders();
    renderReminders();
  }

  function renderReminders() {
    remindersList.innerHTML = "";

    if (reminders.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-reminder-list";
      empty.textContent = "لا توجد تذكيرات بعد. أضف اسم المهمة والوقت.";
      remindersList.appendChild(empty);
      return;
    }

    reminders.forEach((reminder) => {
      const card = document.createElement("article");
      card.className = "reminder-card";

      const top = document.createElement("div");
      top.className = "reminder-card-top";

      const details = document.createElement("div");
      const name = document.createElement("div");
      name.className = "reminder-name";
      name.textContent = reminder.name;

      const time = document.createElement("div");
      time.className = "reminder-time";
      time.textContent = formatDateTime(reminder.time);
      details.append(name, time);

      const status = document.createElement("div");
      status.className = "reminder-status";
      const target = parseReminderTime(reminder.time);
      if (target !== null && target <= Date.now()) status.classList.add("is-past");
      status.textContent = getStatus(reminder);
      top.append(details, status);

      const actions = document.createElement("div");
      actions.className = "reminder-actions";

      const resetButton = document.createElement("button");
      resetButton.type = "button";
      resetButton.className = "ghost";
      resetButton.textContent = "إعادة التفعيل";
      resetButton.addEventListener("click", () => reactivateReminder(reminder.id));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "danger";
      deleteButton.textContent = "حذف";
      deleteButton.addEventListener("click", () => deleteReminder(reminder.id));

      actions.append(resetButton, deleteButton);
      card.append(top, actions);
      remindersList.appendChild(card);
    });
  }

  addReminderButton.addEventListener("click", () => void addReminder());
  reminderNameInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void addReminder();
  });

  loadReminders();
  renderReminders();
  scheduleReminders();

  window.setInterval(() => {
    renderReminders();
    scheduleReminders();
  }, 30_000);
})();

function bindFilters() {
  filters.addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    Array.from(filters.children).forEach((pill) => pill.classList.remove("active"));
    btn.classList.add("active");
    renderTasks();
  });
}

function renderLinks() {
  linksList.innerHTML = "";
  links.forEach((link) => {
    const row = document.createElement("div");
    row.className = "link-item";

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.textContent = link.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", () => removeLink(link.id));

    row.append(anchor, deleteBtn);
    linksList.appendChild(row);
  });
}

function addLink() {
  const title = linkTitle.value.trim();
  const url = linkUrl.value.trim();
  if (!title || !url) return;
  links.unshift({ id: `link-${Date.now()}`, title, url });
  linkTitle.value = "";
  linkUrl.value = "";
  saveToStorage(storageKeys.links, links);
  renderLinks();
}

function removeLink(id) {
  links = links.filter((link) => link.id !== id);
  saveToStorage(storageKeys.links, links);
  renderLinks();
}

function renderSounds() {
  soundList.innerHTML = "";
  sounds.forEach((sound) => {
    const item = document.createElement("div");
    item.className = "sound-item";
    item.dataset.id = sound.id;

    const info = document.createElement("div");
    info.className = "sound-info";

    const title = document.createElement("div");
    title.className = "sound-title";
    title.textContent = sound.title;

    const desc = document.createElement("div");
    desc.className = "sound-desc";
    desc.textContent = sound.desc;

    info.append(title, desc);

    const actions = document.createElement("div");
    actions.className = "sound-actions";

    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.textContent = "Play";
    playBtn.addEventListener("click", () => toggleSound(sound.id));

    const icon = document.createElement("div");
    icon.className = "sound-icon";
    icon.textContent = sound.icon;

    actions.append(playBtn, icon);
    item.append(info, actions);
    soundList.appendChild(item);

    const audio = new Audio(sound.url);
    audio.loop = soundState.loop;
    audio.volume = soundState.volume;
    audioMap.set(sound.id, { audio, playBtn, item });
  });

  if (soundState.activeId) {
    const active = audioMap.get(soundState.activeId);
    if (active) {
      active.item.classList.add("active");
      active.playBtn.textContent = "Pause";
    }
  }
}

function stopAllSounds() {
  audioMap.forEach((entry) => {
    entry.audio.pause();
    entry.audio.currentTime = 0;
    entry.item.classList.remove("active");
    entry.playBtn.textContent = "Play";
  });
}

function toggleSound(id) {
  const entry = audioMap.get(id);
  if (!entry) return;

  if (entry.audio.paused) {
    stopAllSounds();
    entry.audio.play();
    entry.item.classList.add("active");
    entry.playBtn.textContent = "Pause";
    soundState.activeId = id;
  } else {
    entry.audio.pause();
    entry.item.classList.remove("active");
    entry.playBtn.textContent = "Play";
    soundState.activeId = null;
  }
  saveToStorage(storageKeys.sound, soundState);
}

function bindSoundControls() {
  volumeSlider.value = soundState.volume;
  loopToggle.checked = soundState.loop;

  volumeSlider.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    soundState.volume = value;
    audioMap.forEach((entry) => {
      entry.audio.volume = value;
    });
    saveToStorage(storageKeys.sound, soundState);
  });

  loopToggle.addEventListener("change", (event) => {
    soundState.loop = event.target.checked;
    audioMap.forEach((entry) => {
      entry.audio.loop = soundState.loop;
    });
    saveToStorage(storageKeys.sound, soundState);
  });
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  const paramMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  return paramMatch ? paramMatch[1] : null;
}

function loadYouTubeApi() {
  if (ytApiReady) return;
  if (window.YT && window.YT.Player) {
    ytApiReady = true;
    return;
  }
  if (document.getElementById("yt-iframe-api")) return;
  const tag = document.createElement("script");
  tag.id = "yt-iframe-api";
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true;
    if (ytPendingVideoId) {
      createYouTubePlayer(ytPendingVideoId, ytAutoPlay);
      ytPendingVideoId = null;
    }
  };
}

function destroyYouTubePlayer() {
  if (ytPlayer && ytPlayer.destroy) {
    ytPlayer.destroy();
  }
  ytPlayer = null;
}

function getSelectedYouTubeItem() {
  return ytVideos.find((item) => extractYouTubeId(item.url) === ytSelectedVideoId) || null;
}

function updateYouTubeMediaSession(playbackState = "none") {
  if (!("mediaSession" in navigator)) return;

  const selectedItem = getSelectedYouTubeItem();
  if (selectedItem && "MediaMetadata" in window) {
    const iconUrl =
      document.querySelector('link[rel="apple-touch-icon"]')?.href ||
      document.querySelector('link[rel="icon"]')?.href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: selectedItem.title,
      artist: "لوحة الإنتاجية",
      album: "أصوات التركيز",
      artwork: iconUrl ? [{ src: iconUrl, sizes: "180x180", type: "image/png" }] : []
    });
  }

  try {
    navigator.mediaSession.playbackState = playbackState;
  } catch {
    // بعض المتصفحات القديمة لا تدعم تحديث playbackState.
  }
}

function configureYouTubeMediaSession() {
  if (!("mediaSession" in navigator)) return;

  const handlers = {
    play: playYouTubeAudio,
    pause: pauseYouTubeAudio,
    stop: stopYouTubeAudio,
    seekbackward: (details) => {
      if (!ytPlayer?.getCurrentTime || !ytPlayer?.seekTo) return;
      ytPlayer.seekTo(Math.max(0, ytPlayer.getCurrentTime() - (details.seekOffset || 10)), true);
    },
    seekforward: (details) => {
      if (!ytPlayer?.getCurrentTime || !ytPlayer?.seekTo) return;
      ytPlayer.seekTo(ytPlayer.getCurrentTime() + (details.seekOffset || 10), true);
    }
  };

  Object.entries(handlers).forEach(([action, handler]) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // تجاهل الأوامر غير المدعومة في المتصفح الحالي.
    }
  });
}

function createYouTubePlayer(videoId, shouldPlay) {
  destroyYouTubePlayer();
  ytSelectedVideoId = videoId;
  ytPlayer = new YT.Player("ytPlayer", {
    height: "1",
    width: "1",
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      loop: 1,
      playlist: videoId,
      modestbranding: 1,
      playsinline: 1
    },
    events: {
      onReady: (event) => {
        event.target.mute();
        event.target.setVolume(Number(ytVolume.value));
        updateYouTubeMediaSession("paused");
        if (shouldPlay) {
          event.target.unMute();
          event.target.playVideo();
        }
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) {
          ytStatus.textContent = "الصوت يعمل في الخلفية";
          updateYouTubeMediaSession("playing");
        } else if (event.data === YT.PlayerState.PAUSED) {
          ytStatus.textContent = "الصوت متوقف مؤقتًا";
          updateYouTubeMediaSession("paused");
        } else if (event.data === YT.PlayerState.ENDED) {
          ytStatus.textContent = "انتهى الصوت";
          updateYouTubeMediaSession("none");
        }
      }
    }
  });
}

function renderYouTubeList() {
  ytList.innerHTML = "";
  ytVideos.forEach((item, index) => {
    const videoId = extractYouTubeId(item.url);
    const row = document.createElement("div");
    row.className = "yt-item";
    row.dataset.videoId = videoId || "";
    row.innerHTML = `<span>${item.title}</span><span>#${index + 1}</span>`;
    row.addEventListener("click", () => selectYouTubeVideo(item.url, true));
    ytList.appendChild(row);
  });
}

function selectYouTubeVideo(url, autoPlay) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return;
  ytAutoPlay = autoPlay;
  Array.from(ytList.children).forEach((item) => {
    item.classList.toggle("active", item.dataset.videoId === videoId);
  });
  if (!ytApiReady) {
    ytPendingVideoId = videoId;
    loadYouTubeApi();
    return;
  }
  createYouTubePlayer(videoId, autoPlay);
}

function playYouTubeAudio() {
  if (!ytSelectedVideoId && ytVideos.length) {
    selectYouTubeVideo(ytVideos[0].url, true);
    return;
  }
  if (!ytPlayer) return;
  ytPlayer.unMute();
  ytPlayer.playVideo();
  ytStatus.textContent = "جارٍ تشغيل الصوت...";
  updateYouTubeMediaSession("playing");
}

function pauseYouTubeAudio() {
  if (!ytPlayer) return;
  ytPlayer.pauseVideo();
  ytStatus.textContent = "الصوت متوقف مؤقتًا";
  updateYouTubeMediaSession("paused");
}

function stopYouTubeAudio() {
  if (!ytPlayer) return;
  ytPlayer.stopVideo();
  ytStatus.textContent = "تم إيقاف الصوت";
  updateYouTubeMediaSession("none");
}

function setYouTubeVolume(value) {
  if (!ytPlayer) return;
  ytPlayer.setVolume(value);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
}

function renderTimer() {
  const formattedTime = formatTime(timerState.remaining);
  timerDisplay.textContent = formattedTime;
  startPauseBtn.textContent = timerState.running ? "Pause" : "Start";
  document.title = timerState.running
    ? `${formattedTime} • ${baseDocumentTitle}`
    : timerState.started
      ? `⏸ ${formattedTime} • ${baseDocumentTitle}`
      : baseDocumentTitle;
}

function updateStatsDisplay() {
  focusedMinutes.textContent = `${statsState.focusedMinutes}m`;
  sessionsCount.textContent = statsState.sessions;
}

function startTimer() {
  if (timerState.running) return;
  timerState.running = true;
  timerState.started = true;
  timerState.endTime = Date.now() + timerState.remaining * 1000;
  saveToStorage(storageKeys.timer, timerState);
  renderTimer();
  runTimer();
}

function pauseTimer() {
  timerState.running = false;
  timerState.remaining = Math.max(0, Math.floor((timerState.endTime - Date.now()) / 1000));
  timerState.endTime = null;
  saveToStorage(storageKeys.timer, timerState);
  clearInterval(timerInterval);
  renderTimer();
}

function resetTimer() {
  timerState = {
    running: false,
    remaining: defaultTimerMinutes * 60,
    duration: defaultTimerMinutes * 60,
    started: false,
    endTime: null
  };
  saveToStorage(storageKeys.timer, timerState);
  clearInterval(timerInterval);
  renderTimer();
}

function addMinutes(minutes) {
  timerState.remaining += minutes * 60;
  timerState.duration += minutes * 60;
  if (timerState.running) {
    timerState.endTime = Date.now() + timerState.remaining * 1000;
  }
  saveToStorage(storageKeys.timer, timerState);
  renderTimer();
}

function finishSession() {
  const completedMinutes = Math.round(timerState.duration / 60);

  timerState.running = false;
  timerState.remaining = defaultTimerMinutes * 60;
  timerState.duration = defaultTimerMinutes * 60;
  timerState.started = false;
  timerState.endTime = null;

  statsState.sessions += 1;
  statsState.focusedMinutes += completedMinutes;
  saveToStorage(storageKeys.stats, statsState);
  saveToStorage(storageKeys.timer, timerState);
  updateStatsDisplay();
  renderTimer();
}

function runTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((timerState.endTime - Date.now()) / 1000));
    timerState.remaining = remaining;
    renderTimer();
    saveToStorage(storageKeys.timer, timerState);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      finishSession();
    }
  }, 1000);
}

function restoreTimer() {
  if (timerState.running && timerState.endTime) {
    const remaining = Math.max(0, Math.floor((timerState.endTime - Date.now()) / 1000));
    timerState.remaining = remaining;
    if (remaining <= 0) {
      finishSession();
      return;
    }
    runTimer();
  }
  renderTimer();
}

addTaskBtn.addEventListener("click", addTask);
addNoteBtn.addEventListener("click", addNote);

addLinkBtn.addEventListener("click", addLink);

startPauseBtn.addEventListener("click", () => {
  if (timerState.running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener("click", resetTimer);
plus5Btn.addEventListener("click", () => addMinutes(5));
plus10Btn.addEventListener("click", () => addMinutes(10));

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});

linkUrl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addLink();
});

ytPlay.addEventListener("click", playYouTubeAudio);
ytPause.addEventListener("click", pauseYouTubeAudio);
ytStop.addEventListener("click", stopYouTubeAudio);
ytVolume.addEventListener("input", (event) => {
  setYouTubeVolume(Number(event.target.value));
});

loginForm.addEventListener("submit", handleLoginSubmit);

hydrateLoginState();

renderTasks();
renderNotes();
renderLinks();
renderSounds();
renderYouTubeList();
configureYouTubeMediaSession();
bindFilters();
bindSoundControls();
updateStatsDisplay();
restoreTimer();
