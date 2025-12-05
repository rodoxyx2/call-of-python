// Estado de niveles desbloqueados
let unlockedLevels = ["intro", "level1"];

// Contenido del juego
const topics = {

    intro: {
        theory: "Bienvenido recluta. Tu misión: aprender Python desde cero. Pasa el primer nivel para desbloquear más.",
        challenge: "Escribe cualquier cosa para continuar.",
        solution: code => code.length > 0,
        error: "Escribe algo."
    },

    level1: {
        theory: "Nivel 1: Variables. Una variable almacena datos. Ejemplo: edad = 20",
        challenge: "Crea una variable llamada edad y asígnale 20.",
        solution: code => code.includes("edad") && code.includes("20"),
        error: "Tu variable debe llamarse edad y valer 20."
    },

    level2: {
        theory: "Nivel 2: Tipos de Datos. Texto (string): nombre = 'Ana'",
        challenge: "Crea una variable llamada nombre con tu nombre.",
        solution: code => code.includes("nombre") && code.includes("'"),
        error: "Debe haber una variable nombre con texto."
    },

    level3: {
        theory: "Nivel 3: Condicionales. if comprueba condiciones.",
        challenge: "Crea un if que imprima 'OK' si x es 10.",
        solution: code => code.includes("if") && code.includes("x") && code.includes("10") && code.includes("print"),
        error: "Debes usar if, x, 10 y print."
    },

    level4: {
        theory: "Nivel 4: Bucles. Un bucle repite acciones.",
        challenge: "Escribe un for que imprima 1,2,3.",
        solution: code => code.includes("for") && code.includes("range") && code.includes("print"),
        error: "Usa for, range y print."
    },

    final: {
        theory: "Final Boss: Combina todo lo aprendido.",
        challenge: "Crea edad=18 y si edad>17 imprime 'GG'.",
        solution: code => code.includes("edad=18") && code.includes(">17") && code.includes("print"),
        error: "Edad debe ser 18 y debe haber un if que imprima."
    }
};


// UI
const sidebar = document.querySelectorAll(".sidebar li");
const theoryBox = document.getElementById("theory");
const editor = document.getElementById("editor");
const feedback = document.getElementById("feedback");
const runBtn = document.getElementById("run");

let currentTopic = "intro";

renderTopic();

// Cambiar nivel
sidebar.forEach(btn => {
    btn.addEventListener("click", () => {

        const topic = btn.dataset.topic;

        if (btn.classList.contains("locked")) {
            feedback.innerHTML = `<div class="error">Nivel bloqueado</div>`;
            return;
        }

        sidebar.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentTopic = topic;
        renderTopic();
    });
});

// Renderiza tema
function renderTopic(){
    const t = topics[currentTopic];
    theoryBox.innerHTML = `<p>${t.theory}</p><p><strong>Reto:</strong> ${t.challenge}</p>`;
    editor.value = "";
    feedback.innerHTML = "";
}

// Ejecutar
runBtn.addEventListener("click", () => {
    const code = editor.value.trim();
    const topic = topics[currentTopic];

    if (topic.solution(code)){
        feedback.innerHTML = `<div class="success">Misión completada. Nivel Desbloqueado.</div>`;
        unlockNext();
    } else {
        feedback.innerHTML = `<div class="error">${topic.error}</div>`;
    }
});


// Desbloquear siguiente nivel
function unlockNext(){
    const order = ["intro","level1","level2","level3","level4","final"];
    let idx = order.indexOf(currentTopic);

    if (idx < order.length - 1){
        const next = order[idx + 1];
        unlockedLevels.push(next);

        const li = document.querySelector(`[data-topic="${next}"]`);
        li.classList.remove("locked");
    }
}
