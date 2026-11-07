const STORAGE_KEY = 'todo-list-tasks-v1';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const status = document.querySelector('#status');
const emptyState = document.querySelector('#empty-state');
const viewTitle = document.querySelector('#view-title');
const viewCount = document.querySelector('#view-count');
const nav = document.querySelector('.views');

const titles = { all: 'Все задачи', active: 'В работе', done: 'Готово' };
let currentView = 'all';
let tasks = loadTasks();

render();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  if (!saveTasks()) return;

  currentView = 'all';
  input.value = '';
  render();
  input.focus();
});

nav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  currentView = button.dataset.view;
  render();
});

list.addEventListener('change', (event) => {
  if (!event.target.matches('.task-toggle')) return;
  const row = event.target.closest('li');
  const task = tasks.find((item) => item.id === row.dataset.id);
  if (!task) return;

  task.done = event.target.checked;
  if (!saveTasks()) return;

  if (currentView === 'all') {
    row.classList.toggle('is-done', task.done);
    updateCounts();
  } else {
    render();
    nav.querySelector(`[data-view="${currentView}"]`).focus();
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

function taskWord(number) {
  if (number % 100 >= 11 && number % 100 <= 14) return 'задач';
  if (number % 10 === 1) return 'задача';
  if (number % 10 >= 2 && number % 10 <= 4) return 'задачи';
  return 'задач';
}

function updateCounts() {
  const active = tasks.filter((task) => !task.done).length;
  const done = tasks.length - active;
  document.querySelector('#all-count').textContent = String(tasks.length);
  document.querySelector('#active-count').textContent = String(active);
  document.querySelector('#done-count').textContent = String(done);
  const visibleCount = currentView === 'active' ? active : currentView === 'done' ? done : tasks.length;
  viewCount.textContent = `${visibleCount} ${taskWord(visibleCount)}`;
}

function render() {
  viewTitle.textContent = titles[currentView];
  updateCounts();
  for (const button of nav.querySelectorAll('[data-view]')) {
    button.setAttribute('aria-pressed', String(button.dataset.view === currentView));
  }

  list.replaceChildren();
  const visibleTasks = tasks.filter((task) =>
    currentView === 'all' || (currentView === 'done' ? task.done : !task.done)
  );
  emptyState.hidden = visibleTasks.length > 0;
  emptyState.textContent = currentView === 'active'
    ? 'Нет задач в работе'
    : currentView === 'done' ? 'Нет выполненных задач' : 'Задач пока нет';

  for (const task of visibleTasks) {
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
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.text}`);
    deleteButton.title = 'Удалить';
    deleteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5"/></svg>';

    item.append(label, deleteButton);
    list.append(item);
  }
}
