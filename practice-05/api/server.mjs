import http from "node:http";
import { tasks, categories } from "./data.js";

const PORT = Number(process.argv[2]) || 5505;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, code, message, details = {}) {
  sendJson(res, status, { error: { code, message, details } });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === "/api/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  if (path === "/api/tasks") {
    let result = [...tasks];
    const { completed, priority, categoryId, q } = Object.fromEntries(url.searchParams);

    if (completed !== undefined) {
      if (completed !== "true" && completed !== "false") {
        return sendError(res, 400, "INVALID_QUERY", "completed must be true or false");
      }
      result = result.filter((t) => t.completed === (completed === "true"));
    }
    if (priority !== undefined) {
      if (!["low", "medium", "high"].includes(priority)) {
        return sendError(res, 400, "INVALID_QUERY", "priority must be low/medium/high");
      }
      result = result.filter((t) => t.priority === priority);
    }
    if (categoryId !== undefined) {
      const id = Number(categoryId);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return sendError(res, 400, "INVALID_QUERY", "categoryId must be positive integer");
      }
      result = result.filter((t) => t.categoryId === id);
    }
    if (q !== undefined && q !== "") {
      result = result.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
    }

    return sendJson(res, 200, {
      data: result,
      meta: {
        total: result.length,
        filters: { completed, priority, categoryId, q },
      },
    });
  }

  const taskMatch = path.match(/^\/api\/tasks\/(\d+)$/);
  if (taskMatch) {
    const id = Number(taskMatch[1]);
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return sendError(res, 404, "TASK_NOT_FOUND", `Задача с id ${id} не найдена.`, { id });
    }
    return sendJson(res, 200, task);
  }

  if (path === "/api/categories") {
    return sendJson(res, 200, { data: categories, meta: { total: categories.length } });
  }

  const catMatch = path.match(/^\/api\/categories\/(\d+)$/);
  if (catMatch) {
    const id = Number(catMatch[1]);
    const cat = categories.find((c) => c.id === id);
    if (!cat) {
      return sendError(res, 404, "CATEGORY_NOT_FOUND", `Категория с id ${id} не найдена.`, { id });
    }
    return sendJson(res, 200, cat);
  }

  if (path === "/api/debug/error") {
    return sendError(res, 503, "SERVICE_UNAVAILABLE", "Сервис временно недоступен");
  }
  if (path === "/api/debug/invalid-json") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end("{ broken json");
  }
  if (path === "/api/debug/text") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("это текст, а не JSON");
  }
  if (path === "/api/debug/delay") {
    const ms = Number(url.searchParams.get("ms") || 0);
    setTimeout(() => sendJson(res, 200, { delayed: ms }), Math.min(ms, 5000));
    return;
  }

  return sendError(res, 404, "NOT_FOUND", `Маршрут ${path} не найден`);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`API: http://127.0.0.1:${PORT}/api`);
});