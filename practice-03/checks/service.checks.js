"use strict";

import assert from "node:assert/strict";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "../src/task-service.js";
import { demoTasks } from "../src/data.js";

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log("OK  —", name);
    passed++;
  } catch (error) {
    console.log("FAIL —", name);
    console.log("      ", error.message);
    failed++;
  }
}

// ---------- createTask ----------

check("createTask: обычный успех", () => {
  const r = createTask(20, "Новая задача", "high");
  assert.equal(r.ok, true);
  assert.equal(r.task.id, 20);
  assert.equal(r.task.title, "Новая задача");
  assert.equal(r.task.completed, false);
  assert.equal(r.task.priority, "high");
});

check("createTask: приоритет по умолчанию", () => {
  const r = createTask(21, "Без приоритета");
  assert.equal(r.ok, true);
  assert.equal(r.task.priority, "medium");
});

check("createTask: trim названия", () => {
  const r = createTask(22, "  Проверить  данные  ");
  assert.equal(r.ok, true);
  assert.equal(r.task.title, "Проверить  данные");
});

check("createTask: длина 1 и 100", () => {
  assert.equal(createTask(1, "a").ok, true);
  assert.equal(createTask(2, "a".repeat(100)).ok, true);
});

check("createTask: пустое/пробелы/101", () => {
  assert.equal(createTask(1, "").ok, false);
  assert.equal(createTask(1, "   ").ok, false);
  assert.equal(createTask(1, "a".repeat(101)).ok, false);
});

check("createTask: не-строка title", () => {
  assert.equal(createTask(1, 42).ok, false);
  assert.equal(createTask(1, null).ok, false);
  assert.equal(createTask(1, undefined).ok, false);
});

check("createTask: некорректный id", () => {
  assert.equal(createTask(0, "t").ok, false);
  assert.equal(createTask(-1, "t").ok, false);
  assert.equal(createTask(1.5, "t").ok, false);
  assert.equal(createTask("4", "t").ok, false);
  assert.equal(createTask(NaN, "t").ok, false);
  assert.equal(createTask(Infinity, "t").ok, false);
  assert.equal(createTask(null, "t").ok, false);
  assert.equal(createTask(undefined, "t").ok, false);
});

check("createTask: границы safe integer", () => {
  assert.equal(createTask(Number.MAX_SAFE_INTEGER, "t").ok, true);
  assert.equal(createTask(Number.MAX_SAFE_INTEGER + 1, "t").ok, false);
});

check("createTask: некорректный priority", () => {
  assert.equal(createTask(1, "t", "urgent").ok, false);
  assert.equal(createTask(1, "t", "HIGH").ok, false);
  assert.equal(createTask(1, "t", " high ").ok, false);
  assert.equal(createTask(1, "t", null).ok, false);
  assert.equal(createTask(1, "t", 1).ok, false);
});

check("createTask: два вызова — разные объекты", () => {
  const a = createTask(5, "t");
  const b = createTask(5, "t");
  assert.deepEqual(a.task, b.task);
  assert.notEqual(a.task, b.task);
});

// ---------- findTaskById ----------

check("findTaskById: id = 4", () => {
  const t = findTaskById(demoTasks, 4);
  assert.equal(t.id, 4);
});

check("findTaskById: отсутствует", () => {
  assert.equal(findTaskById(demoTasks, 777), undefined);
  assert.equal(findTaskById(demoTasks, "4"), undefined);
  assert.equal(findTaskById([], 4), undefined);
});

// ---------- getPendingTasks ----------

check("getPendingTasks: ids [4, 7]", () => {
  const ids = getPendingTasks(demoTasks).map((t) => t.id);
  assert.deepEqual(ids, [4, 7]);
});

check("getPendingTasks: пустой / всё выполнено", () => {
  assert.deepEqual(getPendingTasks([]), []);
  const allDone = demoTasks.map((t) => ({ ...t, completed: true }));
  assert.deepEqual(getPendingTasks(allDone), []);
});

check("getPendingTasks: ничего не выполнено", () => {
  const noneDone = demoTasks.map((t) => ({ ...t, completed: false }));
  assert.equal(getPendingTasks(noneDone).length, noneDone.length);
});

// ---------- getTaskTitles ----------

check("getTaskTitles: 4 названия", () => {
  assert.equal(getTaskTitles(demoTasks).length, 4);
});

check("getTaskTitles: пустой", () => {
  assert.deepEqual(getTaskTitles([]), []);
});

// ---------- getTaskStats ----------

check("getTaskStats: общий набор", () => {
  assert.deepEqual(getTaskStats(demoTasks), {
    total: 4,
    completed: 2,
    pending: 2,
    progress: 50,
  });
});

check("getTaskStats: пустой", () => {
  assert.deepEqual(getTaskStats([]), {
    total: 0,
    completed: 0,
    pending: 0,
    progress: 0,
  });
});

