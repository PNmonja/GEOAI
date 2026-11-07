
// ==========================================
// GEOAI — LABORATORIO CIENTÍFICO
// Catálogo, guía mineralógica y acceso a Mindat
// ==========================================

// ---------- CATÁLOGO DE MUESTRAS ----------

const data = [
  ["Granito", "Roca", "Ígnea · plutónica", "Roca formada por el enfriamiento lento del magma en profundidad.", "◈"],
  ["Basalto", "Roca", "Ígnea · volcánica", "Roca volcánica de grano fino, común en coladas de lava.", "⬟"],
  ["Cuarzo", "Mineral", "Silicato · SiO₂", "Mineral de dureza 7 en la escala de Mohs y brillo vítreo.", "◇"],
  ["Calcita", "Mineral", "Carbonato · CaCO₃", "Mineral frecuente con exfoliación característica.", "✧"],
  ["Ammonites", "Fósil", "Cefalópodos extintos", "Moluscos marinos fósiles con concha enrollada.", "◎"],
  ["Trilobites", "Fósil", "Artrópodos paleozoicos", "Artrópodos marinos extintos del Paleozoico.", "✺"]
];

const search = document.querySelector("#search");
const filter = document.querySelector("#filter");
const samples = document.querySelector("#samples");

function render() {
  if (!search || !filter || !samples) return;

  const q = search.value.toLowerCase();

  const rows = data.filter(x =>
    (filter.value === "Todos" || x[1] === filter.value) &&
    x.join(" ").toLowerCase().includes(q)
  );

  samples.innerHTML = rows.length
    ? rows.map(x => `
      <article class="sample">
        <div class="symbol">${x[4]}</div>
        <small>${x[1].toUpperCase()}</small>
        <h4>${x[0]}</h4>
        <p>${x[3]}</p>
        <span class="tag">${x[2]}</span>
      </article>
    `).join("")
    : "<p>No se encontraron muestras.</p>";
}

if (search) search.addEventListener("input", render);
if (filter) filter.addEventListener("change", render);

document.querySelectorAll(".domains button").forEach(button => {
  button.addEventListener("click", () => {
    if (!filter) return;

    filter.value = button.dataset.filter;
    render();

    samples.scrollIntoView({ behavior: "smooth" });
  });
});

render();


// ---------- GUÍA DE IDENTIFICACIÓN MINERALÓGICA ----------

const steps = [
  [
    "¿Qué brillo presenta la muestra?",
    "Observa cómo refleja la luz.",
    [
      ["Metálico", "metal"],
      ["No metálico", "nonmetal"],
      ["No estoy seguro", "unknown"]
    ]
  ],
  [
    "¿Qué dureza aproximada tiene?",
    "No realices pruebas sobre piezas valiosas o desconocidas.",
    [
      ["Baja: se raya con la uña", "soft"],
      ["Media", "medium"],
      ["Alta: puede rayar vidrio", "hard"],
      ["No lo sé", "unknown"]
    ]
  ],
  [
    "¿Qué aspecto tiene la raya?",
    "La raya es el color del polvo del mineral.",
    [
      ["Blanca o clara", "light"],
      ["Oscura", "dark"],
      ["No lo he comprobado", "unknown"]
    ]
  ]
];

let n = 0;
let answers = [];

const question = document.querySelector("#question");
const step = document.querySelector("#step");
const progress = document.querySelector("#progress");
const back = document.querySelector("#back");

function draw() {
  if (!question || !step || !progress || !back) return;

  const s = steps[n];

  step.textContent = `PASO 0${n + 1} DE 03`;
  progress.style.width = ((n + 1) / 3 * 100) + "%";
  back.disabled = n === 0;

  question.innerHTML = `
    <h3>${s[0]}</h3>
    <p>${s[1]}</p>
    ${s[2].map(a => `
      <button class="choice" data-v="${a[1]}">
        ${a[0]} →
      </button>
    `).join("")}
  `;

  question.querySelectorAll(".choice").forEach(button => {
    button.addEventListener("click", () => {
      answers[n] = button.dataset.v;

      if (n < 2) {
        n++;
        draw();
      } else {
        result();
      }
    });
  });
}

