import { demoTasks, variantTasks } from "./data.js";
import {
  findTaskById,
  setTaskCompleted,
  removeTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
  renderTaskList,
  renderSummary,
  renderEmptyState,
  restoreTaskFocus,
} from "./task-view.js";

const params = new URLSearchParams(location.search);
const useVariant = params.get("dataset") === "variant";
const initialTasks = useVariant ? variantTasks : demoTasks;

let currentTasks = initialTasks.map((t) => ({ ...t }));
let currentFilter = "all";

const summaryEl = document.querySelector("#task-summary");
const listEl = document.querySelector("#task-list");
const filtersEl = document.querySelector("#task-filters");
const emptyEl = document.querySelector("#empty-message");
const opMsgEl = document.querySelector("#operation-message");

function renderApp() {
  const visible = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(listEl, visible);
  renderSummary(summaryEl, currentTasks, visible.length);
  renderEmptyState(emptyEl, currentTasks.length, visible.length);

  filtersEl.querySelectorAll("button[data-filter]").forEach((btn) => {
    const active = btn.dataset.filter === currentFilter;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

function setOperationMessage(text) {
  opMsgEl.textContent = text;
  opMsgEl.hidden = text === "";
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-action]");
  if (!button || !listEl.contains(button)) return;
  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;
  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    setOperationMessage("Некорректный идентификатор задачи");
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    setOperationMessage("Задача не найдена");
    return;
  }

  let result;
  if (action === "toggle") {
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result.ok) {
    setOperationMessage("Ошибка: " + result.error);
    return;
  }
  currentTasks = result.tasks;
  setOperationMessage("");
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-filter]");
  if (!button || !filtersEl.contains(button)) return;
  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") return;
  currentFilter = filter;
  setOperationMessage("");
  renderApp();
}

listEl.addEventListener("click", handleTaskListClick);
filtersEl.addEventListener("click", handleFilterClick);

renderApp();