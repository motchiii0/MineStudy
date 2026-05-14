// ══════════════════════════════════════════
//   StudyCheck - app.js
//   純粋なJavaScript（ReactなしのVanilla JS）
// ══════════════════════════════════════════

// ─── デフォルト科目データ ──────────────────────────────────────
const DEFAULT_SUBJECTS = [
{ id: 1,  name: "数学", color: "#FF6B6B", bg: "#FFF0F0", enabled: true },
{ id: 2,  name: "英語", color: "#4ECDC4", bg: "#F0FFFE", enabled: true },
{ id: 3,  name: "国語", color: "#FFD93D", bg: "#FFFBF0", enabled: true },
{ id: 4,  name: "理科", color: "#6BCB77", bg: "#F0FFF2", enabled: true },
{ id: 5,  name: "社会", color: "#A78BFA", bg: "#F5F0FF", enabled: true },
{ id: 6,  name: "物理", color: "#F97316", bg: "#FFF4EE", enabled: true },
{ id: 7,  name: "化学", color: "#EC4899", bg: "#FFF0F7", enabled: true },
{ id: 8,  name: "生物", color: "#14B8A6", bg: "#F0FFFD", enabled: true },
{ id: 9,  name: "歴史", color: "#8B5CF6", bg: "#F3F0FF", enabled: true },
{ id: 10, name: "地理", color: "#06B6D4", bg: "#F0FCFF", enabled: true },
];

// ─── localStorageのキー ────────────────────────────────────────
const LS_TODOS    = "studycheck_todos";
const LS_SUBJECTS = "studycheck_subjects";

// ─── データの読み書き ──────────────────────────────────────────
function loadData(key, fallback) {
try {
const v = localStorage.getItem(key);
return v ? JSON.parse(v) : fallback;
} catch { return fallback; }
}
function saveData(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}

// ─── アプリの状態 ──────────────────────────────────────────────
let todos    = loadData(LS_TODOS, []);
let subjects = loadData(LS_SUBJECTS, DEFAULT_SUBJECTS);
let filter   = null; // null=全表示、数字=科目id

// ─── HTML要素の取得 ────────────────────────────────────────────
const filterBar      = document.getElementById("filterBar");
const subjectSelect  = document.getElementById("subjectSelect");
const todoInput      = document.getElementById("todoInput");
const addBtn         = document.getElementById("addBtn");
const todoList       = document.getElementById("todoList");
const bulkZone       = document.getElementById("bulkZone");
const bulkDelBtn     = document.getElementById("bulkDelBtn");
const settingsBtn    = document.getElementById("settingsBtn");
const settingsModal  = document.getElementById("settingsModal");
const settingsCancel = document.getElementById("settingsCancel");
const settingsSave   = document.getElementById("settingsSave");
const subjectSettings= document.getElementById("subjectSettings");
const bulkModal      = document.getElementById("bulkModal");
const bulkCancel     = document.getElementById("bulkCancel");
const bulkConfirm    = document.getElementById("bulkConfirm");
const confirmInput   = document.getElementById("confirmInput");

// ══════════════════════════════════════════
//   描画関数
// ══════════════════════════════════════════

// ── 有効な科目だけ取り出す ─────────────────────────────────────
function getEnabledSubjects() {
return subjects.filter(s => s.enabled);
}

// ── 科目をidで取得 ─────────────────────────────────────────────
function getSubject(id) {
return subjects.find(s => s.id === id);
}

// ── フィルターバーを描画 ───────────────────────────────────────
function renderFilterBar() {
filterBar.innerHTML = "";

// 「すべて」ボタン
const allBtn = document.createElement("button");
allBtn.className = "filter-chip" + (filter === null ? " active" : "");
allBtn.textContent = "すべて";
allBtn.style.background = filter === null ? "#1a1a2e" : "#fff";
allBtn.style.color      = filter === null ? "#fff"    : "#555";
allBtn.style.borderColor= filter === null ? "transparent" : "#e0d9d0";
allBtn.addEventListener("click", () => {
filter = null;
renderAll();
});
filterBar.appendChild(allBtn);

// 科目ごとのボタン
getEnabledSubjects().forEach(s => {
const btn = document.createElement("button");
btn.className = "filter-chip" + (filter === s.id ? " active" : "");
btn.textContent = s.name;
btn.style.borderColor = s.color;
btn.style.color       = filter === s.id ? "#fff"   : s.color;
btn.style.background  = filter === s.id ? s.color  : "#fff";
btn.addEventListener("click", () => {
filter = (filter === s.id) ? null : s.id;
renderAll();
});
filterBar.appendChild(btn);
});
}

// ── 科目セレクトボックスを描画 ────────────────────────────────
function renderSubjectSelect() {
const current = subjectSelect.value;
subjectSelect.innerHTML = "";
getEnabledSubjects().forEach(s => {
const opt = document.createElement("option");
opt.value = s.id;
opt.textContent = s.name;
subjectSelect.appendChild(opt);
});
// 前の選択を維持
if (current) subjectSelect.value = current;
}

