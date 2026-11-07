const STORAGE_KEY = 'todo-list-tasks-v1';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const count = document.querySelector('#task-count');
const status = document.querySelector('#status');

let tasks = loadTasks();
render();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  if (!saveTasks()) return;

  input.value = '';
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
    status.hidden = true;
    return true;
  } catch {
    tasks = loadTasks();
    render();
    status.textContent = 'Не удалось сохранить изменения.';
    status.hidden = false;
    return false;
  }
}

function render() {
  list.replaceChildren();
  count.textContent = String(tasks.length);

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' is-done' : ''}`;
    item.dataset.id = task.id;

    const label = document.createElement('label');
    label.className = 'task-main';

    const checkbox = document.createElement('input');
    checkbox.className = 'task-toggle';
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    label.append(checkbox, text);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.text}`);

    item.append(label, deleteButton);
    list.append(item);
  }
}
