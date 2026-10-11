// Эксперимент 1. Вызов sum с числами и со строкой.
function sum(a, b) {
  return a + b;
}

console.log("Эксперимент 1:");
console.log(sum(2, 3));
console.log(sum("2", "3"));
console.log(sum("2", 3));

// Эксперимент 2. Стрелочная функция с фигурными скобками.
// ОШИБКА: пропущен return — нужно исправить.
const square = (value) => {
  value * value;
};

console.log("Эксперимент 2:");
console.log(square(4));

// Эксперимент 3. Присваивание объекта второй переменной.
const original = { title: "Черновик", published: false };
const alias = original;
alias.published = true;

console.log("Эксперимент 3:");
console.log(original.published);
console.log(original === alias);

// Эксперимент 4. Копирование массива объектов через spread.
const items = [{ id: 1, done: false }, { id: 2, done: false }];
const itemsCopy = [...items];
itemsCopy[0].done = true;

console.log("Эксперимент 4:");
console.log(items[0].done);
console.log(itemsCopy[0].done);
console.log(items === itemsCopy);

// Эксперимент 5. Spread объекта и повторное указание свойства.
const oldBook = { id: 12, title: "Черновик", available: false };
const newBook = { ...oldBook, available: true };

console.log("Эксперимент 5:");
console.log(oldBook.available);
console.log(newBook.available);
console.log(oldBook === newBook);

// Эксперимент 6. Параметр по умолчанию.
function makeCaption(text = "Без названия") {
  return text;
}

console.log("Эксперимент 6:");
console.log(makeCaption());
console.log(makeCaption(undefined));
console.log(makeCaption(null));
console.log(makeCaption(""));