## Задание 1. Эксперименты DOM и событий

| № | Прогноз | Факт | Причина |
|---|---|---|---|
| 1 | null, 0 | null, 0 | querySelector без совпадений возвращает null, querySelectorAll — пустую NodeList |
| 2 | "23" (string) → 23 (number) | "23" (string) → 23 (number) | dataset хранит строки, Number преобразует |
| 3 | Сохранённая длина не растёт | savedItems.length осталась 2, новый запрос 4 | querySelectorAll возвращает статическую коллекцию |
| 4 | Показывается строка, не жирный текст | <strong>Проверка</strong> & "кавычки" как текст | textContent не парсит HTML |
| 5 | target=SPAN, currentTarget=BUTTON, phase=3 | capture phase=1, bubble phase=3, target=SPAN, current=BUTTON | Клик по вложенному span всплывает к button, обработчик на document ловит раньше |

**Дополнительно (точка останова):** в обработчике `event.target === span#title-span`, `event.currentTarget === button#title-button`, `event.eventPhase === 3`.
# Практическая работа № 3

## Автор

- Имя: Твоё Имя
- Группа: Твоя Группа
- Вариант: 4

## Окружение

- ОС: Windows 11
- Node.js: версия из `node --version`
- npm: версия из `npm --version`
- Git: версия из `git --version`
- Браузер: Chrome или Edge, номер версии

## Запуск

Из корня `tip-js-practices`:

```bash
node practice-03/tools/serve.mjs
```

Сервер печатает `http://127.0.0.1:5503/`. В браузере открыть:
- `http://127.0.0.1:5503/` — общий набор
- `http://127.0.0.1:5503/index.html?dataset=variant` — вариант 4
- `http://127.0.0.1:5503/examples/dom-events.html` — эксперименты

Проверка сервиса:

```bash
node practice-03/checks/service.checks.js
```

## Задание 1. Эксперименты

| № | Прогноз | Факт | Причина |
|---|---|---|---|
| 1 | null, 0 | ... | ... |
| 2 | строка → число | ... | ... |
| 3 | сохранённая длина не растёт | ... | ... |
| 4 | строка как текст | ... | ... |
| 5 | target=SPAN, current=BUTTON, phase=3 | ... | ... |

## Модули

- `data.js` — наборы задач и номер варианта.
- `task-service.js` — функции ПР2.
- `task-selectors.js` — `getVisibleTasks`.
- `task-view.js` — отрисовка карточек и сводки.
- `main.js` — состояние и обработчики.

## Общий сценарий

| Шаг | Действие | Видимые id | Всего | Вып. | Ост. | Прогресс |
|---|---|---|---|---|---|---|
| 0 | исходно | ... | ... | ... | ... | ... |
| ... | | | | | | |

## Индивидуальный вариант (4)

Исходно 6 задач, прогресс 50.0%.
После toggle id=23 и удаления id=37: ...

## Проверки

`node practice-03/checks/service.checks.js`:

```
Пройдено: 35, провалено: 0
```

Собственные проверки:

| Проверка | Ожидание | Факт | Итог |
|---|---|---|---|
| Единственная задача | показывает 1 карточку | ... | ... |
| Все выполнены + фильтр «В работе» | пусто + сообщение | ... | ... |
| Двойное переключение | возврат к исходному | ... | ... |

## Вывод

Освоил DOM (querySelector, createElement, replaceChildren, textContent, dataset, classList), события (addEventListener, всплытие, closest), разделение состояния и видимой выборки.