/* script.js
   Lógica de la app: escenarios dinámicos, editor con resaltado básico,
   validación de respuestas y simulación de estado de variables.
   Comentarios en español explicando cada parte.
*/

/* ---------------------------
   Definición de escenarios
   ---------------------------
   Cada escenario tiene:
   - id: identificador único
   - title: título mostrado en la sidebar
   - theory: HTML con la explicación teórica
   - prompt: enunciado del desafío
   - starterCode: plantilla inicial que ve el alumno
   - validator: función que recibe el código (texto) y devuelve un objeto:
       { ok: boolean, message: string, state?: object }
   - hint (opcional): pista para el alumno
*/
const scenarios = [
  {
    id: "variables",
    title: "Variables",
    theory: `
      <h2>Variables</h2>
      <p>Una variable es un nombre que referencia un valor en memoria. En Python se asigna con <code>=</code>.</p>
      <p>Ejemplo: <code>edad = 25</code></p>
    `,
    prompt: `Declara una variable llamada <strong>edad</strong> y asígnale el valor <strong>25</strong>.`,
    starterCode: `# Escribe tu código aquí\n`,
    hint: `Usa: edad = 25`,
    validator: function(codeText) {
      // Quitamos comentarios para no confundir la búsqueda
      const cleaned = removeComments(codeText);

      // Buscamos la asignación exacta edad = 25 (con posibles espacios)
      const match = cleaned.match(/\bedad\s*=\s*25\b/);
      if (match) {
        return { ok: true, message: "¡Excelente! La variable 'edad' contiene 25.", state: { edad: 25 } };
      }

      // Si existe 'edad =' pero con otro valor
      if (/\bedad\s*=/.test(cleaned)) {
        return { ok: false, message: "Encontré 'edad =' pero parece que no le asignaste 25. Revisa el valor." };
      }

      // Si no se encontró
      return { ok: false, message: "Asegúrate de declarar la variable exactamente como: edad = 25" };
    }
  },

  {
    id: "tipos",
    title: "Tipos de Datos",
    theory: `
      <h2>Tipos de datos - Strings</h2>
      <p>Las cadenas (strings) se ponen entre comillas. Puedes concatenarlas con <code>+</code>.</p>
      <p>Ejemplo: <code>nombre = "Ana"</code> y <code>print("Hola " + nombre)</code></p>
    `,
    prompt: `Declara una variable <strong>nombre</strong> (ej. "Juan") y luego imprime: <code>print("Hola " + nombre)</code>`,
    starterCode: `# Ejemplo:\n# nombre = "TuNombre"\n# print("Hola " + nombre)\n`,
    hint: `Asegúrate de poner las comillas y el espacio dentro de "Hola ".`,
    validator: function(codeText) {
      const cleaned = removeComments(codeText);

      // Buscar asignación nombre = "algo" o 'algo'
      const nameMatch = cleaned.match(/\bnombre\s*=\s*("([^"]*)"|'([^']*)')/);
      if (!nameMatch) {
        return { ok: false, message: "No encontré la asignación de la variable 'nombre'. Ej: nombre = \"Juan\"" };
      }

      // Buscar print("Hola " + nombre) con posibles espacios
      const printMatch = cleaned.match(/print\s*\(\s*["']Hola\s*["']\s*\+\s*nombre\s*\)/);
      if (!printMatch) {
        return { ok: false, message: 'Asegúrate de usar: print("Hola " + nombre) (nota el espacio dentro de "Hola ").' };
      }

      // Extraemos valor para simular estado
      const nombreValor = nameMatch[2] || nameMatch[3] || "";
      return { ok: true, message: `Perfecto — nombre = "${nombreValor}" y la concatenación está correcta.`, state: { nombre: nombreValor } };
    }
  },

  {
    id: "condicionales",
    title: "Condicionales",
    theory: `
      <h2>Condicionales (if / else)</h2>
      <p>Las estructuras condicionales permiten ejecutar código si se cumple una condición.</p>
      <p>Ejemplo:</p>
      <pre>numero = 12
if numero > 10:
    print("Mayor que 10")
else:
    print("10 o menos")</pre>
    `,
    prompt: `Declara una variable <strong>numero</strong> (por ejemplo 12) y escribe un bloque <code>if</code> que verifique si <code>numero > 10</code>. En el caso verdadero debe haber un <code>print</code>.`,
    starterCode: `# Ejemplo:\n# numero = 12\n# if numero > 10:\n#     print("Mayor que 10")\n# else:\n#     print("10 o menos")\n`,
    hint: `Usa if numero > 10: y dentro un print(...).`,
    validator: function(codeText) {
      const cleaned = removeComments(codeText);

      // Encontrar asignación numero = N
      const numMatch = cleaned.match(/\bnumero\s*=\s*(\d+)\b/);
      if (!numMatch) {
        return { ok: false, message: "No encontré la asignación de 'numero'. Ej: numero = 12" };
      }
      const valor = parseInt(numMatch[1], 10);

      // Buscar if numero > 10:
      const ifMatch = cleaned.match(/if\s+numero\s*>\s*10\s*:/);
      if (!ifMatch) {
        return { ok: false, message: "Asegúrate de usar la condición exacta: if numero > 10:" };
      }

      // Detectar si hay un print justo después del if (búsqueda heurística)
      const afterIfIndex = cleaned.indexOf(ifMatch[0]) + ifMatch[0].length;
      const snippet = cleaned.slice(afterIfIndex, afterIfIndex + 200); // pedazo corto donde debería estar el print
      if (!/print\s*\(/.test(snippet)) {
        return { ok: false, message: "Dentro del bloque if se espera un print(...). Revisa la indentación y colocación." };
      }

      // Correcto
      return { ok: true, message: `Correcto. 'numero' = ${valor} y existe un if que verifica si es mayor que 10.`, state: { numero: valor } };
    }
  }
];

/* ---------------------------
   Elementos del DOM
   --------------------------- */
const topicsList = document.getElementById("topicsList");
const theoryArea = document.getElementById("theoryArea");
const scenarioArea = document.getElementById("scenarioArea");
const codeEditor = document.getElementById("codeEditor");
const highlight = document.getElementById("highlight");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const outputArea = document.getElementById("outputArea");
const stateView = document.getElementById("stateView");

/* ---------------------------
   Estado de la app
   --------------------------- */
let currentScenario = null;
let simulatedState = {}; // aquí guardamos las variables simuladas globalmente

/* ---------------------------
   Inicialización: crea la lista de temas y carga el primero
   --------------------------- */
function initTopics() {
  scenarios.forEach((s, idx) => {
    const li = document.createElement("li");
    li.id = `topic-${s.id}`;
    li.textContent = s.title;
    li.addEventListener("click", () => loadScenario(s.id));
    if (idx === 0) li.classList.add("active");
    topicsList.appendChild(li);
  });
}

function loadScenario(id) {
  const s = scenarios.find(x => x.id === id);
  if (!s) return;
  currentScenario = s;

  // Marcar activo en sidebar
  document.querySelectorAll(".topics-list li").forEach(li => li.classList.remove("active"));
  const activeLi = document.getElementById(`topic-${s.id}`);
  if (activeLi) activeLi.classList.add("active");

  // Llenar teoría y enunciado
  theoryArea.innerHTML = s.theory;
  scenarioArea.innerHTML = `<h2>Desafío</h2><p>${s.prompt}</p>${s.hint ? `<p style="color:#475569;font-size:.92rem;"><strong>Pista:</strong> ${s.hint}</p>` : ""}`;

  // Código inicial y resaltado
  codeEditor.value = s.starterCode;
  updateHighlight();
  outputArea.innerHTML = `<div style="color:#475569">Presiona <strong>Ejecutar / Verificar</strong> cuando termines.</div>`;
}

/* ---------------------------
   Editor: resaltado sintáctico básico
   ---------------------------
   Heurístico: convierte texto a HTML con spans para clases:
   - comentarios (#...)
   - strings ("..." o '...')
   - keywords (if, else, for, while, def, return, import, in, and, or, not, print)
   - números
   - nombres de variable antes de =
*/
function escapeHtml(str) {
  return str.replace(/[&<>]/g, t => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[t] || t));
}

function updateHighlight() {
  const text = codeEditor.value;
  let html = escapeHtml(text);

  // comentarios (desde # hasta final de línea)
  html = html.replace(/(^|[^\\])#(.*?$)/gm, (m,p1,p2) => `${p1}<span class="cm">#${escapeHtml(p2)}</span>`);

  // strings
  html = html.replace(/("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/g, m => `<span class="str">${m}</span>`);

  // keywords (incluye print como builtin)
  const keywords = ["if","else","elif","for","while","def","return","import","in","and","or","not","print","True","False","None"];
  const kwRE = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  html = html.replace(kwRE, m => `<span class="${m==='print' ? 'builtin' : 'kw'}">${m}</span>`);

  // números
  html = html.replace(/\b(\d+)\b/g, m => `<span class="num">${m}</span>`);

  // variable names before =
  html = html.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\=)/g, m => `<span class="varname">${m}</span>`);

  highlight.innerHTML = html;
}

/* Sincronizar scroll entre textarea y pre */
codeEditor.addEventListener("scroll", () => {
  highlight.scrollTop = codeEditor.scrollTop;
  highlight.scrollLeft = codeEditor.scrollLeft;
});
codeEditor.addEventListener("input", updateHighlight);

/* ---------------------------
   Botones: Ejecutar / Reset
   --------------------------- */

/* Ejecutar validación del escenario actual */
runBtn.addEventListener("click", () => {
  if (!currentScenario) return;

  const codeText = codeEditor.value;

  // Ejecutamos el validador del escenario (puede lanzar si hay un bug; lo atrapamos)
  try {
    const result = currentScenario.validator(codeText);

    if (result && result.ok) {
      // Actualizar estado simulado si el validador lo indica
      if (result.state && typeof result.state === "object") {
        simulatedState = { ...simulatedState, ...result.state };
        renderState();
      }

      // Mensaje de éxito + botón avanzar
      outputArea.innerHTML = `<div class="msg-success">✅ ${result.message}</div>`;
      const nextBtn = createNextButton();
      outputArea.appendChild(nextBtn);
    } else {
      // Error: mostrar retroalimentación específica
      const msg = result && result.message ? result.message : "Respuesta incorrecta.";
      outputArea.innerHTML = `<div class="msg-error">❌ ${msg}</div>`;
    }
  } catch (err) {
    outputArea.innerHTML = `<div class="msg-error">Error en la validación: ${err.message}</div>`;
    console.error(err);
  }
});

/* Reset del editor al starterCode del escenario actual */
resetBtn.addEventListener("click", () => {
  if (!currentScenario) return;
  codeEditor.value = currentScenario.starterCode;
  updateHighlight();
  outputArea.innerHTML = `<div style="color:#475569">Editor restablecido.</div>`;
});

/* Botón para avanzar al siguiente escenario */
function createNextButton() {
  const btn = document.createElement("button");
  btn.className = "btn primary";
  btn.style.marginTop = "10px";
  btn.textContent = "Avanzar al siguiente nivel";
  btn.addEventListener("click", () => {
    const currentIndex = scenarios.findIndex(s => s.id === currentScenario.id);
    const nextIndex = Math.min(currentIndex + 1, scenarios.length - 1);
    const next = scenarios[nextIndex];
    if (next && next.id !== currentScenario.id) {
      loadScenario(next.id);
    } else {
      outputArea.innerHTML = `<div class="msg-success">¡Llegaste al final de los escenarios disponibles! Revisa lo aprendido o reinicia.</div>`;
    }
  });
  return btn;
}

/* ---------------------------
   Simulación de estado y render
   --------------------------- */
function renderState() {
  try {
    stateView.textContent = JSON.stringify(simulatedState, null, 2);
  } catch (e) {
    stateView.textContent = "{}";
  }
}

/* ---------------------------
   Util: eliminar comentarios (#...) para facilitar validaciones
   --------------------------- */
function removeComments(text) {
  return text.replace(/#.*$/gm, "");
}

/* ---------------------------
   Inicializar app al cargar
   --------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  initTopics();
  if (scenarios.length > 0) loadScenario(scenarios[0].id);
  updateHighlight();
  renderState();
});
