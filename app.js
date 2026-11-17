// OQTHERA — exploración científica
// Estado de IA: aún no hay modelo visual entrenado ni imágenes etiquetadas.
// Protocolo y clases iniciales: AI_DATASET_PROTOCOL.md y data/mineral-classes.json.
// La identificación de esta versión es orientativa y basada en reglas.
// No existe todavía un modelo de visión artificial conectado.

let minerals = [];
let catalogReady = false;
async function loadCatalog(){
  try {
    const response = await fetch("data/minerals.json", {cache:"no-cache"});
    if(!response.ok) throw new Error("HTTP "+response.status);
    const catalog = await response.json();
    if(catalog.api_version !== "v1" || !Array.isArray(catalog.items)) throw new Error("Formato de catálogo no válido");
    minerals = catalog.items;
    catalogReady = true;
    renderSamples();
  } catch(error) {
    if(samples) samples.innerHTML = "<p class='empty-state'>No se ha podido cargar el catálogo propio de OQTHERA. Inténtalo más tarde.</p>";
    console.error("OQTHERA catalog:", error);
  }
}


const samples=document.querySelector("#samples");
const search=document.querySelector("#search");
const filter=document.querySelector("#filter");

function renderSamples(){
  if(!samples)return;
  const q=(search?.value||"").trim().toLocaleLowerCase("es");
  const category=filter?.value||"Todos";
  const found=minerals.filter(m=>(category==="Todos"||m.type===category)&&Object.values(m).join(" ").toLocaleLowerCase("es").includes(q));
  samples.innerHTML=found.length?found.map(m=>`
    <article class="sample-card">
      <div class="sample-top"><span>${m.type.toUpperCase()}</span><span>OQ / REF</span></div>
      <div class="sample-glyph">${m.type==="Roca"?"▧":"◇"}</div>
      <h3>${m.name}</h3><p class="formula">${m.formula}</p><p>${m.description}</p>
      <dl><div><dt>Dureza</dt><dd>${m.hardness}</dd></div><div><dt>Brillo</dt><dd>${m.luster}</dd></div><div><dt>Raya</dt><dd>${m.streak}</dd></div></dl>
      <p class="confusions"><b>Posibles confusiones:</b> ${m.confusions}</p>
      <span class="reference-link">Ficha propia OQTHERA · ${m.review_status==="verified"?"Revisada":"Pendiente de revisión científica"}</span>
    </article>`).join(""):"<p class='empty-state'>No hay resultados para esa búsqueda. Prueba otro término.</p>";
}
search?.addEventListener("input",renderSamples);
filter?.addEventListener("change",renderSamples);
loadCatalog();

// Guía de propiedades: no usa fotografías ni afirma reconocer imágenes.
const questions=[
 {title:"¿Qué tipo de brillo observas?",help:"Observa la superficie con luz normal. El brillo es una pista, no una identificación por sí solo.",key:"luster",options:[["Metálico","metal"],["Vítreo","vitreous"],["Nacarado o sedoso","pearly"],["Mate o terroso","dull"],["No puedo determinarlo","unknown"]]},
 {title:"¿Qué ocurre al intentar marcar la muestra?",help:"No dañes piezas valiosas ni hagas pruebas sobre muestras prestadas. La comparación solo es útil si el material que frota la muestra tiene dureza conocida. No uses otra roca cualquiera como patrón.",key:"scratch",options:[["La uña deja una marca","nail_marks"],["La uña no la marca; una muestra de referencia conocida sí","known_reference_marks"],["No se marca con la uña ni con esa referencia","neither_marks"],["No lo he comprobado / no lo sé","unknown"]]},
 {title:"¿Cuánta luz atraviesa la muestra?",help:"Obsérvala con luz detrás, si es posible. En agregados gruesos la transparencia puede diferir de la de un cristal fino.",key:"transparency",options:[["Se ve claramente a través","transparent"],["Deja pasar luz, pero no permite ver con claridad","translucent"],["No deja pasar luz","opaque"],["No puedo determinarlo","unknown"]]},
 {title:"¿Qué exfoliación o tipo de rotura observas?",help:"La exfoliación genera superficies planas repetidas; la fractura es una rotura sin esos planos. No golpees la muestra para comprobarlo.",key:"cleavage",options:[["Láminas finas","sheets"],["Planos romboédricos","rhombohedral"],["Planos cúbicos, cercanos a 90°","cubic"],["Una dirección de exfoliación marcada","one_direction"],["Fractura curva o concoidea","conchoidal"],["No lo sé","unknown"]]},
 {title:"¿Conoces el color de la raya? (Opcional)",help:"La raya es el color del polvo que deja el mineral sobre una placa adecuada. No hace falta realizar esta prueba: puedes omitirla.",key:"streak",options:[["Blanca o clara","light"],["Oscura o de otro color","dark"],["Omitir / no se ha comprobado","unknown"]]}
];
let stepIndex=0;
let answers={};
const questionArea=document.querySelector("#question-area");
const stepCount=document.querySelector("#step-count");
const progress=document.querySelector("#progress");
const back=document.querySelector("#back");

