﻿// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
function parse_expression(expression){
    const lower_expr = expression.toLowerCase();
    let tokens = lower_expr.split(/(\(|\)|arcsin|sin⁻¹|arccos|cos⁻¹|arctan|tan⁻¹|log|ln|π|x²|√|sin|\^|cos|tan|pi|%|\+|×|-|!|e|𝑒|÷)/)
    tokens = tokens.filter(t => t !== '');
    // console.log("Pre-parse:", {expression})
    const map = {
        "sin": "Sin",
        "cos": "Cos",
        "tan": "Tan",
        "arcsin": "Asin",
        "sin⁻¹": "asin",
        "arccos": "Acos",
        "cos⁻¹": "Acos",
        "arctan": "Atan",
        "tan⁻¹": "Atan",
        "ln": "Ln",
        "log": "Log",
        "pi": "PI",
        "π": "PI",
        "÷": "/",
        "×": "*",
        "𝑒": "e",
        "√": "Sqrt"
    };
    let mapped = tokens.map(t => {
        return map[t] !== undefined ? map[t] : t;
    });
    console.log("Parsed:", mapped)

    for (let i = 0; i < mapped.length; i++) {
        const token = mapped[i];
        if (token == "Log" || token == "Ln") {
            // parse Log
            if(token == "Ln"){
                mapped[i] = "Log"
            }
            const base = token == "Log" ? "10" : "e";
            const openIdx = i + 1;
            console.log(openIdx, ", ", mapped[openIdx])
            if (mapped[openIdx] == "(") {   
                let closeIdx = findClosingParenIdx(mapped, openIdx, base);
                console.log("Log: ", closeIdx);
                mapped[closeIdx] = `,${base})`;
            } else{
                console.error("error: no opening parenthesis for parsing log")
            }
        } else if(token == "!"){
            // factorial: (3+2)! -> factorial(3+2)
            const closeIdx = i-1;
            if(mapped[closeIdx] == ")"){
                mapped[i] = ``; 
                let openIdx = findOpeningParenIdx(mapped, closeIdx);
                mapped[openIdx] = `factorial(`;
            } else{
                // case: no parenthesis 2! -> factorial(2) 
                mapped[i] = `)`;
                mapped[i-1] = `factorial(` + mapped[i-1]
            }
        } else if(token == "sqrt"){
            // root: sqrt(2+3) -> sqrt(2+3)
        } else if(token == "^"){
            // exponential: (1+2)^3 -> Pow((1+2),3)
            mapped[i] = ",";
            let formerCloseIdx = i-1;
            let latterOpenIdx = i+1;
            if(mapped[formerCloseIdx] == ")"){
                let formerOpenIdx = findOpeningParenIdx(mapped, formerCloseIdx);
                mapped[formerOpenIdx] = "Pow((";
            } else{
                mapped[formerCloseIdx] = "Pow(" + mapped[formerCloseIdx];
            }
            if(mapped[latterOpenIdx] == "("){
                let latterCloseIdx = findClosingParenIdx(mapped, latterOpenIdx)
                mapped[latterCloseIdx] = mapped[latterCloseIdx] + ")"
            } else{
                mapped[latterOpenIdx] = mapped[latterOpenIdx] + ")";
            }
        }
    }
    console.log("functionized:", mapped)
    return mapped.join("")

    function findClosingParenIdx(mapped, openIdx) {
        // tokens: ["123", "+","Sin", "(", "pi","*","2",")"]
        // startIdx: 3
        // return: 7

        let depth = 0;
        let closeIdx = openIdx;
        // scan corresponding ")"
        for (closeIdx; closeIdx < mapped.length; closeIdx++) {
            if (mapped[closeIdx] == "(") {
                depth++;
            } else if (mapped[closeIdx] == ")") {
                depth--;
                if (depth == 0) {
                    return closeIdx;
                }
            }
        }
    }

    function findOpeningParenIdx(mapped, closeIdx) {
        // tokens: ["123", "+", "(","2",")", "!"]
        // startIdx: 4
        // return: 2

        let depth = 0;
        let openIdx = closeIdx;
        // scan corresponding "("
        for (openIdx; openIdx >= 0; openIdx--) {
            if (mapped[openIdx] == ")") {
                depth++;
            } else if (mapped[openIdx] == "(") {
                depth--;
                if (depth == 0) {
                    return openIdx;
                }
            }
        }
    }
}

