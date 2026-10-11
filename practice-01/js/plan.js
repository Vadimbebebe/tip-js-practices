"use strict";

const totalTasks = 20;      
const completedTasks = 11;  
const dailyLimit = 6;       

if (typeof totalTasks !== "number" || typeof completedTasks !== "number" ||
    !Number.isInteger(totalTasks) || !Number.isInteger(completedTasks) ||
    totalTasks < 0 || totalTasks > 1000 ||
    completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: некорректные данные о задачах");
} else if (typeof dailyLimit !== "number" || !Number.isInteger(dailyLimit) ||
           dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом 1..1000");
} else {
  let remaining = totalTasks - completedTasks;
  let day = 0;

  console.log("Осталось задач:", remaining);

  while (remaining > 0) {
    day += 1;
    const doneToday = Math.min(dailyLimit, remaining);
    remaining -= doneToday;
    console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
  }

  console.log("Потребуется дней:", day);
}