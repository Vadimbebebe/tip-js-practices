import { ApiError } from "./api-client.js";

const PRIORITIES = ["low", "medium", "high"];

function assertTask(task) {
  if (!task || typeof task !== "object") throw new ApiError("invalid-response", "Задача не объект");
  if (typeof task.id !== "number" || !Number.isSafeInteger(task.id) || task.id <= 0) {
    throw new ApiError("invalid-response", "Некорректный id задачи");
  }
  if (typeof task.title !== "string" || task.title.trim().length === 0) {
    throw new ApiError("invalid-response", "Некорректное название задачи");
  }
  if (typeof task.completed !== "boolean") {
    throw new ApiError("invalid-response", "Некорректный completed");
  }
  if (!PRIORITIES.includes(task.priority)) {
    throw new ApiError("invalid-response", "Некорректный priority");
  }
  if (typeof task.categoryId !== "number" || !Number.isSafeInteger(task.categoryId) || task.categoryId <= 0) {
    throw new ApiError("invalid-response", "Некорректный categoryId");
  }
}

function assertCategory(cat) {
  if (!cat || typeof cat !== "object") throw new ApiError("invalid-response", "Категория не объект");
  if (typeof cat.id !== "number" || !Number.isSafeInteger(cat.id) || cat.id <= 0) {
    throw new ApiError("invalid-response", "Некорректный id категории");
  }
  if (typeof cat.name !== "string" || cat.name.trim().length === 0) {
    throw new ApiError("invalid-response", "Некорректное имя категории");
  }
}

function normalizeFilters(filters = {}) {
  const result = {};
  if (typeof filters.completed === "boolean") result.completed = filters.completed;
  if (typeof filters.priority === "string" && PRIORITIES.includes(filters.priority)) {
    result.priority = filters.priority;
  }
  if (typeof filters.categoryId === "number" && Number.isSafeInteger(filters.categoryId) && filters.categoryId > 0) {
    result.categoryId = filters.categoryId;
  }
  if (typeof filters.q === "string" && filters.q.length > 0 && filters.q.length <= 100) {
    result.q = filters.q;
  }
  return result;
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new Error("createTaskApi: client.requestJson обязателен");
  }

  async function getTasks(filters = {}) {
    const payload = await client.requestJson("/tasks", { query: normalizeFilters(filters) });
    if (!payload || !Array.isArray(payload.data)) {
      throw new ApiError("invalid-response", "tasks: ожидался массив data");
    }
    const ids = new Set();
    for (const task of payload.data) {
      assertTask(task);
      if (ids.has(task.id)) throw new ApiError("invalid-response", "Повторяющийся id задачи");
      ids.add(task.id);
    }
    if (typeof payload.meta?.total !== "number" || payload.meta.total !== payload.data.length) {
      throw new ApiError("invalid-response", "meta.total не совпадает с длиной data");
    }
    return { tasks: payload.data, meta: payload.meta };
  }

  async function getTaskById(id) {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
      throw new ApiError("invalid-response", "id должен быть положительным целым");
    }
    const task = await client.requestJson(`/tasks/${id}`);
    assertTask(task);
    return task;
  }

  async function getCategories() {
    const payload = await client.requestJson("/categories");
    if (!payload || !Array.isArray(payload.data)) {
      throw new ApiError("invalid-response", "categories: ожидался массив data");
    }
    const ids = new Set();
    for (const cat of payload.data) {
      assertCategory(cat);
      if (ids.has(cat.id)) throw new ApiError("invalid-response", "Повторяющийся id категории");
      ids.add(cat.id);
    }
    return payload.data;
  }

  async function loadInitialData(filters = {}) {
    const [tasksResult, categories] = await Promise.all([
      getTasks(filters),
      getCategories(),
    ]);
    return { tasks: tasksResult.tasks, categories, meta: tasksResult.meta };
  }

  return { getTasks, getTaskById, getCategories, loadInitialData };
}