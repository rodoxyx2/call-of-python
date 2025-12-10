/* --- NIVELES --- */
const levels = {
  intro:{
    title:"Introducción a Python",
    desc:"¿Qué es Python y para qué sirve?",
    explain:"Python es un lenguaje sencillo y muy usado...",
    example:`print("Hola, bienvenido a Call-Of-Python")`
  },

  "1-1":{
    title:"Variables",
    desc:"Qué es una variable",
    explain:"Una variable es un nombre que guarda un valor.",
    example:`edad = 20\nnombre = "Ana"`,
    check: c => /[a-zA-Z_]\w*\s*=\s*(\d+|["'].*["'])/.test(c)
  },

  "1-2":{
    title:"Tipos de datos",
    desc:"int, float, str y bool",
    explain:"Tipos comunes en Python.",
    example:`entero = 5\nflotante = 3.14\ntexto = "hola"\nactivo = True`,
    check: c => /["'].*["']|\d+\.\d+|\bTrue\b|\bFalse\b|\b\d+\b/.test(c)
  },

  "1-3":{
    title:"Entrada (input)",
    desc:"Leer datos del usuario",
    explain:"input() lee texto del usuario",
    example:`nombre = input("Tu nombre: ")\nprint("Hola " + nombre)`,
    check: c => /\binput\s*\(/.test(c)
  },

  "1-4":{
    title:"Operadores",
    desc:"+, -, *, /",
    explain:"Operadores aritméticos básicos",
    example:`a = 4\nb = 2\ntotal = a + b`,
    check: c => /[+\-*/%]/.test(c)
  },

  "1-5":{
    title:"Comentarios",
    desc:"Documentar código",
    explain:"Comienzan con #",
    example:`# Esto es un comentario`,
    check: c => /#/.test(c)
  },

  "2-1":{
    title:"Condicionales",
    desc:"if",
    explain:"If ejecuta código según condición",
    example:`if 5 > 2:\n    print("Sí")`,
    check: c => /\bif\b.*:/.test(c)
  },

  "2-2":{
    title:"Bucles for",
    desc:"Repetición con for",
    explain:"For recorre secuencias",
    example:`for i in range(3):\n    print(i)`,
    check: c => /\bfor\b.*\bin\b/.test(c)
  },

  "2-3":{
    title:"Break / Continue",
    desc:"Control de bucles",
    explain:"break sale, continue salta",
    example:`for i in range(5):\n    if i==2:\n        break`,
    check: c => /\b(break|continue)\b/.test(c)
  },

  "3-1":{
    title:"Listas",
    desc:"Colecciones ordenadas",
    explain:"Listas con []",
    example:`frutas=["manzana","pera"]`,
    check: c => /\[.*\]/.test(c)
  },

  "3-2":{
    title:"Tuplas",
    desc:"Inmutables",
    explain:"Tuplas con ()",
    example:`t=(1,2,3)`,
    check: c => /\(.*,.+\)/.test(c)
  },

  "3-3":{
    title:"Diccionarios",
    desc:"Clave → valor",
    explain:"Diccionarios con {}",
    example:`d={"a":1,"b":2}`,
    check: c => /\{.*:.*\}/.test(c)
  },

  "3-4":{
    title:"Sets",
    desc:"Sin orden",
    explain:"Sets sin duplicados",
    example:`s={1,2,3}`,
    check: c => /\bset\s*\(|\{[^\:]+\}/.test(c)
  },

  "4-1":{
    title:"Funciones",
    desc:"Definir función",
    explain:"def mi_func():",
    example:`def saludar():\n    print("Hola")`,
    check: c => /\bdef\b\s+[a-zA-Z_]\w*\s*\(.*\)\s*:/.test(c)
  },

  "4-2":{
    title:"Parámetros",
    desc:"Argumentos",
    explain:"def f(x):",
    example:`def doble(n): return n*2`,
    check: c => /\bdef\b.*\(.*\w.*\)/.test(c)
  },

  "4-3":{
    title:"Return",
    desc:"Devolver valor",
    explain:"return",
    example:`def suma(a,b): return a+b`,
    check: c => /\breturn\b/.test(c)
  }
};

/* --- ESTADO --- */
let current = null;
let unlocked = ["intro","1-1"];

const titleEl = document.getElementById("title");
const descEl = document.getElementById("desc");
const explainEl = document.getElementById("explain");
const exampleEl = document.getElementById("example");
const exerciseArea = document.getElementById("exerciseArea");
const msgEl = document.getElementById("msg");
const pyshot = document.getElementById("pyshotOverlay");

/* --- CAMBIAR NIVEL --- */
function selectLevel(id){
  if (!unlocked.includes(id)){
    msgEl.style.background="#3b0000";
    msgEl.textContent="Nivel bloqueado.";
    return;
  }

  document.querySelectorAll("#sidebar .level")
    .forEach(el=>el.classList.remove("active"));

  const btn = document.querySelector(`#sidebar .level[data-id='${id}']`);
  if (btn) btn.classList.add("active");

  current = id;
  const lvl = levels[id];

  titleEl.textContent = lvl.title;
  descEl.textContent = lvl.desc;
  explainEl.textContent = lvl.explain;
  exampleEl.textContent = lvl.example;

  msgEl.textContent = "";

  if (lvl.check){
    exerciseArea.style.display = "block";
    document.getElementById("code").value = "";
  } else {
    exerciseArea.style.display="none";
  }
}

/* --- EJECUTAR NIVEL --- */
function runLevel(){
  if (!current) return;

  const lvl = levels[current];
  if (!lvl.check) return;

  const code = document.getElementById("code").value;
  const ok = typeof lvl.check==="function" ? lvl.check(code) : lvl.check.test(code);

  if (ok){
    msgEl.style.background="#003b12";
    msgEl.textContent="¡Py-SHOT! Nivel completado.";
    showPyshot();
    unlockNext();
  } else {
    msgEl.style.background="#3b0000";
    msgEl.textContent="Código inválido.";
  }
}

/* PYSHOT */
function showPyshot(){
  pyshot.style.display="flex";
  setTimeout(()=>pyshot.style.display="none",1200);
}

/* DESBLOQUEAR SIGUIENTE */
function unlockNext(){
  const order = [
    "intro",
    "1-1","1-2","1-3","1-4","1-5",
    "2-1","2-2","2-3",
    "3-1","3-2","3-3","3-4",
    "4-1","4-2","4-3"
  ];

  const idx = order.indexOf(current);
  const next = order[idx+1];

  if (next && !unlocked.includes(next)){
    unlocked.push(next);
    const el = document.querySelector(`#sidebar .level[data-id='${next}']`);
    if (el) el.classList.remove("locked");
  }
}

/* INICIO */
(function init(){
  document.querySelectorAll("#sidebar .level").forEach(el=>{
    const id = el.getAttribute("data-id");
    if (!unlocked.includes(id)) el.classList.add("locked");
  });

  selectLevel("intro");
})();
