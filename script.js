// Preguntas del juego
const preguntas = [
    {
        texto: "¿Cuál es el resultado de 2 + 2?",
        opciones: ["3", "4", "22"],
        correcta: "4"
    },
    {
        texto: "¿Cuál es el color del cielo?",
        opciones: ["Rojo", "Azul", "Verde"],
        correcta: "Azul"
    },
    {
        texto: "¿Cuál es un lenguaje de programación?",
        opciones: ["Python", "Español", "Caribeño"],
        correcta: "Python"
    }
];

// Variables de estado del juego
let index = 0;
let puntos = 0;

// Elementos del DOM
const screenStart = document.getElementById("screen-start");
const screenGame = document.getElementById("screen-game");
const screenEnd = document.getElementById("screen-end");

const question = document.getElementById("question");
const options = document.getElementById("options");
const feedback = document.getElementById("feedback");
const score = document.getElementById("score");
const nextBtn = document.getElementById("next-btn");


// Iniciar juego
function startGame() {
    index = 0;
    puntos = 0;

    screenStart.classList.remove("active");
    screenGame.classList.add("active");

    mostrarPregunta();
}


// Mostrar pregunta actual
function mostrarPregunta() {
    let data = preguntas[index];

    question.textContent = data.texto;
    options.innerHTML = "";
    feedback.textContent = "";
    nextBtn.classList.add("hidden");

    data.opciones.forEach(opción => {
        let btn = document.createElement("div");
        btn.classList.add("option");
        btn.textContent = opción;

        btn.onclick = () => seleccionar(btn, opción);

        options.appendChild(btn);
    });
}


// Validar respuesta
function seleccionar(btn, opción) {
    let correcta = preguntas[index].correcta;

    if (opción === correcta) {
        btn.classList.add("correct");
        feedback.textContent = "¡Bien!";
        puntos++;
    } else {
        btn.classList.add("incorrect");
        feedback.textContent = "Incorrecto";
    }

    // Bloquear todas las opciones
    document.querySelectorAll(".option").forEach(o => o.onclick = null);

    nextBtn.classList.remove("hidden");
}


// Pasar a siguiente pregunta
function nextQuestion() {
    index++;

    if (index >= preguntas.length) {
        terminar();
    } else {
        mostrarPregunta();
    }
}


// Final del juego
function terminar() {
    screenGame.classList.remove("active");
    screenEnd.classList.add("active");
    score.textContent = puntos;
}


// Reiniciar
function restartGame() {
    screenEnd.classList.remove("active");
    screenStart.classList.add("active");
}
