const STORAGE_KEY = 'lista-de-tarefas-v1';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const taskCounter = document.querySelector('#task-counter');
const emptyState = document.querySelector('#empty-state');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error('Não foi possível carregar as tarefas:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
}

function getFilteredTasks() {
  if (currentFilter === 'pending') return tasks.filter(task => !task.completed);
  if (currentFilter === 'completed') return tasks.filter(task => task.completed);
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;
    item.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'check';
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Concluir tarefa: ${task.text}`);

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Excluir';
    deleteButton.setAttribute('aria-label', `Excluir tarefa: ${task.text}`);

    checkbox.addEventListener('change', () => toggleTask(task.id));
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const pendingCount = tasks.filter(task => !task.completed).length;
  taskCounter.textContent = `${pendingCount} ${pendingCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`;
  emptyState.hidden = visibleTasks.length > 0;
}

function addTask(text) {
  const task = createTask(text);
  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskForm.reset();
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', clearCompleted);

renderTasks();
