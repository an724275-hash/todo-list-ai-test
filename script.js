const STORAGE_KEY = 'todo-list-tasks-v1';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const summary = document.querySelector('#summary');
const count = document.querySelector('#task-count');
const formError = document.querySelector('#form-error');

let tasks = loadTasks();
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
  render();
  input.focus();
});

list.addEventListener('change', (event) => {
  if (!event.target.matches('.task-toggle')) return;
  const row = event.target.closest('li');
  const task = tasks.find((item) => item.id === row.dataset.id);
  if (!task) return;
  task.done = event.target.checked;
  if (!saveTasks()) return;
  row.classList.toggle('is-done', task.done);
  updateMeta();
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
  emptyState.hidden = tasks.length > 0;

  for (const task of tasks) {
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
  count.textContent = String(tasks.length);
  summary.textContent = tasks.length
    ? `Осталось выполнить: ${remaining}`
    : 'Запиши дела, которые не хочется забыть.';
}
