// const display = document.getElementById("calc-display");
// const buttons = document.querySelectorAll(".calc-interface button");

// // Mapping for button text to JS expression
// const operations = {
//     "π": "Math.PI",
//     "e": "Math.E",
//     "sin": "Math.sin(",
//     "cos": "Math.cos(",
//     "tan": "Math.tan(",
//     "sin⁻¹": "Math.asin(",
//     "cos⁻¹": "Math.acos(",
//     "tan⁻¹": "Math.atan(",
//     "log": "Math.log10(",
//     "ln": "Math.log(",
//     "√": "Math.sqrt(",
//     "^": "**",
//     "abs": "Math.abs(",
//     "EE": "* 10 ** (",
//     "%": "/100",
//     "!": "!",
//     "÷": "/",
//     "x": "*",
//     "AC": "AC",
//     "del": "del",
//     "=": "=",
//     "logₓ": "logx("
// };

// function factorial(n) {
//     if (n < 0) return NaN;
//     return n <= 1 ? 1 : n * factorial(n - 1);
// }

// function evaluate(expression) {
//     // Handle factorials
//     expression = expression.replace(/(\d+)!/g, (_, n) => factorial(Number(n)));

//     // Handle logₓ format: logx(a,b) => Math.log(b) / Math.log(a)
//     expression = expression.replace(/logx\(([^,]+),([^\,\)]+)\)/g, (_, base, val) =>
//         `(Math.log(${val}) / Math.log(${base}))`
//     );

//     try {
//         return eval(expression);
//     } catch (err) {
//         return "Error";
//     }
// }

// buttons.forEach(button => {
//     button.addEventListener("click", () => {
//         const value = button.textContent.trim();
//         if (value === "=") {
//             display.value = evaluate(display.value);
//         } else if (value === "AC") {
//             display.value = "";
//         } else if (value === "del") {
//             display.value = display.value.slice(0, -1);
//         } else if (operations[value]) {
//             if (operations[value].endsWith("(")) {
//                 display.value += operations[value]; // functions
//             } else {
//                 display.value += operations[value]; // constants or operators
//             }
//         } else {
//             display.value += value;
//         }
//     });
// });