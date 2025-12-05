/* script.js — lógica organizada, validadores, resaltado básico, persistencia.
   Comentarios en español para que entiendas todo.
*/

/* -------------------------
   CONFIG & DATOS DE NIVELES
   -------------------------
   Cada nivel tiene:
    - id: string único
    - title: título corto
    - theory: HTML o texto con la teoría
    - task: enunciado del desafío
    - starter: código inicial mostrado
    - validator: función(codeText) -> { ok: boolean, message: string, state?: object }
*/
const LEVELS = [
  {
    id: "intro",
    title: "Introducción",
    unlockedByDefault: true,
    theory: `<p>Bienvenido al entrenamiento. Aquí practicarás conceptos básicos de Python.</p>`,
    task: `Escribe <code>print("Hola Mundo")</code> para completar este nivel.`,
    starter: `# Escribe print("Hola Mundo")\n`,
    validator: (code) => {
      const cleaned = removeComments(code);
      return cleaned.includes(`print("Hola Mundo")`) ?
        { ok: true, message: "¡Hola Mundo ejecutado (simulado)!", state: {} } :
        { ok: false, message: `Usa exactamente: print("Hola Mundo")` };
    }
  },

  {
    id: "level1",
    title: "Nivel 1 — Variables",
    unlockedByDefault: true,
    theory: `<p>Una variable asigna un nombre a un valor: <code>edad = 25</code>.</p>`,
    task: `Declara una variable llamada <code>edad</code> con valor <code>25</code>.`,
    starter: `# Ejemplo: edad = 25\n`,
    validator: (code) => {
      const c = removeComments(code);
      const m = c.match(/\bedad\s*=\s*(\d+)\b/);
      if (m && Number(m[1]) === 25) return { ok: true, message: "Variable 'edad' = 25 (simulado).", state: { edad: 25 } };
      if (/\bedad\s*=/.test(c)) return { ok: false, message: "Encontré 'edad =' pero el valor no es 25." };
      return { ok: false, message: "Declara: edad = 25" };
    }
  },

  {
    id: "level2",
    title: "Nivel 2 — Tipos",
    unlockedByDefault: false,
    theory: `<p>Strings (texto) entre comillas. Concatenación: <code>print("Hola " + nombre)</code>.</p>`,
    task: `Declara <code>nombre</code> con un texto y haz <code>print("Hola " + nombre)</code>.`,
    starter: `# nombre = "TuNombre"\n# print("Hola " + nombre)\n`,
    validator: (code) => {
      const c = removeComments(code);
      const nameMatch = c.match(/\bnombre\s*=\s*("([^"]*)"|'([^']*)')/);
      const printOk = /print\s*\(\s*["']Hola\s*["']\s*\+\s*nombre\s*\)/.test(c);
      if (!nameMatch) return { ok: false, message: 'No encontré la asignación: nombre = "Ana"' };
      if (!printOk) return { ok: false, message: 'Asegúrate: print("Hola " + nombre) (nota el espacio dentro de "Hola ").' };
      const value = nameMatch[2] || nameMatch[3] || "";
      return { ok: true, message: `Perfecto — nombre = "${value}".`, state: { nombre: value } };
    }
  },

  {
    id: "level3",
    title: "Nivel 3 — Condicionales",
    unlockedByDefault: false,
    theory: `<p>Condicionales permiten decidir: <code>if numero > 10:</code></p>`,
    task: `Declara <code>numero = 12</code> y crea un <code>if numero > 10:</code> que contenga un <code>print</code>.`,
    starter: `# numero = 12\n# if numero > 10:\n#     print("Mayor que 10")\n`,
    validator: (code) => {
      const c = removeComments(code);
      const nMatch = c.match(/\bnumero\s*=\s*(\d+)\b/);
      if (!nMatch) return { ok: false, message: "Declara: numero = 12" };
      if (!/if\s+numero\s*>\s*10\s*:/.test(c)) return { ok: false, message: "Usa: if numero > 10:" };
      // comprobar print dentro del bloque if (heurística)
      const ifIndex = c.search(/if\s+numero\s*>\s*10\s*:/);
      const snippet = c.slice(ifIndex, ifIndex + 200);
      if (!/print\s*\(/.test(snippet)) return { ok: false, message: "Dentro del if debe haber un print(...)" };
      return { ok: true, message: "Condicional OK.", state: { numero: Number(nMatch[1]) } };
    }
  },

  {
    id: "level4",
    title: "Nivel 4 — Bucles",
    unlockedByDefault: false,
    theory: `<p>Usa <code>for i in range(n):</code> para repetir acciones.</p>`,
    task: `Escribe un <code>for</code> que imprima 1, 2 y 3 (puede usar <code>range</code>).`,
    starter: `# for i in range(1,4):\n#     print(i)\n`,
    validator: (code) => {
      const c = removeComments(code);
      if (!/for\s+.+in\s+range\s*\(/.test(c)) return { ok: false, message: "Usa un for con range(...)" };
      if (!/print\s*\(/.test(c)) return { ok: false, message: "Incluye print(...) dentro del bucle." };
      return { ok: true, message: "Bucle detectado. Bien hecho." };
    }
  },

  {
    id: "level5",
    title: "Nivel 5 — Listas",
    unlockedByDefault: false,
    theory: `<p>Las listas son colecciones: <code>frutas = ["manzana","pera"]</code>.</p>`,
    task: `Crea una lista llamada <code>frutas</code> con 3 elementos y haz <code>print(frutas)</code>.`,
    starter: `# frutas = ["manzana","pera","banana"]\n# print(frutas)\n`,
    validator: (code) => {
      const c = removeComments(code);
      if (!/\bfrutas\s*=\s*\[.*\]/.test(c)) return { ok: false, message: "Declara: frutas = [ ... ]" };
      if (!/print\s*\(\s*frutas\s*\)/.test(c)) return { ok: false, message: "Muestra la lista con: print(frutas)" };
      return { ok: true, message: "Lista creada y mostrada.", state: { frutas: true } };
    }
  },

  {
    id: "final",
    title: "Final Boss",
    unlockedByDefault: false,
    theory: `<p>Combina variables, condicionales y bucles en un mini-puzzle.</p>`,
    task: `Crea <code>edad = 18</code> y usa un if que imprima "GG" si edad &gt;= 18.`,
    starter: `# edad = 18\n# if edad >= 18:\n#     print("GG")\n`,
    validator: (code) => {
      const c = removeComments(code);
      if (!/\bedad\s*=\s*18\b/.test(c)) return { ok: false, message: "Declara: edad = 18" };
      if (!/if\s+.*edad.*>=\s*18\s*:/.test(c)) return { ok: false, message: "Usa: if edad >= 18:" };
      if (!/print\s*\(\s*["']GG["']\s*\)/.test(c)) return { ok: false, message: 'Dentro del if haz: print("GG")' };
      return { ok: true, message: "¡Final Boss derrotado! 🎉" };
    }
  }
];

/* -------------------------
   Estado de la aplicación (persistente)
   - savedProgress: objeto guardado en localStorage
*/
const STORAGE_KEY = "python_arena_progress_v1";
let savedProgress = loadProgress();

/* Si no existe progreso, lo inicializamos: desbloquear los niveles por defecto */
if (!savedProgress) {
  savedProgress = {
    unlocked: LEVELS.filter(l => l.unlockedByDefault).map(l => l.id),
    completed: []
  };
  saveProgress();
}

/* -------------------------
   SELECTORES DOM
*/
const levelsList = document.getElementById("levelsList");
const levelTitle = document.getElementById("levelTitle");
const levelSubtitle = document.getElementById("levelSubtitle");
const theoryHtml = document.getElementById("theoryHtml");
const taskHtml = document.getElementById("taskHtml");
const codeEditor = document.getElementById("codeEditor");
const highlight = document.getElementById("highlight");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const output = document.getElementById("output");
const stateView = document.getElementById("stateView");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

/* App state in-memory */
let currentIndex = 0;
let simulatedState = {}; // variable store simulated across levels

/* -------------------------
   Inicialización: render del menú, primer nivel
*/
renderMenu();
loadLevelByIndex(0);
updateProgressUI();

/* -------------------------
   FUNCIONES: persistencia
*/
function loadProgress(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e){
    console.warn("Error cargando progreso:", e);
    return null;
  }
}
function saveProgress(){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
  } catch(e){
    console.warn("Error guardando progreso:", e);
  }
}

/* -------------------------
   RENDER MENU (niveles)
*/
function renderMenu(){
  levelsList.innerHTML = "";
  LEVELS.forEach((lvl, idx) => {
    const btn = document.createElement("button");
    btn.className = "level-btn";
    btn.dataset.index = idx;
    btn.innerHTML = `<span>${lvl.title}</span><span class="meta">${idx === 0 ? "Intro" : "Nivel " + idx}</span>`;

    // Locked? si su id no está en savedProgress.unlocked
    const isUnlocked = savedProgress.unlocked.includes(lvl.id);
    if (!isUnlocked) btn.classList.add("locked");
    // Active?
    if (idx === currentIndex) btn.classList.add("active");

    btn.onclick = () => {
      if (!savedProgress.unlocked.includes(lvl.id)) {
        // mostrar un feedback breve si está bloqueado
        flashOutput("Nivel bloqueado. Completa previos.", false);
        return;
      }
      // cambiar nivel
      currentIndex = idx;
      loadLevelByIndex(idx);
      renderMenu(); // rerender para actualizar active / locked
    };

    levelsList.appendChild(btn);
  });
}

/* -------------------------
   CARGAR NIVEL
*/
function loadLevelByIndex(idx){
  const lvl = LEVELS[idx];
  if (!lvl) return;
  currentIndex = idx;
  // encabezados
  levelTitle.textContent = lvl.title;
  levelSubtitle.textContent = `Misión ${idx} — ${lvl.title}`;
  // teoría y reto
  theoryHtml.innerHTML = lvl.theory;
  taskHtml.innerHTML = `<div>${lvl.task}</div>`;
  // editor
  codeEditor.value = lvl.starter || "";
  updateHighlight();
  // limpiar salida
  output.innerHTML = `<div class="info">Pulsa <strong>EJECUTAR / VERIFICAR</strong> cuando hayas terminado.</div>`;
  // actualizar active en menú
  document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
  const activeBtn = document.querySelector(`.level-btn[data-index="${idx}"]`);
  if (activeBtn) activeBtn.classList.add("active");
  renderState();
}

/* -------------------------
   RESALTADO SINTÁCTICO (heurístico)
*/
function escapeHtml(str) {
  return str.replace(/[&<>]/g, (t) => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[t] || t));
}
function updateHighlight(){
  const text = codeEditor.value;
  let html = escapeHtml(text);

  // comentarios
  html = html.replace(/(^|[^\\])#(.*?$)/gm, (m,p1,p2) => `${p1}<span class="cm">#${escapeHtml(p2)}</span>`);

  // strings
  html = html.replace(/("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/g, m => `<span class="str">${m}</span>`);

  // keywords básicos
  const kws = ["if","else","elif","for","while","def","return","in","and","or","not","print","range","True","False","None"];
  const re = new RegExp(`\\b(${kws.join("|")})\\b`, "g");
  html = html.replace(re, m => `<span class="kw">${m}</span>`);

  // números
  html = html.replace(/\b(\d+)\b/g, m => `<span class="num">${m}</span>`);

  // varnames antes de =
  html = html.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\=)/g, m => `<span class="varname">${m}</span>`);

  highlight.innerHTML = html;
}
codeEditor.addEventListener("input", updateHighlight);
codeEditor.addEventListener("scroll", () => {
  highlight.scrollTop = codeEditor.scrollTop;
  highlight.scrollLeft = codeEditor.scrollLeft;
});

/* -------------------------
   BOTONES: EJECUTAR y RESET
*/
runBtn.addEventListener("click", () => {
  const lvl = LEVELS[currentIndex];
  const code = codeEditor.value;

  // ejecutar validador en try/catch para seguridad
  try {
    const result = lvl.validator(code);

    if (result && result.ok) {
      // actualizar estado simulado si viene
      if (result.state && typeof result.state === "object") {
        simulatedState = { ...simulatedState, ...result.state };
      }
      // marcar como completado
      if (!savedProgress.completed.includes(lvl.id)) {
        savedProgress.completed.push(lvl.id);
      }
      // desbloquear siguiente
      unlockNextForLevel(currentIndex);
      // persistir progreso
      saveProgress();
      // UI
      flashOutput(result.message, true);
      renderMenu();
      updateProgressUI();
      renderState();
      // mostrar botón para avanzar (si aplica)
      showAdvanceButton();
    } else {
      flashOutput(result && result.message ? result.message : "No cumpliste el reto.", false);
    }
  } catch (err) {
    console.error(err);
    flashOutput("Error validando (ver consola).", false);
  }
});

resetBtn.addEventListener("click", () => {
  const lvl = LEVELS[currentIndex];
  codeEditor.value = lvl.starter || "";
  updateHighlight();
  output.innerHTML = `<div class="info">Editor restablecido.</div>`;
});

/* -------------------------
   AUX: desbloquear siguiente nivel
*/
function unlockNextForLevel(idx){
  if (idx + 1 >= LEVELS.length) return;
  const nextId = LEVELS[idx+1].id;
  if (!savedProgress.unlocked.includes(nextId)){
    savedProgress.unlocked.push(nextId);
  }
}

/* -------------------------
   Mostrar botón para avanzar (temporal)
*/
function showAdvanceButton(){
  // si existe siguiente y está desbloqueado, mostramos sugerencia
  const nextIdx = currentIndex + 1;
  if (nextIdx < LEVELS.length && savedProgress.unlocked.includes(LEVELS[nextIdx].id)){
    output.innerHTML += `<div style="margin-top:10px"><button class="btn primary" id="goNext">Ir al Siguiente Nivel</button></div>`;
    const el = document.getElementById("goNext");
    if (el) el.addEventListener("click", () => {
      loadLevelByIndex(nextIdx);
      renderMenu();
    });
  }
}

/* -------------------------
   RENDER: estado simulado y progreso
*/
function renderState(){
  try {
    stateView.textContent = JSON.stringify(simulatedState, null, 2);
  } catch(e){
    stateView.textContent = "{}";
  }
}

function updateProgressUI(){
  const total = LEVELS.length;
  const done = savedProgress.completed.length;
  const pct = Math.round((done / total) * 100);
  progressFill.style.width = pct + "%";
  progressText.textContent = `${done} / ${total} completados`;
}

/* -------------------------
   Mensajes temporales en area de output
*/
function flashOutput(msg, ok = true){
  output.innerHTML = `<div class="${ok ? "ok" : "bad"}">${ok ? "✅ " : "❌ "}${escapeHtml(msg)}</div>`;
}

/* -------------------------
   Util: eliminar comentarios (#...) para facilitar validaciones
*/
function removeComments(text){
  return text.replace(/#.*$/gm, "");
}

/* -------------------------
   Al cargar: marcar desbloqueados iniciales en savedProgress
*/
(function initUnlocks(){
  // asegurarnos de que los niveles con unlockedByDefault estén en savedProgress.unlocked
  LEVELS.forEach(l => {
    if (l.unlockedByDefault && !savedProgress.unlocked.includes(l.id)){
      savedProgress.unlocked.push(l.id);
    }
  });
  saveProgress();
})();
