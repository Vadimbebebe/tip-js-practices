export class ApiError extends Error {
  constructor(kind, message, extra = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    Object.assign(this, extra);
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const base = new URL(baseUrl);
  if (base.search || base.hash) {
    throw new Error("baseUrl не должен содержать query или hash");
  }
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  const url = new URL(`${trimmedBase}/${trimmedPath}`);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 5000 } = {}) {
  if (!baseUrl || typeof baseUrl !== "string") throw new Error("baseUrl обязателен");
  if (typeof fetchFn !== "function") throw new Error("fetchFn должен быть функцией");
  if (typeof timeoutMs !== "number" || timeoutMs <= 0) throw new Error("timeoutMs должен быть > 0");

  async function requestJson(path, { query, signal, timeoutMs: localTimeout } = {}) {
    const url = buildUrl(baseUrl, path, query);
    const timeoutSignal = AbortSignal.timeout(localTimeout ?? timeoutMs);
    const combinedSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;

    let response;
    try {
      response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        const kind = signal?.aborted ? "aborted" : "timeout";
        throw new ApiError(kind, kind === "timeout" ? "Тайм-аут" : "Отменено", { cause: err, url });
      }
      throw new ApiError("network", err.message || "Сетевая ошибка", { cause: err, url });
    }

    if (!(response instanceof Response)) {
      throw new ApiError("invalid-response", "fetchFn вернул не Response", { url });
    }

    if (!response.ok) {
      let payload = null;
      try { payload = await response.json(); } catch { /* ignore */ }
      const code = payload?.error?.code;
      const message = payload?.error?.message || `HTTP ${response.status}`;
      throw new ApiError("http", message, {
        status: response.status, code, details: payload?.error?.details, url,
      });
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new ApiError("invalid-response", "Ожидался JSON", { url });
    }

    try {
      return await response.json();
    } catch (err) {
      throw new ApiError("invalid-response", "Неверный JSON", { cause: err, url });
    }
  }

  return { requestJson };
}