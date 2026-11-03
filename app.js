document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const imageInput = $("imageInput");
  const imagePreview = $("imagePreview");
  const uploadArea = $("uploadArea");
  const sampleForm = $("sampleForm");
  const formMessage = $("formMessage");
  const observationsList = $("observationsList");
  const observationCount = $("observationCount");

  const STORAGE_KEY = "geoai_v2_observations";
  let selectedImage = null;

  function getObservations() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error leyendo los registros:", error);
      return [];
    }
  }

  function saveObservations(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error("Error guardando los registros:", error);
      return false;
    }
  }

  function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? "#f0a2a2" : "#39d8c5";
  }

  function loadImage(file) {
    if (!file) return;

    const accepted = ["image/jpeg", "image/png", "image/webp"];

    if (!accepted.includes(file.type)) {
      showMessage("Formato no válido. Utiliza JPG, PNG o WEBP.", true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("La imagen supera el límite de 5 MB.", true);
      return;
    }

    if (selectedImage) URL.revokeObjectURL(selectedImage);
    selectedImage = URL.createObjectURL(file);

    imagePreview.src = selectedImage;
    imagePreview.classList.add("visible");
    showMessage("Imagen preparada para la observación.");
  }

  imageInput.addEventListener("change", (event) => {
    loadImage(event.target.files[0]);
  });

  uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("dragging");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragging");
  });

  uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.classList.remove("dragging");

    const file = event.dataTransfer.files[0];
    if (!file) return;

    loadImage(file);
  });

  function renderObservations() {
    const observations = getObservations();
    observationsList.replaceChildren();
    observationCount.textContent = observations.length;

    if (!observations.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Todavía no hay muestras registradas.";
      observationsList.appendChild(empty);
      return;
    }

    observations.slice().reverse().forEach((item) => {
      const article = document.createElement("article");
      article.className = "observation-item";

      const info = document.createElement("div");
      const title = document.createElement("h3");
      const details = document.createElement("p");
      const date = document.createElement("time");
      const remove = document.createElement("button");

      title.textContent = item.name;
      details.textContent = [
        item.type,
        item.color,
        item.texture,
        item.location,
        item.notes
      ].filter(Boolean).join(" · ");

      date.textContent = item.date;
      remove.type = "button";
      remove.className = "delete-observation";
      remove.textContent = "Eliminar";
      remove.setAttribute("aria-label", "Eliminar " + item.name);

      remove.addEventListener("click", () => {
        const remaining = getObservations().filter(
          (record) => record.id !== item.id
        );

        if (saveObservations(remaining)) {
          renderObservations();
        }
      });

      info.append(title, details);
      article.append(info, date, remove);
      observationsList.appendChild(article);
    });
  }

  sampleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("sampleName").value.trim();
    const type = $("sampleType").value;

    if (!name || !type) {
      showMessage("Completa el nombre y la categoría de la muestra.", true);
      return;
    }

    const record = {
      id: Date.now().toString(),
      name,
      type,
      color: $("sampleColor").value.trim(),
      texture: $("sampleTexture").value,
      location: $("sampleLocation").value.trim(),
      notes: $("sampleNotes").value.trim(),
      date: new Date().toLocaleDateString("es-ES")
    };

    const observations = getObservations();
    observations.push(record);

    if (!saveObservations(observations)) {
      showMessage("No se pudo guardar. Comprueba el almacenamiento del navegador.", true);
      return;
    }

    sampleForm.reset();
    imageInput.value = "";
    imagePreview.removeAttribute("src");
    imagePreview.classList.remove("visible");

    if (selectedImage) URL.revokeObjectURL(selectedImage);
    selectedImage = null;

    showMessage("Muestra registrada correctamente.");
    renderObservations();
  });

  // Búsqueda y filtros de la biblioteca
  const searchInput = $("librarySearch");
  const filterSelect = $("libraryFilter");
  const cards = Array.from(document.querySelectorAll(".knowledge-card"));
  const noResults = $("noResults");

  function filterLibrary() {
    const query = searchInput.value.trim().toLocaleLowerCase("es");
    const category = filterSelect.value;
    let visible = 0;

    cards.forEach((card) => {
      const matchesText = card.textContent.toLocaleLowerCase("es").includes(query);
      const matchesCategory = category === "Todas" || card.dataset.category === category;
      const show = matchesText && matchesCategory;

      card.hidden = !show;
      if (show) visible++;
    });

    noResults.hidden = visible !== 0;
  }

  searchInput.addEventListener("input", filterLibrary);
  filterSelect.addEventListener("change", filterLibrary);

  // Exportación de registros en formato JSON
  $("exportButton").addEventListener("click", () => {
    const observations = getObservations();

    if (!observations.length) {
      alert("Todavía no hay registros para exportar.");
      return;
    }

    const file = new Blob(
      [JSON.stringify(observations, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "geoai-coleccion.json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  });

  // Menú para pantallas pequeñas
  const menuToggle = $("menuToggle");
  const mainNav = $("mainNav");

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      menuToggle.textContent = "☰";
    });
  });

  renderObservations();
  console.log("GEOAI 2.0 iniciado correctamente.");
});