function renderQuestion(){
 if(!questionArea)return;
 const q=questions[stepIndex];
 stepCount.textContent=`PASO 0${stepIndex+1} / 05`;
 progress.style.width=((stepIndex+1)/5*100)+"%";
 back.disabled=stepIndex===0;
 questionArea.innerHTML=`<h3>${q.title}</h3><p>${q.help}</p><div class="answers">${q.options.map(([label,value])=>`<button class="answer ${answers[q.key]===value?"selected":""}" data-value="${value}">${label}<span>→</span></button>`).join("")}</div>`;
 questionArea.querySelectorAll(".answer").forEach(btn=>btn.addEventListener("click",()=>{
   answers[q.key]=btn.dataset.value;
   if(stepIndex<questions.length-1){stepIndex++;renderQuestion()}else showResult();
 }));
}
function scoreMineral(m){
 let score=0, known=0;
 const l=answers.luster,t=answers.transparency,s=answers.scratch,c=answers.cleavage;
 if(l!=="unknown"){known++;if(l==="pearly"&&(m.name==="Moscovita"||m.name==="Biotita"||m.name==="Yeso"))score+=1;}
 if(t!=="unknown"){known++; /* La transparencia depende también del grosor y del estado de la muestra; no se usa para descartar. */}
 if(s!=="unknown"){
   known++;
   // La prueba con la uña solo orienta hacia materiales relativamente blandos.
   // Una roca cualquiera no es un patrón de dureza; no se asignan puntos por esa opción.
   if(s==="nail_marks"&&(m.name==="Yeso"||m.name==="Halita"))score+=1;
 }
 if(c!=="unknown"){
   known++;
   if(c==="sheets"&&(m.name==="Moscovita"||m.name==="Biotita"))score+=3;
   if(c==="rhombohedral"&&m.name==="Calcita")score+=3;
   if(c==="cubic"&&m.name==="Halita")score+=3;
   if(c==="one_direction"&&m.name==="Yeso")score+=2;
   if(c==="conchoidal"&&m.name==="Cuarzo")score+=2;
 }
 return {score,known};
}
function showResult(){
 const anyKnown=Object.values(answers).some(v=>v!=="unknown");
 if(!anyKnown){questionArea.innerHTML=`<div class="result-card"><span class="result-label">SIN INFORMACIÓN SUFICIENTE</span><h3>No es posible orientar la identificación.</h3><p>Necesitamos al menos una propiedad observable. Puedes reiniciar la guía cuando tengas más información.</p><button class="btn" id="try-again">VOLVER A EMPEZAR</button></div>`;document.querySelector("#try-again").addEventListener("click",restart);return}
 const ranked=minerals.filter(m=>m.type==="Mineral").map(m=>({m,...scoreMineral(m)})).filter(x=>x.known>0).sort((a,b)=>b.score-a.score);
 const uncertain=Object.entries(answers).filter(([key,value])=>key!=="streak"&&value==="unknown").length;
 const bestScore=ranked.length?ranked[0].score:0;
 // No mostramos minerales elegidos por el orden del catálogo cuando ninguna propiedad los respalda.
 const top=bestScore>0?ranked.filter(x=>x.score===bestScore):[];
 const hasConflict=false;
 const heading=top.length?"Posibilidades compatibles para contrastar":"Información insuficiente para orientar la identificación";
 const candidatesHtml=top.length?`<div class="candidate-list">${top.map(x=>`<article><b>${x.m.name}</b><span>${x.m.formula}</span><p>${x.m.description}</p><small>Posibles confusiones: ${x.m.confusions}</small><span>Ficha propia OQTHERA · pendiente de revisión científica</span></article>`).join("")}</div>`:`<p>${hasConflict?"Una o más propiedades no encajan con las referencias del conjunto inicial de seis minerales.":"No hay una coincidencia respaldada por las propiedades seleccionadas."} No mostraremos minerales al azar. Observa otras características o consulta una persona especialista.</p>`;
 questionArea.innerHTML=`<div class="result-card"><span class="result-label">ORIENTACIÓN PRELIMINAR · NO ES UN DIAGNÓSTICO</span><h3>${heading}</h3><p>La guía compara algunas propiedades declaradas. La dureza se trata solo como una observación orientativa; no calcula probabilidades ni confirma la identidad de una muestra.</p>${candidatesHtml}<p class="result-caution">${uncertain? "Hay propiedades sin determinar; la orientación es especialmente limitada.":"Las propiedades usadas son insuficientes para confirmar un mineral."} Si ninguna opción encaja, no fuerces una identificación.</p><button class="btn" id="try-again">NUEVA OBSERVACIÓN ↺</button></div>`;
 document.querySelector("#try-again").addEventListener("click",restart);
}
function restart(){stepIndex=0;answers={};renderQuestion()}
back?.addEventListener("click",()=>{if(stepIndex>0){stepIndex--;renderQuestion()}});
document.querySelector("#restart")?.addEventListener("click",restart);
renderQuestion();

// Navegación móvil accesible.
const menu=document.querySelector("#menu");
const nav=document.querySelector("#main-nav");
menu?.addEventListener("click",()=>{
 const open=nav.classList.toggle("nav-open");
 menu.setAttribute("aria-expanded",String(open));
});
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("nav-open");menu?.setAttribute("aria-expanded","false")}));
