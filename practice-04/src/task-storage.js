"use strict";

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const seen = new Set();
  for (const task of value) {
    if (!task || typeof task !== "object") return false;
    if (typeof task.id !== "number" || !Number.isSafeInteger(task.id) || task.id <= 0) return false;
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    if (typeof task.title !== "string") return false;
    if (task.title.length < 1 || task.title.length > 100) return false;
    if (typeof task.completed !== "boolean") return false;
    if (!["low", "medium", "high"].includes(task.priority)) return false;
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = fallbackTasks.map((t) => ({ ...t }));
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallbackCopy };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      return { ok: false, source: "fallback", error: "Неверная версия или структура записи", tasks: fallbackCopy };
    }
    if (!isValidTaskList(parsed.tasks)) {
      return { ok: false, source: "fallback", error: "Сохранённый список задач некорректен", tasks: fallbackCopy };
    }
    return { ok: true, source: "storage", tasks: parsed.tasks.map((t) => ({ ...t })) };
  } catch (error) {
    return { ok: false, source: "fallback", error: error.message, tasks: fallbackCopy };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен" };
  }
  try {
    storage.setItem(key, JSON.stringify({ version: 1, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}