//simply add or delete from the display&expression
function appendToDisplay(value) {
    const inputBox = document.getElementById("calc-display");
    if (inputBox) {
        inputBox.value += value;
    }
    checkForError()
}

// Checks to see if error text is in value, and if so, remove it
function checkForError() {
    const inputBox = document.getElementById("calc-display");
    if (inputBox.value.includes(`ERROR`)) {
        inputBox.value = inputBox.value.replace(`ERROR`, ``);
    }
}

function deleteFromDisplay() {
    const inputBox = document.getElementById("calc-display");
    if (inputBox) {
        inputBox.value = inputBox.value.slice(0, -1);
    }
    checkForError()
}

function initDisplay() {
    if (inputBox) {
        inputBox.value = "";
    }
}


// preprocess the button click event
function calcButtonHandler(value) {
    if (value === "del")            deleteFromDisplay();
    else if (value === "AC")        initDisplay();
    else if (value === "=")         calcSubmission();
    else if (value === "x²") {
        const inputBox = document.getElementById("calc-display");
        if (inputBox) {
            const current = inputBox.value;
            if (current.slice(-1) === "x") {
                // If it ends in x, just add ^2.
                inputBox.value += "^2";
            } else {
                // Otherwise insert x^2 whole string
                inputBox.value += "x^2";
            }
        }
    }
    else if (value === "√")         appendToDisplay("√(");
    else if (value === "π")         appendToDisplay("π");
    else if (["sin","cos","tan"].includes(value))
                                     appendToDisplay(value+"(");
    else if (value === "×")         appendToDisplay("×");
    else if (value === "÷")         appendToDisplay("÷");
    else                            appendToDisplay(value);
}

let histlist = [];

// Called when an operation is executed to render history and add to localStorage
function AddToHistory(result, expression) {
    if ( result !== expression ) {
        RenderHistory(result, expression)
        histlist.push([result, expression]);
        SaveHistory();
    }
}

// Adds additional history card
function RenderHistory(result, expression) {
    const index = histlist.length;
    const container = document.getElementById("hist-select");
    // const displayResult = result.length > 6 ? result.slice(0, 6) + "…" : result;
    container.insertAdjacentHTML("afterbegin", `
        <div class="hist-option" data-index="${index}">
            <div class="hist-left">
                <button class="hist-result" title="${result}">${result}</button>
                <p class="hist-operation">=${expression}</p>
            </div>
            <button class="hist-delete">X</button>
        </div>
    `);
    const clearAll = document.querySelector(".clear-hist");
    clearAll.removeAttribute("id");
}

// Rerenders all history cards when needed
function RenderFullHistory() {
    const HistoryContainer = document.querySelector('#hist-select');
    HistoryContainer.innerHTML = `<button class="clear-hist">Clear All History</button>`;
    histlist.forEach(([result, expression], index) => {
        // const displayResult = result.length > 6 ? result.slice(0, 6) + "…" : result;
        HistoryContainer.insertAdjacentHTML("afterbegin", `
            <div class="hist-option" data-index="${index}">
                <div class="hist-left">
                    <button class="hist-result" title="${result}">${result}</button>
                    <p class="hist-operation">=${expression}</p>
                </div>
                <button class="hist-delete">X</button>
            </div>
        `);
    });

    const clearAll = document.querySelector(".clear-hist");
    if (histlist.length != 0) {
        clearAll.removeAttribute("id");
    } else {
        clearAll.id = "hide";
    }

    document.querySelector(".clear-hist").addEventListener("click", () => {
        localStorage.removeItem("calc-history-list");
        histlist = [];
        RenderFullHistory();
    });
}

// Functionality to import result from & delete history card
document.querySelector("#hist-select").addEventListener("click", (event) => {
    const clickedElement = event.target;

    if (clickedElement.classList.contains("hist-result")) {
        const result = clickedElement.title;
        calcButtonHandler(result);
    } else if (clickedElement.classList.contains("hist-delete")) {
        const histCard = clickedElement.closest(".hist-option");
        if (histCard) {
            const index = parseInt(histCard.dataset.index);
            if (!isNaN(index)) {
                histlist.splice(index, 1);
                SaveHistory();
            }
            RenderFullHistory();
        }
    }
});

