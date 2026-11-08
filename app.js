
// ==========================================
// CRISLOFAUSRA — LABORATORIO CIENTÍFICO
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


// ---------- EXPLORADOR VISUAL DE MINERALES ----------

function createMineralExplorer() {
  const identification = document.querySelector("#identificacion");
  if (!identification || document.querySelector("#mineral-explorer")) return;

  const section = document.createElement("section");
  section.id = "mineral-explorer";
  section.className = "section mineral-explorer";
  section.innerHTML = `
    <label>04 — EXPLORADOR MINERALÓGICO</label>
    <h2>Descubre minerales con <em>CRISLOFAUSRA.</em></h2>
    <p class="sub">Busca un mineral y consulta fotografías de ejemplares alojadas en Wikimedia Commons. También podrás abrir su búsqueda en Mindat.</p>
    <div class="toolbar mineral-toolbar">
      <div><label>BUSCADOR VISUAL</label><h3>¿Qué mineral quieres explorar?</h3></div>
      <input id="visual-search" type="search" placeholder="Ej. cuarzo, fluorita, calcita..." aria-label="Buscar mineral">
      <button class="choice" id="visual-search-button">BUSCAR FOTOGRAFÍAS</button>
    </div>
    <p id="visual-status" class="note" aria-live="polite">Prueba con cuarzo, amatista, calcita o fluorita.</p>
    <div id="visual-results" class="visual-results"></div>
    <div class="mindat-reference">
      <div><small>REFERENCIA MINERALÓGICA</small><h3>Consultar Mindat</h3><p>Abre la búsqueda del mineral en Mindat para consultar sus fichas y referencias.</p></div>
      <a id="mindat-link" class="btn ghost" href="https://www.mindat.org/" target="_blank" rel="noopener noreferrer">ABRIR MINDAT ↗</a>
    </div>
    <p class="note">Las fotografías proceden de Wikimedia Commons. Consulta la autoría y licencia de cada archivo en su ficha original. La galería no identifica automáticamente una muestra.</p>
  `;
  identification.parentNode.insertBefore(section, identification);

  const input = section.querySelector("#visual-search");
  const button = section.querySelector("#visual-search-button");
  const status = section.querySelector("#visual-status");
  const results = section.querySelector("#visual-results");
  const mindatLink = section.querySelector("#mindat-link");

  function safeText(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[char]));
  }

  async function searchImages() {
    const term = input.value.trim();
    if (!term) { input.focus(); return; }

    status.textContent = "Buscando fotografías y datos de licencia...";
    results.innerHTML = "";
    mindatLink.href = "https://www.mindat.org/search.php?search=" + encodeURIComponent(term);
    button.disabled = true;

    try {
      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: "filetype:bitmap " + term + " mineral specimen",
        gsrnamespace: "6",
        gsrlimit: "8",
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "640",
        format: "json",
        origin: "*"
      });

      const response = await fetch("https://commons.wikimedia.org/w/api.php?" + params);
      if (!response.ok) throw new Error("No se pudo consultar Wikimedia Commons.");

      const json = await response.json();
      const pages = Object.values(json.query?.pages || {});
      const items = pages.filter(page => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url);

      if (!items.length) {
        status.textContent = "No se encontraron fotografías. Prueba con otro nombre o en inglés.";
        return;
      }

      results.innerHTML = items.map(page => {
        const info = page.imageinfo[0];
        const meta = info.extmetadata || {};
        const author = meta.Artist?.value || "Autor no indicado";
        const license = meta.LicenseShortName?.value || "Licencia no indicada";
        const source = info.descriptionurl || info.url;
        const image = info.thumburl || info.url;
        return `
          <article class="visual-card">
            <a href="${safeText(source)}" target="_blank" rel="noopener noreferrer">
              <img src="${safeText(image)}" alt="Fotografía relacionada con ${safeText(term)}" loading="lazy">
            </a>
            <div class="visual-card-info">
              <h4>${safeText(page.title.replace(/^File:/, ""))}</h4>
              <p>Autoría: ${safeText(author.replace(/<[^>]*>/g, ""))}</p>
              <small>Licencia: ${safeText(license)}</small>
              <a href="${safeText(source)}" target="_blank" rel="noopener noreferrer">Ver archivo y atribución ↗</a>
            </div>
          </article>`;
      }).join("");

      status.textContent = "Se han encontrado " + items.length + " fotografías. Consulta la licencia y atribución de cada archivo.";
    } catch (error) {
      status.textContent = "No se pudo cargar la galería. Comprueba tu conexión e inténtalo de nuevo.";
    } finally {
      button.disabled = false;
    }
  }

  button.addEventListener("click", searchImages);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") searchImages();
  });
}

createMineralExplorer();

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
