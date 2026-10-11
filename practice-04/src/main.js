"use strict";

import { demoTasks, variantTasks } from "./data.js";
import {
  findTaskById,
  setTaskCompleted,
  removeTask,
  addTask,
  updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
  renderTaskList,
  renderSummary,
  renderEmptyState,
  restoreTaskFocus,
} from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import {
  loadTasks,
  saveTasks,
  removeSavedTasks,
} from "./task-storage.js";

const params = new URLSearchParams(location.search);
const useVariant = params.get("dataset") === "variant";
const isCheckMode = params.get("mode") === "check";

const initialTasks = useVariant ? variantTasks : demoTasks;
const STORAGE_KEY = isCheckMode
  ? `tip-js-practice-04:checks:${useVariant ? "variant" : "demo"}`
  : `tip-js-practice-04:${useVariant ? "variant" : "demo"}`;

// Загрузка
const loaded = loadTasks(localStorage, STORAGE_KEY, initialTasks);
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

// Элементы
const summaryEl = document.querySelector("#task-summary");
const listEl = document.querySelector("#task-list");
const filtersEl = document.querySelector("#task-filters");
const emptyEl = document.querySelector("#empty-message");
const opMsgEl = document.querySelector("#operation-message");
const storageMsgEl = document.querySelector("#storage-message");
const formEl = document.querySelector("#task-form");
const formTitleEl = document.querySelector("#form-title");
const formSubmitEl = document.querySelector("#form-submit");
const formCancelEl = document.querySelector("#form-cancel");
const resetBtn = document.querySelector("#reset-storage");

function setStorageMessage(text) {
  storageMsgEl.textContent = text;
  storageMsgEl.hidden = text === "";
}

function setOperationMessage(text) {
  opMsgEl.textContent = text;
  opMsgEl.hidden = text === "";
}

if (!loaded.ok) {
  setStorageMessage("Предупреждение: " + loaded.error + ". Использован исходный набор.");
}

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

function persist() {
  const r = saveTasks(localStorage, STORAGE_KEY, currentTasks);
  if (!r.ok) setStorageMessage("Не удалось сохранить: " + r.error);
  else setStorageMessage("");
}

function showFormErrors(errors) {
  formEl.querySelectorAll(".field-error").forEach((el) => {
    const field = el.dataset.errorFor;
    el.textContent = errors[field] || "";
  });
}

function clearFormErrors() {
  formEl.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
}

function setFormMode(id) {
  if (id === null) {
    editingId = null;
    formEl.reset();
    clearFormErrors();
    formEl.elements.id.disabled = false;
    formTitleEl.textContent = "Добавление задачи";
    formSubmitEl.textContent = "Добавить задачу";
    formCancelEl.hidden = true;
    formEl.elements.id.focus();
    return;
  }
  const task = findTaskById(currentTasks, id);
  if (!task) {
    setOperationMessage("Задача не найдена");
    return;
  }
  editingId = id;
  formEl.elements.id.value = task.id;
  formEl.elements.id.disabled = true;
  formEl.elements.title.value = task.title;
  formEl.elements.priority.value = task.priority;
  clearFormErrors();
  formTitleEl.textContent = "Редактирование задачи";
  formSubmitEl.textContent = "Сохранить изменения";
  formCancelEl.hidden = false;
  formEl.elements.title.focus();
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  clearFormErrors();
  const fd = new FormData(formEl);

  const rawId = fd.get("id");
  const draft = {
    id: editingId !== null ? editingId : (rawId === null || rawId === "" ? NaN : Number(rawId)),
    title: fd.get("title"),
    priority: fd.get("priority"),
  };

  const valid = validateTaskDraft(draft, currentTasks, editingId);
  if (!valid.ok) {
    showFormErrors(valid.errors);
    return;
  }

  const result = editingId === null
    ? addTask(currentTasks, valid.value.id, valid.value.title, valid.value.priority)
    : updateTask(currentTasks, editingId, valid.value.title, valid.value.priority);

  if (!result.ok) {
    setOperationMessage("Ошибка: " + result.error);
    return;
  }

  currentTasks = result.tasks;
  setOperationMessage("");
  persist();
  setFormMode(null);
  renderApp();
});

formCancelEl.addEventListener("click", () => setFormMode(null));

formEl.addEventListener("input", (event) => {
  const field = event.target.name;
  const errEl = formEl.querySelector(`.field-error[data-error-for="${field}"]`);
  if (errEl) errEl.textContent = "";
});

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-action]");
  if (!button || !listEl.contains(button)) return;
  const action = button.dataset.action;
  if (!["toggle", "edit", "delete"].includes(action)) return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;
  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    setOperationMessage("Некорректный идентификатор");
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    setOperationMessage("Задача не найдена");
    return;
  }

  if (action === "edit") {
    setFormMode(id);
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
  persist();
  if (action === "delete" && editingId === id) {
    setFormMode(null);
  }
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-filter]");
  if (!button || !filtersEl.contains(button)) return;
  const filter = button.dataset.filter;
  if (!["all", "pending", "completed"].includes(filter)) return;
  currentFilter = filter;
  setOperationMessage("");
  renderApp();
}

resetBtn.addEventListener("click", () => {
  const r = removeSavedTasks(localStorage, STORAGE_KEY);
  if (!r.ok) setStorageMessage("Не удалось сбросить: " + r.error);
  else setStorageMessage("");
  currentTasks = initialTasks.map((t) => ({ ...t }));
  currentFilter = "all";
  setFormMode(null);
  renderApp();
});

listEl.addEventListener("click", handleTaskListClick);
filtersEl.addEventListener("click", handleFilterClick);

setFormMode(null);
renderApp();