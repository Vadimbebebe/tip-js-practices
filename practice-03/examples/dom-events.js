const log = (msg) => {
  const el = document.querySelector("#log");
  el.textContent += msg + "\n";
};

// 1. Отсутствующий элемент и пустая коллекция
const missing = document.querySelector("#missing-element");
const emptyList = document.querySelectorAll(".nothing-here");
log(`1) missing: ${missing}, emptyList.length: ${emptyList.length}`);

// 2. dataset.taskId
const addButton = document.querySelector("#add-button");
log(`2) taskId: ${addButton.dataset.taskId} (${typeof addButton.dataset.taskId})`);
const idNum = Number(addButton.dataset.taskId);
log(`2) Number(taskId): ${idNum} (${typeof idNum})`);

// 3. Дважды добавить запись — сохранённая коллекция не растёт
const savedItems = document.querySelectorAll("#initial-items li");
log(`3) savedItems.length сразу: ${savedItems.length}`);
addButton.addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = "Новая";
  document.querySelector("#initial-items").append(li);
  log(`3) savedItems.length осталась: ${savedItems.length}`);
  log(`3) новый запрос: ${document.querySelectorAll("#initial-items li").length}`);
});

// 4. textContent vs HTML
const titleButton = document.querySelector("#title-button");
titleButton.addEventListener("click", (event) => {
  const value = "<strong>Проверка</strong> & \"кавычки\"";
  document.querySelector("#page-title").textContent = value;
  log(`4) в заголовке: ${document.querySelector("#page-title").textContent}`);
});

// 5. Журнал события
document.addEventListener("click", (e) => {
  log(`5) capture target=${e.target.tagName}, phase=${e.eventPhase}, current=${e.currentTarget.tagName}`);
}, true);

titleButton.addEventListener("click", (e) => {
  log(`5) bubble target=${e.target.tagName}, phase=${e.eventPhase}, current=${e.currentTarget.tagName}`);
});