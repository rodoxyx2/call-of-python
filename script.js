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
    },

        bucles: {
        theory: "Un bucle permite repetir acciones. En Python usamos 'for' o 'while'.",
        challenge: "Escribe un bucle for que imprima los números del 1 al 3.",
        solution: code => code.includes("for") && code.includes("range") && code.includes("print"),
        error: "Tu bucle debe usar range y la función print."
    },

    listas: {
        theory: "Una lista es una colección de datos. Ejemplo: numeros = [1, 2, 3]",
        challenge: "Crea una lista llamada frutas con 3 frutas y haz print de la lista.",
        solution: code => code.includes("frutas") && code.includes("print("),
        error: "Asegúrate de llamar la lista 'frutas' y mostrarla con print."
    },

    ejercicios: {
        theory: "Pon a prueba lo que sabes. Este reto combina variables, condicionales y bucles.",
        challenge: "Crea una variable x con valor 5 y escribe un if que imprima 'Correcto' si x es igual a 5.",
        solution: code => code.includes("x = 5") && (code.includes("== 5") || code.includes("==5")) && code.includes("print"),
        error: "Tu condición debe verificar si x es igual a 5 e imprimir algo."
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
