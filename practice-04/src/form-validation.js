"use strict";

const VALID_PRIORITIES = ["low", "medium", "high"];

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let id;

  if (editingId === null) {
    // режим создания: id берём из draft
    if (typeof draft.id !== "number" || !Number.isSafeInteger(draft.id) || draft.id <= 0) {
      errors.id = "id должен быть положительным целым числом";
    } else if (tasks.some((t) => t.id === draft.id)) {
      errors.id = "Задача с таким id уже существует";
    } else {
      id = draft.id;
    }
  } else {
    // режим редактирования: id берём из editingId
    if (typeof editingId !== "number" || !Number.isSafeInteger(editingId) || editingId <= 0) {
      errors.id = "Некорректный id редактирования";
    } else if (!tasks.some((t) => t.id === editingId)) {
      errors.id = "Редактируемая задача не найдена";
    } else {
      id = editingId;
    }
  }

  let title;
  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    const cleaned = draft.title.trim();
    if (cleaned.length < 1 || cleaned.length > 100) {
      errors.title = "Длина названия должна быть от 1 до 100";
    } else {
      title = cleaned;
    }
  }

  let priority;
  if (!VALID_PRIORITIES.includes(draft.priority)) {
    errors.priority = "Приоритет должен быть low, medium или high";
  } else {
    priority = draft.priority;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { id, title, priority } };
}