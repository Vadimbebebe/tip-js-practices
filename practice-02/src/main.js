"use strict";

import {
  demoTasks,
  variantTasks,
  variantNumber,
} from "./data.js";

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
} from "./task-service.js";

function printStats(tasks, label) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`--- ${label} ---`);
  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

// ============ ОБЩИЙ СЦЕНАРИЙ ============

console.log("========== ОБЩИЙ СЦЕНАРИЙ ==========");

printStats(demoTasks, "Исходный набор");

console.log("Названия:", getTaskTitles(demoTasks));
console.log("Невыполненные:", getPendingTasks(demoTasks).map((t) => t.id));
console.log("Поиск id = 4:", findTaskById(demoTasks, 4));

let current = demoTasks;

// Добавить id = 20
let r = addTask(current, 20, "Добавить проверку", "high");
if (r.ok) current = r.tasks; else console.error("Ошибка:", r.error);
printStats(current, "После addTask id = 20");

// Установить completed = true для id = 4
r = setTaskCompleted(current, 4, true);
if (r.ok) current = r.tasks; else console.error("Ошибка:", r.error);
printStats(current, "После setTaskCompleted id = 4");

// Переименовать id = 10
r = renameTask(current, 10, "Подготовить инструкцию запуска");
if (r.ok) current = r.tasks; else console.error("Ошибка:", r.error);
printStats(current, "После renameTask id = 10");

// Удалить id = 7
r = removeTask(current, 7);
if (r.ok) current = r.tasks; else console.error("Ошибка:", r.error);
printStats(current, "После removeTask id = 7");

// Показать отказ: повторно добавить id = 20
r = addTask(current, 20, "Дубликат", "low");
if (r.ok) {
  current = r.tasks;
} else {
  console.error("Ошибка (ожидаемо):", r.error);
}

console.log("Итоговые id:", current.map((t) => t.id));
console.log("Исходный demoTasks не изменился:", demoTasks.length === 4);

// ============ ИНДИВИДУАЛЬНЫЙ ВАРИАНТ (4) ============

console.log("\n========== ВАРИАНТ " + variantNumber + " ==========");

printStats(variantTasks, "Исходный набор варианта");

let variantCurrent = variantTasks;

// Добавить id = 80, приоритет high
r = addTask(variantCurrent, 80, "Провести семинар", "high");
if (r.ok) variantCurrent = r.tasks; else console.error("Ошибка:", r.error);
printStats(variantCurrent, "После addTask id = 80");

// Установить completed = true для id = 11
r = setTaskCompleted(variantCurrent, 11, true);
if (r.ok) variantCurrent = r.tasks; else console.error("Ошибка:", r.error);
printStats(variantCurrent, "После setTaskCompleted id = 11");

// Переименовать id = 23
r = renameTask(variantCurrent, 23, "Обновить презентацию семинара");
if (r.ok) variantCurrent = r.tasks; else console.error("Ошибка:", r.error);
printStats(variantCurrent, "После renameTask id = 23");

// Удалить id = 37
r = removeTask(variantCurrent, 37);
if (r.ok) variantCurrent = r.tasks; else console.error("Ошибка:", r.error);
printStats(variantCurrent, "После removeTask id = 37");

// Повторно добавить id = 80 — отказ
r = addTask(variantCurrent, 80, "Дубликат", "low");
if (r.ok) {
  variantCurrent = r.tasks;
} else {
  console.error("Ошибка (ожидаемо):", r.error);
}

console.log("Итоговые id варианта:", variantCurrent.map((t) => t.id));
console.log("Исходный variantTasks не изменился:", variantTasks.length === 6);