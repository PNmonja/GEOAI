document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadArea = document.getElementById("uploadArea");
  const sampleForm = document.getElementById("sampleForm");
  const formMessage = document.getElementById("formMessage");
  const observationsList = document.getElementById("observationsList");

  let selectedImage = null;

  // Cargar las observaciones guardadas
  function getObservations() {
    try {
      return JSON.parse(localStorage.getItem("geoai_observations")) || [];
    } catch (error) {
      console.error("No se pudieron cargar las observaciones:", error);
      return [];
    }
  }

  // Guardar observaciones
  function saveObservations(observations) {
    try {
      localStorage.setItem("geoai_observations", JSON.stringify(observations));
      return true;
    } catch (error) {
      console.error("No se pudieron guardar las observaciones:", error);
      return false;
    }
  }

  // Mostrar la imagen seleccionada
  function displayImage(file) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      formMessage.textContent = "Formato no válido. Utiliza JPG, PNG o WEBP.";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      formMessage.textContent = "La imagen supera el límite de 5 MB.";
      return;
    }

    selectedImage = file;

    const reader = new FileReader();

    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      imagePreview.classList.add("visible");
      formMessage.textContent = "Imagen cargada correctamente.";
    };

    reader.onerror = () => {
      formMessage.textContent = "No se pudo leer la imagen.";
    };

    reader.readAsDataURL(file);
  }

  imageInput.addEventListener("change", (event) => {
    displayImage(event.target.files[0]);
  });

  // Permitir arrastrar imágenes
  uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = "#36d6c3";
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "";
  });

  uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.style.borderColor = "";

    const file = event.dataTransfer.files[0];

    if (file) {
      displayImage(file);
    }
  });

  // Mostrar las observaciones
  function renderObservations() {
    const observations = getObservations();

    observationsList.innerHTML = "";

    if (observations.length === 0) {
      observationsList.innerHTML =
        '<p class="empty-state">Todavía no hay observaciones guardadas.</p>';
      return;
    }

    observations.slice().reverse().forEach((observation) => {
      const item = document.createElement("article");
      item.className = "observation-item";

      const information = document.createElement("div");

      const title = document.createElement("h3");
      title.textContent = observation.name;

      const details = document.createElement("p");
      details.textContent =
        [observation.type, observation.color, observation.texture, observation.location]
          .filter(Boolean)
          .join(" · ");

      const date = document.createElement("time");
      date.textContent = observation.date;

      information.appendChild(title);
      information.appendChild(details);

      item.appendChild(information);
      item.appendChild(date);

      observationsList.appendChild(item);
    });
  }

  // Registrar una muestra
  sampleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("sampleName").value.trim();
    const type = document.getElementById("sampleType").value;
    const color = document.getElementById("sampleColor").value.trim();
    const texture = document.getElementById("sampleTexture").value;
    const location = document.getElementById("sampleLocation").value.trim();

    if (!name || !type) {
      formMessage.textContent =
        "Escribe un nombre y selecciona el tipo de muestra.";
      return;
    }

    const observations = getObservations();

    const newObservation = {
      id: Date.now(),
      name,
      type,
      color,
      texture,
      location,
      date: new Date().toLocaleDateString("es-ES")
    };

    observations.push(newObservation);

    if (!saveObservations(observations)) {
      formMessage.textContent =
        "No se pudo guardar. Comprueba el almacenamiento del navegador.";
      return;
    }

    sampleForm.reset();
    imageInput.value = "";
    imagePreview.src = "";
    imagePreview.classList.remove("visible");
    selectedImage = null;

    formMessage.textContent = "Observación guardada correctamente.";

    renderObservations();
  });

  // Inicio
  renderObservations();

  console.log("GEOAI iniciado correctamente.");
});
