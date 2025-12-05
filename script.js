/* script.js
   Lógica de la app: temas, escenarios, editor, highlighting básico,
   validación de respuestas y simulación del estado de variables.
*/

/* -------------------------
   Estructura de escenarios
   -------------------------
   Cada escenario tiene:
   - id, title
   - theory (HTML)
   - prompt (texto del problema)
   - starterCode (plantilla mostrada al usuario)
   - validator: función que recibe el texto del usuario y devuelve:
       { ok: boolean, message: "texto de retroalimentación", state: {...} }
     - state opcional para simular variables después de "ejecutar"
*/

const scenarios = [
  {
    id: "variables",
    title: "Variables: Asignación básica",
    theory: `
      <h2>Variables</h2>
      <p>En Python, una variable guarda un valor. Se asigna con el signo <code>=</code>.</p>
      <p>Ejemplo: <code>edad = 25</code> asigna el número 25 a la variable <code>edad</code>.</p>
    `,
    prompt: `Declara una variable llamada <strong>edad</strong> y asígnale el valor <strong>25</strong>.`,
    starterCode: `# Escribe tu código aquí\n`,
    validator: function (codeText) {
      // Validación simple por patrones: buscamos "edad = 25"
      // Quitamos comentarios y hacemos búsqueda básica
      const cleaned = removeComments(codeText);
      // buscar edad = 25 (con posibles espacios)
      const matchEdad = cleaned.match(/\bedad\s*=\s*25\b/);
      if (matchEdad) {
        // simulamos estado
        return {
          ok: true,
          message: "¡Excelente! La variable 'edad' contiene 25.",
          state: { edad: 25 },
        };
      }

      // posibles errores frecuentes: variable con otro nombre o valor distinto
      const hasEdad = cleaned.match(/\bedad\s*=/);
      if (hasEdad) {
        // encontró asignación pero no con 25
        return {
          ok: false,
          message: "Encontré la variable 'edad' pero parece que no le asignaste 25. Revisa el valor.",
        };
      }

      // no encontró edad
      return {
        ok: false,
        message: "Asegúrate de declarar la variable llamada exactamente 'edad' y asignarle 25, por ejemplo: edad = 25",
      };
    },
  },

  {
    id: "tipos",
    title: "Tipos de Datos: String y concatenación",
    theory: `
      <h2>Tipos de Datos</h2>
      <p>Las cadenas (strings) se escriben entre comillas simples o dobles.</p>
      <p>Concatenar es unir cadenas usando <code>+</code>.</p>
      <p>Ejemplo: <code>nombre = "Ana"</code> y <code>print("Hola " + nombre)</code>.</p>
    `,
    prompt: `Declara una variable <strong>nombre</strong> con una cadena (ej. "Juan") y luego escribe un <code>print</code> que concatene "Hola " + nombre.`,
    starterCode: `# Ejemplo:\n# nombre = "TuNombre"\n# print("Hola " + nombre)\n`,
    validator: function (codeText) {
      const cleaned = removeComments(codeText);
      // buscar asignación nombre = "algo" o 'algo'
      const nameMatch = cleaned.match(/\bnombre\s*=\s*("([^"]*)"|'([^']*)')/);
      if (!nameMatch) {
        return {
          ok: false,
          message: "No encontré la asignación de la variable 'nombre' con una cadena. Ej: nombre = \"Juan\"",
        };
      }

      // buscar print("Hola " + nombre) con posibles espacios
      const printMatch = cleaned.match(/print\s*\(\s*["']Hola\s*["']\s*\+\s*nombre\s*\)/);
      if (!printMatch) {
        // permitir también 'Hola' + nombre con espacio en la cadena
        return {
          ok: false,
          message: 'Asegúrate de usar: print("Hola " + nombre). Nota el espacio después de "Hola".',
        };
      }

      // si llegó aquí, está correcto. extraemos valor de nombre simuladamente
      const nombreValor = nameMatch[2] || nameMatch[3] || "";
      return {
        ok: true,
        message: `¡Perfecto! Se creó nombre = "${nombreValor}" y hiciste la concatenación.`,
        state: { nombre: nombreValor },
      };
    },
  },

  {
    id: "condicionales",
    title: "Condicionales: if / else",
    theory: `
      <h2>Condicionales (if / else)</h2>
      <p>Se usan para tomar decisiones según condiciones.</p>
      <p>Ejemplo:</p>
      <pre>numero = 12
if numero > 10:
    print("Mayor que 10")
else:
    print("10 o menos")</pre>
    `,
    prompt: `Declara una variable <strong>numero</strong> con un valor (por ejemplo 12) y escribe un bloque <code>if</code> que verifique si <code>numero &gt; 10</code>. En el caso verdadero debe haber un <code>print</code> (puede decir cualquier texto).`,
    starterCode: `# Ejemplo básico:\n# numero = 12\n# if numero > 10:\n#     print(\"Mayor que 10\")\n# else:\n#     print(\"10 o menos\")\n`,
    validator: function (codeText) {
      const cleaned = removeComments(codeText);

      // buscar asignación numero = <número>
      const numMatch = cleaned.match(/\bnumero\s*=\s*(\d+)\b/);
      if (!numMatch) {
        return {
          ok: false,
          message: "No encontré la asignación de 'numero'. Usa: numero = 12 (por ejemplo).",
        };
      }
      const valor = parseInt(numMatch[1], 10);

      // buscar if numero > 10:
      const ifMatch = cleaned.match(/if\s+numero\s*>\s*10\s*:/);
      if (!ifMatch) {
        return {
          ok: false,
          message: "Asegúrate de usar la condición exacta: if numero > 10:",
        };
      }

      // buscar un print dentro del bloque if (búsqueda simple)
      // Nota: no se analiza indentación profunda, búsqueda por "print(" después de if.
      const afterIfIndex = cleaned.indexOf(ifMatch[0]) + ifMatch[0].length;
      const afterIfText = cleaned.slice(afterIfIndex, afterIfIndex + 200); // pedazo donde debería estar el print
      const printInIf = afterIfText.match(/print\s*\(/);

      if (!printInIf) {
        return {
          ok: false,
          message: "Dentro del bloque if se espera un print(...). Asegúrate de colocarlo allí.",
        };
      }

      // todo bien; simulamos estado
      return {
        ok: true,
        message: `Correcto. 'numero' fue definido como ${valor} y hay un if que verifica si es mayor que 10.`,
        state: { numero: valor },
      };
    },
  },
];

/* -------------------------
   Helpers de UI y editor
   ------------------------- */

const topicsList = document.getElementById("topicsList");
const theoryArea = document.getElementById("theoryArea");
const scenarioArea = document.getElementById("scenarioArea");
const codeEditor = document.getElementById("codeEditor");
const highlight = document.getElementById("highlight");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const outputArea = document.getElementById("outputArea");

/* Estado de la aplicación */
let currentScenario = null;
let simulatedState = {}; // aquí guardamos variables simuladas globalmente

/* Inicializar la lista de temas en la barra lateral */
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

/* Cargar un escenario por id */
function loadScenario(id) {
  const s = scenarios.find((x) => x.id === id);
  if (!s) return;
  currentScenario = s;

  // marcar activo en sidebar
  document.querySelectorAll(".sidebar li").forEach((li) => li.classList.remove("active"));
  const activeLi = document.getElementById(`topic-${s.id}`);
  if (activeLi) activeLi.classList.add("active");

  // llenar teoría y enunciado
  theoryArea.innerHTML = s.theory;
  scenarioArea.innerHTML = `<h2>Desafío</h2><p>${s.prompt}</p>`;

  // código inicial y resaltado
  codeEditor.value = s.starterCode;
  updateHighlight(); // sincronizar resaltado
  outputArea.innerHTML = `<div class="msg-info">Cuando termines, pulsa <strong>Ejecutar / Verificar</strong>.</div>`;
}

/* -------------------------
   Editor: Resaltado simple
   -------------------------
   Implementa un resaltado básico usando regex. La idea:
   - transformamos el texto a HTML con spans para distintas clases (kw, num, str, cm, varname, func)
   - mostramos ese HTML en el pre #highlight; el textarea encima muestra texto real.
*/

function escapeHtml(str) {
  return str.replace(/[&<>]/g, (tag) => {
    const charsToReplace = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
    return charsToReplace[tag] || tag;
  });
}

function updateHighlight() {
  const text = codeEditor.value;
  // escapamos HTML para insertar en pre
  let html = escapeHtml(text);

  // comentarios: inicio con # hasta final de línea
  html = html.replace(/(^|[^\\])#(.*?$)/gm, (m, p1, p2) => {
    return `${p1}<span class="cm">#${escapeHtml(p2)}</span>`;
  });

  // strings "..." o '...'
  html = html.replace(/("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/g, (m) => `<span class="str">${m}</span>`);

  // keywords básicos de Python
  const keywords = ["if", "else", "elif", "for", "while", "def", "return", "import", "in", "and", "or", "not"];
  const kwPattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
  html = html.replace(kwPattern, (m) => `<span class="kw">${m}</span>`);

  // números
  html = html.replace(/\b(\d+)\b/g, (m) => `<span class="num">${m}</span>`);

  // print y funciones simples (resaltado)
  html = html.replace(/\bprint\b/g, (m) => `<span class="func">${m}</span>`);

  // varnames: heurística simple — variables antes del signo =
  html = html.replace(/(\b[a-zA-Z_][a-zA-Z0-9_]*\b)(?=\s*=)/g, (m) => `<span class="varname">${m}</span>`);

  // colocar en pre
  highlight.innerHTML = html;
}

/* Sincronizar scroll entre textarea y pre */
codeEditor.addEventListener("scroll", () => {
  highlight.scrollTop = codeEditor.scrollTop;
  highlight.scrollLeft = codeEditor.scrollLeft;
});
codeEditor.addEventListener("input", updateHighlight);

/* -------------------------
   Ejecutar / Verificar
   ------------------------- */

runBtn.addEventListener("click", () => {
  if (!currentScenario) return;
  const codeText = codeEditor.value;

  // ejecutar el validador del escenario
  try {
    const result = currentScenario.validator(codeText);

    if (result && result.ok) {
      // actualizar estado simulado si provee
      if (result.state) {
        simulatedState = { ...simulatedState, ...result.state };
      }

      // mostrar éxito con botón siguiente (si existe)
      const nextBtn = createNextButton();
      outputArea.innerHTML = `<div class="msg-success"><strong>✅ ${result.message}</strong></div>`;
      outputArea.appendChild(nextBtn);
    } else {
      // error: mostrar feedback
      outputArea.innerHTML = `<div class="msg-error">❌ ${result.message}</div>`;
    }
  } catch (err) {
    outputArea.innerHTML = `<div class="msg-error">Error al validar: ${err.message}</div>`;
  }
});

/* Botón para avanzar al siguiente escenario */
function createNextButton() {
  const btn = document.createElement("button");
  btn.className = "btn primary";
  btn.textContent = "Avanzar al siguiente nivel";
  btn.addEventListener("click", () => {
    const currentIndex = scenarios.findIndex((s) => s.id === currentScenario.id);
    const nextIndex = Math.min(currentIndex + 1, scenarios.length - 1);
    const next = scenarios[nextIndex];
    if (next && next.id !== currentScenario.id) {
      loadScenario(next.id);
    } else {
      // si ya estás al final
      outputArea.innerHTML = `<div class="msg-success">¡Llegaste al final de los escenarios disponibles! Repasa o reinicia.</div>`;
    }
  });
  return btn;
}

/* Reset del editor y área de salida */
resetBtn.addEventListener("click", () => {
  if (!currentScenario) return;
  codeEditor.value = currentScenario.starterCode;
  updateHighlight();
  outputArea.innerHTML = `<div class="msg-info">Editor restablecido.</div>`;
});

/* -------------------------
   Funciones utilitarias
   ------------------------- */

/* Quita comentarios de línea (#) para facilitar validaciones */
function removeComments(text) {
  // eliminamos todo lo que esté en # hasta el final de la línea (pero mantenemos saltos de línea)
  return text.replace(/#.*$/gm, "");
}

/* Inicialización al cargar la página */
function initApp() {
  initTopics();
  // cargar primer escenario por defecto
  if (scenarios.length > 0) {
    loadScenario(scenarios[0].id);
  }
  // inicializar resaltado
  updateHighlight();
}

window.addEventListener("DOMContentLoaded", initApp);