// ── ToDoリストを描画 ───────────────────────────────────────────
function renderTodoList() {
todoList.innerHTML = "";

// フィルター適用
const filtered = filter
? todos.filter(t => t.subjectId === filter)
: todos;

// 空のとき
if (filtered.length === 0) {
todoList.innerHTML = ` <div class="empty-state"> <div class="empty-icon">📝</div> タスクがありません </div>`;
return;
}

filtered.forEach(todo => {
const subj = getSubject(todo.subjectId);


// ── アイテム全体のdiv ──
const item = document.createElement("div");
item.className = "todo-item" + (todo.done ? " done" : "");
item.style.borderLeftColor = subj ? subj.color : "#ddd";

// ── チェックボックス ──
const checkbox = document.createElement("div");
checkbox.className = "custom-checkbox" + (todo.done ? " checked" : "");
checkbox.innerHTML = todo.done ? '<span class="check-icon">✓</span>' : "";
checkbox.addEventListener("click", () => toggleDone(todo.id));

// ── テキスト部分 ──
const textWrap = document.createElement("div");
textWrap.className = "todo-text-wrap";

const textEl = document.createElement("div");
textEl.className = "todo-text";
textEl.textContent = todo.text;

textWrap.appendChild(textEl);

// 科目バッジ
if (subj) {
  const badge = document.createElement("span");
  badge.className = "subject-badge";
  badge.textContent = subj.name;
  badge.style.background = subj.bg;
  badge.style.color      = subj.color;
  textWrap.appendChild(badge);
}

// ── 削除ボタン ──
const delBtn = document.createElement("button");
delBtn.className = "row-del-btn";
delBtn.textContent = "✕";
delBtn.addEventListener("click", () => deleteTodo(todo.id));

item.appendChild(checkbox);
item.appendChild(textWrap);
item.appendChild(delBtn);
todoList.appendChild(item);


});
}

// ── 一括削除ボタンの表示/非表示 ───────────────────────────────
function renderBulkZone() {
bulkZone.style.display = todos.length > 0 ? "flex" : "none";
}

// ── まとめて全部描画 ───────────────────────────────────────────
function renderAll() {
renderFilterBar();
renderSubjectSelect();
renderTodoList();
renderBulkZone();
}

// ══════════════════════════════════════════
//   データ操作関数
// ══════════════════════════════════════════

// ── ToDo追加 ───────────────────────────────────────────────────
function addTodo() {
const text = todoInput.value.trim();
const subjectId = Number(subjectSelect.value);
if (!text || !subjectId) return;

todos.unshift({ id: Date.now(), text, subjectId, done: false });
saveData(LS_TODOS, todos);
todoInput.value = "";
renderAll();
}

// ── チェック切り替え ───────────────────────────────────────────
function toggleDone(id) {
todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
saveData(LS_TODOS, todos);
renderAll();
}

// ── 1件削除 ────────────────────────────────────────────────────
function deleteTodo(id) {
todos = todos.filter(t => t.id !== id);
saveData(LS_TODOS, todos);
renderAll();
}

// ══════════════════════════════════════════
//   設定モーダル
// ══════════════════════════════════════════

// 一時保存用（保存ボタンを押すまで反映しない）
let editSubjects = [];

function openSettings() {
// 現在のsubjectsをコピー
editSubjects = subjects.map(s => ({ ...s }));
renderSubjectSettings();
settingsModal.style.display = "flex";
}

function renderSubjectSettings() {
subjectSettings.innerHTML = "";
editSubjects.forEach((s, i) => {
const row = document.createElement("div");
row.className = "subject-row";


// 色の丸
const dot = document.createElement("div");
dot.className = "subject-color-dot";
dot.style.background = s.color;

// 名前の入力欄
const nameInput = document.createElement("input");
nameInput.className = "subject-name-input";
nameInput.value = s.name;
nameInput.maxLength = 12;
nameInput.addEventListener("input", e => {
  editSubjects[i].name = e.target.value;
});

// オン/オフのトグル
const label = document.createElement("label");
label.className = "toggle-switch";
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = s.enabled;
checkbox.addEventListener("change", () => {
  editSubjects[i].enabled = checkbox.checked;
});
const slider = document.createElement("span");
slider.className = "toggle-slider";
label.appendChild(checkbox);
label.appendChild(slider);

row.appendChild(dot);
row.appendChild(nameInput);
row.appendChild(label);
subjectSettings.appendChild(row);

});
}

function saveSettings() {
subjects = editSubjects.map(s => ({ ...s }));
saveData(LS_SUBJECTS, subjects);
// フィルター中の科目が無効になったら解除
if (filter && !subjects.find(s => s.id === filter && s.enabled)) {
filter = null;
}
settingsModal.style.display = "none";
renderAll();
}

// ══════════════════════════════════════════
//   一括削除モーダル
// ══════════════════════════════════════════

function openBulkModal() {
confirmInput.value = "";
bulkConfirm.disabled = true;
confirmInput.classList.remove("match");
bulkModal.style.display = "flex";
confirmInput.focus();
}

// ══════════════════════════════════════════
//   イベントリスナーの登録
// ══════════════════════════════════════════

// ToDo追加
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keydown", e => {
if (e.key === "Enter") addTodo();
});

// 設定モーダル
settingsBtn.addEventListener("click", openSettings);
settingsCancel.addEventListener("click", () => {
settingsModal.style.display = "none";
});
settingsSave.addEventListener("click", saveSettings);
// オーバーレイをクリックで閉じる
settingsModal.addEventListener("click", e => {
if (e.target === settingsModal) settingsModal.style.display = "none";
});

// 一括削除モーダル
bulkDelBtn.addEventListener("click", openBulkModal);
bulkCancel.addEventListener("click", () => {
bulkModal.style.display = "none";
});
bulkModal.addEventListener("click", e => {
if (e.target === bulkModal) bulkModal.style.display = "none";
});

// 「削除」と入力されたらボタンを有効化
confirmInput.addEventListener("input", () => {
const match = confirmInput.value === "削除";
bulkConfirm.disabled = !match;
confirmInput.classList.toggle("match", match);
});

// 一括削除実行
bulkConfirm.addEventListener("click", () => {
todos = [];
saveData(LS_TODOS, todos);
bulkModal.style.display = "none";
renderAll();
});

// ══════════════════════════════════════════
//   初回描画
// ══════════════════════════════════════════
renderAll();