check("getTaskStats: 0 / 100 процентов", () => {
  const noneDone = demoTasks.map((t) => ({ ...t, completed: false }));
  assert.equal(getTaskStats(noneDone).progress, 0);
  const allDone = demoTasks.map((t) => ({ ...t, completed: true }));
  assert.equal(getTaskStats(allDone).progress, 100);
});

check("getTaskStats: 1 из 3 ≈ 33.33", () => {
  const tasks = [
    { id: 1, title: "a", completed: true, priority: "low" },
    { id: 2, title: "b", completed: false, priority: "low" },
    { id: 3, title: "c", completed: false, priority: "low" },
  ];
  const s = getTaskStats(tasks);
  assert.equal(s.total, 3);
  assert.equal(s.completed, 1);
  assert.ok(Math.abs(s.progress - 33.3333333333) < 0.001);
});

// ---------- addTask ----------

check("addTask: успех в конец", () => {
  const r = addTask(demoTasks, 20, "Новая", "high");
  assert.equal(r.ok, true);
  assert.equal(r.tasks.length, 5);
  assert.equal(r.tasks[4].id, 20);
  assert.equal(demoTasks.length, 4);
});

check("addTask: в пустой массив", () => {
  const r = addTask([], 1, "Первая");
  assert.equal(r.ok, true);
  assert.equal(r.tasks.length, 1);
});

check("addTask: дубликат id", () => {
  const r = addTask(demoTasks, 4, "Дубликат");
  assert.equal(r.ok, false);
});

check("addTask: некорректные поля", () => {
  assert.equal(addTask(demoTasks, 0, "t").ok, false);
  assert.equal(addTask(demoTasks, 30, "").ok, false);
  assert.equal(addTask(demoTasks, 30, "t", "urgent").ok, false);
});

// ---------- setTaskCompleted ----------

check("setTaskCompleted: успех", () => {
  const r = setTaskCompleted(demoTasks, 4, true);
  assert.equal(r.ok, true);
  assert.equal(r.tasks.find((t) => t.id === 4).completed, true);
  assert.equal(demoTasks.find((t) => t.id === 4).completed, false);
});

check("setTaskCompleted: неверный тип", () => {
  assert.equal(setTaskCompleted(demoTasks, 4, "false").ok, false);
  assert.equal(setTaskCompleted(demoTasks, 4, 0).ok, false);
  assert.equal(setTaskCompleted(demoTasks, 4, null).ok, false);
  assert.equal(setTaskCompleted(demoTasks, 4, undefined).ok, false);
});

check("setTaskCompleted: задача не найдена", () => {
  assert.equal(setTaskCompleted(demoTasks, 999, true).ok, false);
});

// ---------- renameTask ----------

check("renameTask: успех с trim", () => {
  const r = renameTask(demoTasks, 10, "  Подготовить инструкцию  ");
  assert.equal(r.ok, true);
  const t = r.tasks.find((x) => x.id === 10);
  assert.equal(t.title, "Подготовить инструкцию");
  assert.equal(t.completed, true);
  assert.equal(t.priority, "medium");
});

check("renameTask: некорректное название", () => {
  assert.equal(renameTask(demoTasks, 10, "").ok, false);
  assert.equal(renameTask(demoTasks, 10, "a".repeat(101)).ok, false);
  assert.equal(renameTask(demoTasks, 10, null).ok, false);
});

check("renameTask: не найдена", () => {
  assert.equal(renameTask(demoTasks, 999, "t").ok, false);
});

// ---------- removeTask ----------

check("removeTask: успех", () => {
  const r = removeTask(demoTasks, 7);
  assert.equal(r.ok, true);
  assert.deepEqual(r.tasks.map((t) => t.id), [1, 4, 10]);
  assert.equal(demoTasks.length, 4);
});

check("removeTask: единственная задача", () => {
  const one = [{ id: 1, title: "a", completed: false, priority: "low" }];
  const r = removeTask(one, 1);
  assert.equal(r.ok, true);
  assert.equal(r.tasks.length, 0);
});

check("removeTask: не найдена / пустой", () => {
  assert.equal(removeTask(demoTasks, 999).ok, false);
  assert.equal(removeTask([], 1).ok, false);
});

// ---------- сохранность входных данных ----------

check("Сохранность: demoTasks не изменён", () => {
  assert.equal(demoTasks.length, 4);
  assert.equal(demoTasks[0].id, 1);
  assert.equal(demoTasks[1].id, 4);
  assert.equal(demoTasks[2].id, 7);
  assert.equal(demoTasks[3].id, 10);
});

// ---------- Итог ----------

console.log(`\nПройдено: ${passed}, провалено: ${failed}`);
if (failed > 0) {
  process.exit(1);
}