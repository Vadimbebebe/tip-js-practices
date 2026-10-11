"use strict";

import assert from "node:assert/strict";
import { updateTask } from "../src/task-service.js";
import { validateTaskDraft } from "../src/form-validation.js";
import { isValidTaskList, loadTasks, saveTasks, removeSavedTasks } from "../src/task-storage.js";

let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); console.log("OK  —", name); passed++; }
  catch (e) { console.log("FAIL —", name); console.log("      ", e.message); failed++; }
}

const base = [
  { id: 1, title: "a", completed: false, priority: "low" },
  { id: 4, title: "b", completed: true, priority: "medium" },
];

// updateTask
check("updateTask: успех", () => {
  const r = updateTask(base, 1, "  Новое имя  ", "high");
  assert.equal(r.ok, true);
  const t = r.tasks.find((x) => x.id === 1);
  assert.equal(t.title, "Новое имя");
  assert.equal(t.priority, "high");
  assert.equal(t.completed, false);
  assert.equal(base[0].title, "a");
});

check("updateTask: сохраняет completed", () => {
  const r = updateTask(base, 4, "Новое", "low");
  assert.equal(r.tasks.find((x) => x.id === 4).completed, true);
});

check("updateTask: не найдена", () => {
  assert.equal(updateTask(base, 999, "t", "low").ok, false);
});

check("updateTask: некорректные данные", () => {
  assert.equal(updateTask(base, 1, "", "low").ok, false);
  assert.equal(updateTask(base, 1, "t", "urgent").ok, false);
  assert.equal(updateTask(base, 0, "t", "low").ok, false);
});

// validateTaskDraft — создание
check("validateTaskDraft: создание ок", () => {
  const r = validateTaskDraft({ id: 20, title: "  Test  ", priority: "high" }, base, null);
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { id: 20, title: "Test", priority: "high" });
});

check("validateTaskDraft: дубликат id", () => {
  const r = validateTaskDraft({ id: 1, title: "t", priority: "low" }, base, null);
  assert.equal(r.ok, false);
  assert.ok(r.errors.id);
});

check("validateTaskDraft: пустой title", () => {
  const r = validateTaskDraft({ id: 20, title: "   ", priority: "low" }, base, null);
  assert.equal(r.ok, false);
  assert.ok(r.errors.title);
});

check("validateTaskDraft: плохой priority", () => {
  const r = validateTaskDraft({ id: 20, title: "t", priority: "urgent" }, base, null);
  assert.equal(r.ok, false);
  assert.ok(r.errors.priority);
});

// validateTaskDraft — редактирование
check("validateTaskDraft: edit ok", () => {
  const r = validateTaskDraft({ id: 999, title: "New", priority: "medium" }, base, 1);
  assert.equal(r.ok, true);
  assert.equal(r.value.id, 1);
});

check("validateTaskDraft: edit без задачи", () => {
  const r = validateTaskDraft({ id: 999, title: "New", priority: "medium" }, base, 777);
  assert.equal(r.ok, false);
  assert.ok(r.errors.id);
});

// storage
check("isValidTaskList: ок", () => {
  assert.equal(isValidTaskList(base), true);
});

check("isValidTaskList: дубликат id", () => {
  assert.equal(isValidTaskList([...base, { id: 1, title: "c", completed: false, priority: "low" }]), false);
});

check("isValidTaskList: плохие поля", () => {
  assert.equal(isValidTaskList([{ id: -1, title: "t", completed: false, priority: "low" }]), false);
  assert.equal(isValidTaskList([{ id: 1, title: "", completed: false, priority: "low" }]), false);
  assert.equal(isValidTaskList([{ id: 1, title: "t", completed: "yes", priority: "low" }]), false);
});

check("loadTasks: ключ отсутствует", () => {
  const storage = { getItem: () => null };
  const r = loadTasks(storage, "k", base);
  assert.equal(r.ok, true);
  assert.equal(r.source, "initial");
});

check("loadTasks: корректная запись", () => {
  const storage = { getItem: () => JSON.stringify({ version: 1, tasks: base }) };
  const r = loadTasks(storage, "k", []);
  assert.equal(r.ok, true);
  assert.equal(r.source, "storage");
});

check("loadTasks: повреждённый JSON", () => {
  const storage = { getItem: () => "{broken" };
  const r = loadTasks(storage, "k", base);
  assert.equal(r.ok, false);
  assert.equal(r.source, "fallback");
});

check("loadTasks: неверная version", () => {
  const storage = { getItem: () => JSON.stringify({ version: 99, tasks: base }) };
  const r = loadTasks(storage, "k", base);
  assert.equal(r.ok, false);
});

check("saveTasks: ок", () => {
  let saved = null;
  const storage = { setItem: (k, v) => { saved = v; } };
  const r = saveTasks(storage, "k", base);
  assert.equal(r.ok, true);
  assert.equal(JSON.parse(saved).version, 1);
});

check("saveTasks: плохой список", () => {
  const storage = { setItem: () => { throw new Error("не должно вызываться"); } };
  const r = saveTasks(storage, "k", [{ id: -1 }]);
  assert.equal(r.ok, false);
});

check("removeSavedTasks: ок", () => {
  let removed = null;
  const storage = { removeItem: (k) => { removed = k; } };
  const r = removeSavedTasks(storage, "k");
  assert.equal(r.ok, true);
  assert.equal(removed, "k");
});

check("removeSavedTasks: ошибка", () => {
  const storage = { removeItem: () => { throw new Error("boom"); } };
  const r = removeSavedTasks(storage, "k");
  assert.equal(r.ok, false);
});

console.log(`\nПроверок пройдено: ${passed}; не пройдено: ${failed}.`);
if (failed > 0) process.exit(1);