// Saves history content to localStorage
function SaveHistory() {
    localStorage.setItem("calc-history-list", JSON.stringify(histlist));
}

// Ran at page load to parse localStorage
function LoadHistory() {
    const saved = localStorage.getItem("calc-history-list");
    if (saved) {
        histlist = JSON.parse(saved);
    }
    RenderFullHistory();
}

// Clear all history button
document.querySelector(".clear-hist").addEventListener("click", () => {
    localStorage.removeItem("calc-history-list");
    histlist = [];
    RenderFullHistory();
});

// Check for button press events to input into calculator
document.addEventListener("keydown", function(e) {
    const inputBox = document.getElementById("calc-display");
    const key = e.key; 
    const allowedKeys = [
        ..."0123456789",
        ..."+-*/().^!%π",
        ..."abcdefghijklmnopqrstuvwxyz",
        ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ];

    if (document.activeElement === inputBox) {
        return;
    }

    if (key === "Enter") {
        calcButtonHandler("=");
        e.preventDefault();
        checkForError()
        return;
    }

    if (key === "Backspace") {
        calcButtonHandler("del");
        e.preventDefault();
        return;
    }

    if (allowedKeys.includes(key)) {
        calcButtonHandler(key);
    }
});

// Event delegation for the calculator buttons; all content inside runs at page load
document.addEventListener("DOMContentLoaded", function () {
    LoadHistory();
    const interfaceDiv = document.querySelector(".calc-interface");
    if (interfaceDiv) {
        interfaceDiv.addEventListener("click", function (event) {
            if (event.target.tagName === "BUTTON") {
                const value = event.target.innerHTML.trim();
                calcButtonHandler(value);
            }
        });
    }

    const path = window.location.pathname.toLowerCase();
    if (path === "/index" || path === "/") {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get("mode");

        if (mode === "scientific") {
            document.querySelector("#scientific")?.click();
        } else if (mode === "programming") {
            document.querySelector("#programming")?.click();
        } else {
            document.querySelector("#standard")?.click();
        }

        const container = document.getElementById("functional-container");
        if (container) {
            container.style.visibility = "visible";
        }
    }
});

// This handles math expression submission
function calcSubmission() {
    const expr = document.getElementById("calc-display").value;
    const parsedExpr = parse_expression(expr);
    console.log(expr);

    fetch("/Index?handler=CalcSubmission", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: parsedExpr })
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log(data);
            if (data.result !== undefined) {
                document.getElementById("calc-display").value = `${data.result}`;
                AddToHistory(`${data.result}`, expr);
            } else {
                console.log(data.error || "Unknown error");
                document.getElementById("calc-display").value = `ERROR`;
            }
        })
        .catch(error => {
            console.error("Fetch failed:", error);
            document.getElementById("calc-display").value = `ERROR`;
        });
}

// handling user pressing enter to start operation
const inputBox = document.getElementById("calc-display")
inputBox.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        calcSubmission()
    }
});

// Define elements for calculator switching
const calcContainer = document.querySelector(".calc-interface");
const standardStylesheet = document.getElementById("standard-style");
const scientificStylesheet = document.getElementById("scientific-style");
const equationStylesheet = document.getElementById("equation-style");
const programmingStylesheet = document.getElementById("programming-style");
const unitStylesheet = document.getElementById("unit-style");

function clearAllCalcStyles() {
    // TO-DO: Clear all calc styles as needed
    standardStylesheet.disabled = true;
    scientificStylesheet.disabled = true;
    equationStylesheet.disabled = true;
    programmingStylesheet.disabled = true;
    unitStylesheet.disabled = true;
}

