// Base de datos de temas y retos
const topics = {
    intro: {
        theory: "Python es un lenguaje moderno, fácil, poderoso y perfecto para empezar a programar.",
        challenge: "Escribe un comentario que diga: Python es divertido",
        solution: code => code.includes("# Python es divertido"),
        error: "Debes escribir exactamente el comentario solicitado."
    },

    variables: {
        theory: "Una variable guarda datos. Ejemplo: edad = 25",
        challenge: "Declara una variable llamada edad con valor 25",
        solution: code => code.trim() === "edad = 25",
        error: "Asegúrate de que la variable sea 'edad' y el valor 25."
    },

    tipos: {
        theory: "Un string es texto. Puedes juntarlo usando +",
        challenge: 'Declara nombre = "Ana" y haz print("Hola " + nombre)',
        solution: code => code.includes("nombre") && code.includes("print("),
        error: "Verifica concatenar correctamente el string."
    },

    condicionales: {
        theory: "if sirve para tomar decisiones",
        challenge: "Escribe un if que imprima 'Mayor' si x es mayor que 10",
        solution: code => code.includes("if") && code.includes("> 10"),
        error: "Tu estructura condicional no cumple la condición."
    }
};

// DOM
const menuItems = document.querySelectorAll("#menu li");
const theory = document.getElementById("theory");
const challenge = document.getElementById("challenge");
const editor = document.getElementById("editor");
const output = document.getElementById("output");
const runBtn = document.getElementById("runBtn");

let currentTopic = "intro";

// Cambiar tema
menuItems.forEach(item => {
    item.onclick = () => {
        menuItems.forEach(el => el.classList.remove("active"));
        item.classList.add("active");

        currentTopic = item.getAttribute("data-topic");
        loadTopic(currentTopic);
    };
});

// Cargar contenido del tema
function loadTopic(topic) {
    const data = topics[topic];

    if (!data) return;

    theory.innerHTML = `<h2>📘 Teoría:</h2><p>${data.theory}</p>`;
    challenge.innerHTML = `<h3>🎯 Reto:</h3><p>${data.challenge}</p>`;
    editor.value = "";
    output.innerHTML = "<p>Resultados aparecerán aquí...</p>";
}

// Verificar código
runBtn.onclick = () => {
    const data = topics[currentTopic];
    if (!data) return;

    const userCode = editor.value.trim();

    if (data.solution(userCode)) {
        output.innerHTML =
            `<p style="color:#4ade80;">✔️ ¡Excelente! Pasaste este nivel.</p>`;
    } else {
        output.innerHTML =
            `<p style="color:#f87171;">❌ Error: ${data.error}</p>`;
    }
};

// Cargar tema inicial
loadTopic("intro");
