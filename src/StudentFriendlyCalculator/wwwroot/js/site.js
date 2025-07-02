// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
function parse_expression(expression){
    const lower_expr = expression.toLowerCase();
    let tokens = lower_expr.split(/(\(|\)|arcsin|sin⁻¹|arccos|cos⁻¹|arctan|tan⁻¹|log|ln|π|sin|\^|cos|tan|pi|%|\+|×|-|!|e|÷)/)
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
        "√": "sqrt"
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
}

function deleteFromDisplay() {
    const inputBox = document.getElementById("calc-display");
    if (inputBox) {
        inputBox.value = inputBox.value.slice(0, -1);
    }
}

function initDisplay() {
    if (inputBox) {
        inputBox.value = "";
    }
}


// preprocess the button click event
function calcButtonHandler(value) {
    // console.log("Button clicked:", value);
    if(value == "del"){
        deleteFromDisplay();
    }
    else if(value == "AC"){
        initDisplay();
    }
    else if(value == "="){
        calcSubmission();
    }
    else if(value == "×"){
        appendToDisplay("×");
    }
    else if(value == "÷"){
        appendToDisplay("÷");
    }
    else {
        appendToDisplay(value);
    }
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
        .then(res => res.json())
        .then(data => {
            if (data.result !== undefined) {
                document.getElementById("calc-display").value = `${data.result}`;
                AddToHistory(`${data.result}`, expr);
            } else {
                console.log(data.error);
            }
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

// Switch to standard calculator
const standardCalcButton = document.querySelector("#standard");
standardCalcButton.addEventListener("click", () => {
    standardStylesheet.disabled = false;
    scientificStylesheet.disabled = true;
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
})

// Switch to scientific calculator
const sciCalcButton = document.querySelector("#scientific");
sciCalcButton.addEventListener("click", () => {
    standardStylesheet.disabled = true;
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
            <button class="calc-button-btwn">EE</button>
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button class="calc-button-op">÷</button>
            <button class="calc-button-btwn">ln</button>
            <button class="calc-button-btwn">π</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button class="calc-button-op">×</button>
            <button class="calc-button-btwn">%</button>
            <button class="calc-button-btwn">!</button>
            <button>7</button>
            <button>8</button>
            <button>9</button>
            <button class="calc-button-op">-</button>
            <button class="calc-button-btwn">√</button>
            <button class="calc-button-btwn">>^</button>
            <button class="calc-button-white">.</button>
            <button>0</button>
            <button class="calc-button-white">=</button>
            <button class="calc-button-op">+</button>
    `;
})

// Switch to equation solver
const eqCalcButton = document.querySelector("#equation");
eqCalcButton.addEventListener("click", () => {
    // Enable standard stylesheet, disable scientific stylesheet
    standardStylesheet.disabled = false;
    scientificStylesheet.disabled = true;

    // Inject Equation Solver interface into the container
    calcContainer.innerHTML = `
        <button class="calc-button-btwn">logₓ</button>
        <button class="calc-button-btwn">abs</button>
        <button class="calc-button-white">(</button>
        <button class="calc-button-white">)</button>
        <button class="calc-button-white">AC</button>
        <button class="calc-button-white">del</button>

        <button class="calc-button">7</button>
        <button class="calc-button">8</button>
        <button class="calc-button">9</button>
        <button class="calc-button-op">÷</button>

        <button class="calc-button">4</button>
        <button class="calc-button">5</button>
        <button class="calc-button">6</button>
        <button class="calc-button-op">×</button>

        <button class="calc-button">1</button>
        <button class="calc-button">2</button>
        <button class="calc-button">3</button>
        <button class="calc-button-op">-</button>

        <button class="calc-button">0</button>
        <button class="calc-button-white">.</button>
        <button class="calc-button">x</button>
        <button class="calc-button-op">+</button>

        <button class="calc-button-white" id="solve-btn">=</button>
    `;

    // Bind the solve button to trigger calculation
    document.querySelector("#solve-btn").addEventListener("click", () => {
        calcSubmission();
    });
});

// Equation Solver navigation
const eqButtonNav = document.querySelector("#equation");
eqButtonNav.addEventListener("click", () => {
    window.location.href = "/EquationSolver";
});