// Switch to standard calculator
const standardCalcButton = document.querySelector("#standard");
standardCalcButton.addEventListener("click", () => {
    clearAllCalcStyles();
    standardStylesheet.disabled = false;
    calcContainer.innerHTML = `
            <!-- First Row buttons  -->
            <button class="calc-button-white">(</button>
            <button class="calc-button-white">)</button>
            <button class="calc-button-white">AC</button>
            <button class="calc-button-white">del</button>
            <!-- Second Row buttons  -->
            <button>7</button>
            <button>8</button>
            <button>9</button>
            <button class="calc-button-op">÷</button>
            <!-- Third Row buttons  -->
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button class="calc-button-op">×</button>
            <!-- Fourth Row buttons  -->
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button class="calc-button-op">-</button>
            <!-- Fifth Row buttons  -->
            <button class="calc-button-white">.</button>
            <button>0</button>
            <button class="calc-button-white">=</button>
            <button class="calc-button-op">+</button>
    `;

    document.querySelector("#solve-btn").addEventListener("click", () => {
        calcSubmission();
    });
})

// Switch to scientific calculator
const sciCalcButton = document.querySelector("#scientific");
sciCalcButton.addEventListener("click", () => {
    clearAllCalcStyles();
    scientificStylesheet.disabled = false;
    calcContainer.innerHTML = `
            <button class="calc-button-btwn">cos⁻¹</button>
            <button class="calc-button-btwn">sin⁻¹</button>
            <button class="calc-button-btwn">tan⁻¹</button>
            <button class="calc-button-btwn">cos</button>
            <button class="calc-button-btwn">sin</button>
            <button class="calc-button-btwn">tan</button>
            <button class="calc-button-btwn">logₓ</button>
            <button class="calc-button-btwn">abs</button>
            <button class="calc-button-white">(</button>
            <button class="calc-button-white">)</button>
            <button class="calc-button-white">AC</button>
            <button class="calc-button-white">del</button>
            <button class="calc-button-btwn">log</button>
            <button class="calc-button-btwn">e</button>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button class="calc-button-op">+</button>
            <button class="calc-button-btwn">ln</button>
            <button class="calc-button-btwn">π</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button class="calc-button-op">-</button>
            <button class="calc-button-btwn">%</button>
            <button class="calc-button-btwn">!</button>
            <button>7</button>
            <button>8</button>
            <button>9</button>
            <button class="calc-button-op">×</button>
            <button class="calc-button-btwn">√</button>
            <button class="calc-button-btwn">^</button>
            <button class="calc-button-white">.</button>
            <button>0</button>
            <button class="calc-button-white">=</button>
            <button class="calc-button-op">÷</button>
    `;

    document.querySelector("#solve-btn").addEventListener("click", () => {
        calcSubmission();
    });
})

// Switch to equation solver
const eqCalcButton = document.querySelector("#equation");
eqCalcButton.addEventListener("click", () => window.location.href = "/EquationSolver");

// Switch to programming calculator
const pgCalcButton = document.querySelector("#programming");
pgCalcButton.addEventListener("click", () => {
    clearAllCalcStyles();
    programmingStylesheet.disabled = false;
    calcContainer.innerHTML = `
            <button class="calc-button-white">(</button>
            <button class="calc-button-white">)</button>
            <button class="calc-button-white">AC</button>
            <button class="calc-button-white">del</button>
            <button class="calc-button-btwn">A</button>
            <button class="calc-button-btwn">B</button>
            <button class="calc-button-btwn">C</button>
            <button class="calc-button-btwn">Dec</button>
            <button class="calc-button-btwn">D</button>
            <button class="calc-button-btwn">E</button>
            <button class="calc-button-btwn">F</button>
            <button class="calc-button-btwn">Hex</button>
            <button>7</button>
            <button>8</button>
            <button>9</button>
            <button class="calc-button-op">AND</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button class="calc-button-op">OR</button>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button class="calc-button-op">NOR</button>
            <button class="calc-button-white">bin</button>
            <button>0</button>
            <button class="calc-button-white" id="double-size">=</button>
            <button class="calc-button-op">XOR</button>
    `;

    // Bind the solve button to trigger calculation
    document.querySelector("#solve-btn").addEventListener("click", () => {
        calcSubmission();
    });
});

// Switch to unit converter
const utConvButton = document.querySelector("#unit");
utConvButton.addEventListener("click", () => window.location.href = "/MassConverter");