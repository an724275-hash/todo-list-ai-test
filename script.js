const STORAGE_KEY = 'todo-list-tasks-v1';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const summary = document.querySelector('#summary');
const count = document.querySelector('#task-count');
const formError = document.querySelector('#form-error');
const today = document.querySelector('#today');
const filters = document.querySelector('#filters');
const progressLabel = document.querySelector('#progress-label');
const progressBar = document.querySelector('#progress-bar');
const progressFill = document.querySelector('#progress-fill');

let tasks = loadTasks();
let currentFilter = 'all';
today.textContent = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
render();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    showError('Напиши задачу перед добавлением.');
    input.focus();
    return;
  }

  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  if (!saveTasks()) return;

  input.value = '';
  showError('');
  currentFilter = 'all';
  render();
  input.focus();
});

filters.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  currentFilter = button.dataset.filter;
  render();
});

list.addEventListener('change', (event) => {
  if (!event.target.matches('.task-toggle')) return;
  const row = event.target.closest('li');
  const task = tasks.find((item) => item.id === row.dataset.id);
  if (!task) return;
  task.done = event.target.checked;
  if (!saveTasks()) return;
  if (currentFilter === 'all') {
    row.classList.toggle('is-done', task.done);
    updateMeta();
  } else {
    render();
  }
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('.delete-button');
  if (!button) return;
  tasks = tasks.filter((item) => item.id !== button.closest('li').dataset.id);
  if (!saveTasks()) return;
  render();
  input.focus();
});

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => typeof item.id === 'string' && typeof item.text === 'string' && typeof item.done === 'boolean');
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    showError('Не удалось сохранить изменения в браузере.');
    tasks = loadTasks();
    render();
    return false;
  }
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function render() {
  list.replaceChildren();
  updateMeta();
  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter));
  }

  const visibleTasks = tasks.filter((task) =>
    currentFilter === 'all' || (currentFilter === 'done' ? task.done : !task.done)
  );
  emptyState.hidden = visibleTasks.length > 0;
  emptyState.textContent = currentFilter === 'done'
    ? 'Пока нет выполненных задач.'
    : currentFilter === 'active'
      ? 'Все задачи выполнены.'
      : 'Здесь пока пусто. Добавь первую задачу выше.';

  for (const task of visibleTasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' is-done' : ''}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'task-toggle';
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', task.text);

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Удалить';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.text}`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  }
}

function updateMeta() {
  const remaining = tasks.filter((task) => !task.done).length;
  const percent = tasks.length ? Math.round((tasks.length - remaining) / tasks.length * 100) : 0;
  count.textContent = String(tasks.length);
  summary.textContent = tasks.length
    ? remaining ? `${remaining} в работе · ${tasks.length - remaining} готово` : 'Все задачи выполнены.'
    : 'Добавь первую задачу, чтобы начать.';
  progressLabel.textContent = `${percent}%`;
  progressBar.setAttribute('aria-valuenow', String(percent));
  progressFill.style.width = `${percent}%`;
}
