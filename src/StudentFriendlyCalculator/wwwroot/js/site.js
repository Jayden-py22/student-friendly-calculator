// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
function parse_expression(expression){
    const lower_expr = expression.toLowerCase();
    let tokens = lower_expr.split(/(\(|\)|arcsin|arccos|arctan|log|ln|sin|cos|tan|pi|\+|\×|-|÷)/)
    tokens = tokens.filter(t => t !== '');
    // console.log("Pre-parse:", {expression})
    const map = {
        "sin": "Sin",
        "cos": "Cos",
        "tan": "Tan",
        "arcsin": "Asin",
        "arccos": "Acos",
        "arctan": "Atan",
        "ln": "Ln",
        "log": "Log",
        "pi": "PI",
        "π": "PI",
        "÷": "/",
        "×": "*"
    };
    let mapped = tokens.map(t => {
        return map[t] !== undefined ? map[t] : t;
    });
    console.log("Parsed:", mapped)

    for (let i = 0; i < mapped.length; i++) {
        const token = mapped[i];
        // parse Log
        if (token == "Log" || token == "Ln") {
            if(token == "Ln"){
                mapped[i] = "Log"
            }
            const base = token == "Log" ? "10" : "e";
            const openIdx = i + 1;
            console.log(openIdx, ", ", mapped[openIdx])
            if (mapped[openIdx] == "(") {
                let depth = 1;
                // scan corresponding ")"
                for (let j = openIdx + 1; j < mapped.length; j++) {
                    if (mapped[j] == "(") {
                        depth++;
                    } else if (mapped[j] == ")") {
                        depth--;
                        if (depth == 0) {
                            console.log("parse")
                            mapped[j] = ", " + base + ")"
                            break;
                        }
                    }
                }
            }
        }
    }
    console.log("functionized:", mapped)
    return mapped.join("")
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
    container.insertAdjacentHTML("afterbegin", `
        <div class="hist-option" data-index="${index}">
            <div class="hist-left">
                <button class="hist-result">${result}</button>
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
        HistoryContainer.insertAdjacentHTML("afterbegin", `
            <div class="hist-option" data-index="${index}">
                <div class="hist-left">
                    <button class="hist-result">${result}</button>
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
        const result = clickedElement.textContent;
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
        RenderFullHistory();
    }
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