function result() {
  let title = "Resultado no concluyente";
  let desc = "Las respuestas no permiten orientar una identificación concreta. Registra más propiedades y consulta una referencia especializada.";

  if (
    answers[0] === "nonmetal" &&
    answers[1] === "hard" &&
    answers[2] === "light"
  ) {
    title = "Cuarzo: una posibilidad para contrastar";
    desc = "El cuarzo suele presentar brillo vítreo, dureza 7 y raya blanca. Esta combinación no confirma por sí sola la identificación.";
  } else if (
    answers[0] === "nonmetal" &&
    answers[1] === "soft"
  ) {
    title = "Mineral de baja dureza";
    desc = "Talco o yeso son ejemplos de minerales blandos. Se necesitan más observaciones para diferenciarlos.";
  } else if (
    answers[0] === "metal" &&
    answers[1] === "soft"
  ) {
    title = "Posible mineral de brillo metálico";
    desc = "Algunos sulfuros pueden presentar estas propiedades. Contrasta raya, densidad y otras características.";
  }

  question.innerHTML = `
    <div class="result">
      <b>${title}</b>
      <p>${desc}</p>
      <small>Orientación educativa · No es un diagnóstico mineralógico.</small>
    </div>
    <button class="choice" id="again">Volver a empezar ↺</button>
  `;

  document.querySelector("#again").addEventListener("click", reset);
}

function reset() {
  n = 0;
  answers = [];
  draw();
}

if (back) {
  back.addEventListener("click", () => {
    if (n > 0) {
      n--;
      draw();
    }
  });
}

const resetButton = document.querySelector("#reset");
if (resetButton) resetButton.addEventListener("click", reset);

draw();


// ---------- INTEGRACIÓN INICIAL DE MINDAT ----------

function createMindatSection() {
  const exploration = document.querySelector("#explorar");
  const identification = document.querySelector("#identificacion");

  if (!exploration || !identification) return;

  if (document.querySelector("#mindat")) return;

  const section = document.createElement("section");

  section.id = "mindat";
  section.className = "section";

  section.innerHTML = `
    <label>04 — BASE DE DATOS MINERALÓGICA</label>

    <h2>Consulta la base de datos <em>Mindat.</em></h2>

    <p class="sub">
      Busca minerales y consulta información mineralógica
      en una de las principales bases de datos especializadas.
    </p>

    <div class="toolbar">
      <div>
        <label>CONSULTA EXTERNA</label>
        <h3>Buscar un mineral en Mindat</h3>
      </div>

      <input
        id="mindat-search"
        type="search"
        placeholder="Ej. cuarzo, calcita, fluorita..."
        aria-label="Nombre del mineral"
      >

      <button class="choice" id="mindat-button">
        BUSCAR EN MINDAT ↗
      </button>
    </div>

    <p class="note">
      La búsqueda se realiza en la web de Mindat.
      GEOAI no descarga ni verifica automáticamente sus datos.
    </p>

    <a
      class="btn ghost"
      href="https://www.mindat.org/"
      target="_blank"
      rel="noopener noreferrer"
    >
      VISITAR MINDAT ↗
    </a>
  `;

  identification.parentNode.insertBefore(section, identification);

  const input = section.querySelector("#mindat-search");
  const button = section.querySelector("#mindat-button");

  function searchMindat() {
    const mineral = input.value.trim();

    if (!mineral) {
      input.focus();
      return;
    }

    const url =
      "https://www.mindat.org/search.php?search=" +
      encodeURIComponent(mineral);

    window.open(url, "_blank", "noopener,noreferrer");
  }

  button.addEventListener("click", searchMindat);

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      searchMindat();
    }
  });
}

createMindatSection();


// ---------- MENÚ PARA MÓVILES ----------

const menuButton = document.querySelector("#menu");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const nav = document.querySelector("nav");

    if (!nav) return;

    nav.style.display =
      nav.style.display === "flex" ? "none" : "flex";

    nav.style.position = "absolute";
    nav.style.top = "70px";
    nav.style.right = "20px";
    nav.style.background = "#0b1e2b";
    nav.style.padding = "18px";
    nav.style.flexDirection = "column";
  });
}
