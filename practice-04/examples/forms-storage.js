const STORAGE_KEY = "tip-js-practice-04:experiment";

const log = (msg) => {
  const el = document.querySelector("#log");
  el.textContent += msg + "\n";
};

const form = document.querySelector("#demo-form");

form.addEventListener("submit", (event) => {
  log(`1) submit сработал, defaultPrevented до preventDefault: ${event.defaultPrevented}`);
  event.preventDefault();

  const fd = new FormData(form);
  const rawTitle = fd.get("title");
  log(`2) raw title = "${rawTitle}" (${typeof rawTitle}), длина после trim = ${rawTitle.trim().length}`);

  const titleInput = document.querySelector("#demo-title");
  if (titleInput.value.trim() === "") {
    titleInput.setCustomValidity("Название не должно быть пустым");
    log(`2) установлено customValidity, validity.valid = ${titleInput.validity.valid}`);
  } else {
    titleInput.setCustomValidity("");
    const payload = { title: rawTitle.trim() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    log(`3) сохранили: ${JSON.stringify(payload)}`);
  }
});

document.querySelector("#demo-title").addEventListener("input", () => {
  document.querySelector("#demo-title").setCustomValidity("");
});

document.querySelector("#btn-read").addEventListener("click", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  log(`4) raw getItem = ${raw} (${typeof raw})`);
  if (raw !== null) {
    const parsed = JSON.parse(raw);
    log(`4) JSON.parse вернул ${JSON.stringify(parsed)}`);
  }
});

document.querySelector("#btn-broken").addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, "{broken-json");
  log(`5) записали повреждённую строку, теперь нажми "Прочитать"`);
});

// кнопка «Прочитать» уже подключена; добавим try/catch
document.querySelector("#btn-read").addEventListener("click", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    const parsed = JSON.parse(raw);
    log(`5) корректный разбор: ${JSON.stringify(parsed)}`);
  } catch (e) {
    log(`5) ошибка JSON.parse: ${e.message}`);
  }
});