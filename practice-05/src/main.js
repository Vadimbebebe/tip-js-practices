import { createApiClient, ApiError } from "./api-client.js";
import { createTaskApi } from "./task-api.js";
import { variantNumber, variantFilters } from "./variant.js";

const API_URL = process.env.API_URL || "http://127.0.0.1:5505/api";

async function main() {
  console.log("=== Практическая работа № 5 ===");
  console.log("API:", API_URL);
  console.log("Вариант:", variantNumber, "Фильтры:", variantFilters);

  const client = createApiClient({ baseUrl: API_URL });
  const api = createTaskApi(client);

  try {
    const { tasks, meta } = await api.getTasks(variantFilters);
    console.log("\nЗадачи по фильтру варианта:");
    console.log("URL:", `${API_URL}/tasks`, "params:", variantFilters);
    console.log("ids:", tasks.map((t) => t.id));
    console.log("meta.total:", meta.total);
  } catch (err) {
    handleError("getTasks", err);
  }

  try {
    const task = await api.getTaskById(999);
    console.log("Задача 999:", task);
  } catch (err) {
    handleError("getTaskById(999)", err);
  }

  try {
    const initial = await api.loadInitialData();
    console.log("\nloadInitialData: tasks =", initial.tasks.length, ", categories =", initial.categories.length);
  } catch (err) {
    handleError("loadInitialData", err);
  }
}

function handleError(context, err) {
  if (err instanceof ApiError) {
    console.error(`[${context}] ApiError kind=${err.kind}`, err.message);
  } else {
    console.error(`[${context}] Неожиданная ошибка:`, err);
  }
}

main();