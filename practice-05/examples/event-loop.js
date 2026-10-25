console.log("A");
setTimeout(() => console.log("D"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("B");
Promise.resolve().then(() => console.log("E"));
setTimeout(() => console.log("F"), 0);