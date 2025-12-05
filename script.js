// Niveles con retos
const levels = [
    {
        title: "Introducción",
        unlocked: true,
        explanation:
        "Python es un lenguaje de programación muy popular. Vamos a aprender paso a paso.",
        task: "Escribe print('Hola Mundo')",
        check: code => code.includes("print('Hola Mundo')"),
    },

    {
        title: "Nivel 1: Variables",
        unlocked: true,
        explanation:
        "Una variable guarda valores. Se asigna con name = valor.",
        task: "Crea una variable llamada edad con valor 18",
        check: code => code.includes("edad") && code.includes("18"),
    },

    {
        title: "Nivel 2: Tipos de Datos",
        unlocked: false,
        explanation:
        "Las strings van entre comillas.",
        task: "Crea una variable nombre con tu nombre.",
        check: code => code.includes("nombre") && code.includes('"'),
    },

    {
        title: "Nivel 3: Condicionales",
        unlocked: false,
        explanation:
        "if es para tomar decisiones.",
        task: "Escribe un if que imprima 'OK' si x es 5",
        check: code => code.includes("if") && code.includes("print") && code.includes("5"),
    },

    {
        title: "Nivel 4: Bucles",
        unlocked: false,
        explanation:
        "Los bucles repiten código.",
        task: "Escribe un for que imprima los números del 1 al 3.",
        check: code => code.includes("for"),
    }
]

let currentLevel = 0;

// Render menu
function renderMenu(){
    const menu = document.getElementById("levelsMenu");
    menu.innerHTML = '<div class="menu-title">Niveles</div>';

    levels.forEach((lvl, i) => {
        const btn = document.createElement("button");
        btn.className = "level-btn" + (lvl.unlocked ? "" : " locked");
        btn.textContent = lvl.title;

        if(i === currentLevel) btn.classList.add("active");

        btn.onclick = () => {
            if(!lvl.unlocked) return;
            currentLevel = i;
            renderLevel();
            renderMenu();
        }

        menu.appendChild(btn);
    });
}

// Render level content
function renderLevel(){
    const lvl = levels[currentLevel];

    document.getElementById("levelTitle").textContent = lvl.title;
    document.getElementById("explanation").textContent = lvl.explanation;
    document.getElementById("task").textContent = "Misión: " + lvl.task;
    document.getElementById("result").textContent = "";
    document.getElementById("editor").value = "";
}

// Run button
document.getElementById("runBtn").onclick = () => {
    const code = document.getElementById("editor").value;
    const lvl = levels[currentLevel];

    if(lvl.check(code)){
        document.getElementById("result").style.color = "#00ff00";
        document.getElementById("result").textContent = "MISIÓN COMPLETADA ✔";

        unlockNext();
    } else {
        document.getElementById("result").style.color = "red";
        document.getElementById("result").textContent = "Error. Revisa tu código.";
    }
};

// Unlock next level
function unlockNext(){
    if(currentLevel + 1 < levels.length){
        levels[currentLevel + 1].unlocked = true;
    }
    renderMenu();
}

// Init
renderMenu();
renderLevel();
