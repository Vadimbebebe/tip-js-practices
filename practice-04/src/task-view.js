import { getTaskStats } from "./task-service.js";

const PRIORITY_LABEL = { low: "Низкий", medium: "Средний", high: "Высокий" };

export function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  li.dataset.taskId = String(task.id);
  if (task.completed) li.classList.add("is-completed");

  const title = document.createElement("h3");
  title.classList.add("task-title");
  title.textContent = task.title;

  const status = document.createElement("p");
  status.classList.add("task-status");
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("p");
  priority.classList.add("task-priority");
  priority.textContent = PRIORITY_LABEL[task.priority] || task.priority;

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.dataset.action = "toggle";
  toggle.setAttribute("aria-pressed", String(task.completed));
  const toggleLabel = document.createElement("span");
  toggleLabel.classList.add("action-label");
  toggleLabel.textContent = "Выполнена";
  toggle.append(toggleLabel);

  const edit = document.createElement("button");
  edit.type = "button";
  edit.dataset.action = "edit";
  const editLabel = document.createElement("span");
  editLabel.classList.add("action-label");
  editLabel.textContent = "Изменить";
  edit.append(editLabel);

  const del = document.createElement("button");
  del.type = "button";
  del.dataset.action = "delete";
  const delLabel = document.createElement("span");
  delLabel.classList.add("action-label");
  delLabel.textContent = "Удалить";
  del.append(delLabel);

  actions.append(toggle, edit, del);
  li.append(title, status, priority, actions);
  return li;
}

export function renderTaskList(listElement, tasks) {
  const cards = tasks.map((task) => createTaskElement(task));
  listElement.replaceChildren(...cards);
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);
  summaryElement.querySelector('[data-stat="total"]').textContent = stats.total;
  summaryElement.querySelector('[data-stat="completed"]').textContent = stats.completed;
  summaryElement.querySelector('[data-stat="pending"]').textContent = stats.pending;
  summaryElement.querySelector('[data-stat="progress"]').textContent =
    stats.progress.toFixed(1) + "%";
  summaryElement.querySelector('[data-stat="visible"]').textContent = visibleCount;
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (total === 0 && visibleCount === 0) {
    messageElement.textContent = "Список задач пуст.";
    messageElement.hidden = false;
  } else if (total > 0 && visibleCount === 0) {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
  } else {
    messageElement.textContent = "";
    messageElement.hidden = true;
  }
}

export function restoreTaskFocus(id, action) {
  const selector = `li[data-task-id="${id}"] button[data-action="${action}"]`;
  const el = document.querySelector(selector);
  if (el) {
    el.focus();
  } else {
    const active = document.querySelector("#task-filters button.is-active");
    if (active) active.focus();
  }
}