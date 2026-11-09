// OQTHERA — exploración científica
// Estado de IA: aún no hay modelo visual entrenado ni imágenes etiquetadas.
// Protocolo y clases iniciales: AI_DATASET_PROTOCOL.md y data/mineral-classes.json.
// La identificación de esta versión es orientativa y basada en reglas.
// No existe todavía un modelo de visión artificial conectado.

const minerals = [
  {name:"Cuarzo",type:"Mineral",formula:"SiO₂",group:"Silicatos · tectosilicatos",hardness:"7",luster:"Vítreo",streak:"Blanca",cleavage:"Sin exfoliación; fractura concoidea frecuente",description:"Mineral muy común, presente en numerosas rocas. Puede aparecer en cristales prismáticos o en masas.",confusions:"Calcita y feldespatos en muestras masivas.",mindat:"https://www.mindat.org/min-3337.html"},
  {name:"Calcita",type:"Mineral",formula:"CaCO₃",group:"Carbonatos",hardness:"3",luster:"Vítreo a nacarado",streak:"Blanca",cleavage:"Exfoliación romboédrica marcada",description:"Carbonato frecuente en calizas y mármoles. Puede presentar cristales con formas variadas.",confusions:"Cuarzo, dolomita y otros carbonatos.",mindat:"https://www.mindat.org/min-859.html"},
  {name:"Yeso",type:"Mineral",formula:"CaSO₄·2H₂O",group:"Sulfatos",hardness:"2",luster:"Vítreo a sedoso",streak:"Blanca",cleavage:"Exfoliación muy buena",description:"Mineral evaporítico de baja dureza. Puede aparecer en cristales, masas o variedades fibrosas.",confusions:"Calcita y halita en muestras claras.",mindat:"https://www.mindat.org/min-1784.html"},
  {name:"Halita",type:"Mineral",formula:"NaCl",group:"Haluros",hardness:"2–2,5",luster:"Vítreo",streak:"Blanca",cleavage:"Exfoliación cúbica",description:"Mineral evaporítico que forma cristales cúbicos y puede ser transparente o presentar coloraciones.",confusions:"Calcita y yeso; no debe probarse por sabor para identificarla.",mindat:"https://www.mindat.org/min-1804.html"},
  {name:"Moscovita",type:"Mineral",formula:"KAl₂(AlSi₃O₁₀)(OH)₂",group:"Silicatos · filosilicatos",hardness:"2–2,5",luster:"Vítreo a nacarado",streak:"Blanca",cleavage:"Exfoliación basal perfecta en láminas",description:"Mica clara que suele separarse en láminas finas y flexibles. La identificación requiere observar varias propiedades.",confusions:"Biotita y otros minerales laminares.",mindat:"https://www.mindat.org/min-2815.html"},
  {name:"Biotita",type:"Mineral",formula:"K(Fe²⁺/Mg)₂(Al/Fe³⁺/Mg/Ti)([Si/Al/Fe]₂Si₂O₁₀)(OH/F)₂",group:"Silicatos · filosilicatos",hardness:"2,5–3",luster:"Vítreo a nacarado",streak:"Blanca a grisácea",cleavage:"Exfoliación basal perfecta en láminas",description:"Mica oscura rica en hierro y magnesio. Presenta exfoliación en láminas; conviene contrastar con otras micas.",confusions:"Moscovita y otros minerales laminares oscuros.",mindat:"https://www.mindat.org/min-677.html"},
  {name:"Granito",type:"Roca",formula:"Composición variable",group:"Ígnea · plutónica",hardness:"Variable",luster:"Aspecto granular",streak:"No aplicable como criterio único",cleavage:"No aplicable",description:"Roca ígnea plutónica generalmente compuesta por cuarzo, feldespatos y micas. Su identificación requiere observar la textura y los minerales presentes.",confusions:"Otras rocas plutónicas de aspecto claro.",mindat:"https://www.mindat.org/"},
  {name:"Basalto",type:"Roca",formula:"Composición máfica",group:"Ígnea · volcánica",hardness:"Variable",luster:"Generalmente mate",streak:"No aplicable como criterio único",cleavage:"No aplicable",description:"Roca volcánica de grano habitualmente fino, común en coladas de lava. Puede contener minerales que no se distinguen a simple vista.",confusions:"Otras rocas volcánicas oscuras.",mindat:"https://www.mindat.org/"}
];

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
      <a class="reference-link" href="${m.mindat}" target="_blank" rel="noopener noreferrer">Consultar referencia externa ↗</a>
    </article>`).join(""):"<p class='empty-state'>No hay resultados para esa búsqueda. Prueba otro término.</p>";
}
search?.addEventListener("input",renderSamples);
filter?.addEventListener("change",renderSamples);
renderSamples();

// Guía de propiedades: no usa fotografías ni afirma reconocer imágenes.
const questions=[
 {title:"¿Qué tipo de brillo observas?",help:"Observa la superficie con luz normal. El brillo por sí solo no identifica un mineral.",key:"luster",options:[["Metálico","metal"],["Vítreo","vitreous"],["Nacarado o sedoso","pearly"],["No puedo determinarlo","unknown"]]},
 {title:"¿Qué dureza aproximada conoces?",help:"Registra solo una prueba ya realizada de forma segura. No rayes piezas valiosas ni uses herramientas.",key:"hardness",options:[["Muy baja: se raya con la uña","very_low"],["Intermedia: alrededor de 3","around_three"],["Alta: puede rayar vidrio","high"],["No lo sé","unknown"]]},
 {title:"¿Conoces el color de la raya?",help:"La raya es el color del polvo del mineral, no el color externo. No realices pruebas sobre piezas valiosas.",key:"streak",options:[["Blanca o clara","light"],["Oscura o coloreada","dark"],["No se ha comprobado","unknown"]]},
 {title:"¿Qué exfoliación o rotura has observado?",help:"Elige solo una forma que hayas observado claramente. Si no puedes distinguirla, marca que no lo sabes.",key:"cleavage",options:[["Láminas finas y flexibles","sheets"],["Planos que forman romboedros","rhombohedral"],["Planos a 90° que forman cubos","cubic"],["Una dirección de exfoliación marcada","one_direction"],["Fractura curva o concoidea","conchoidal"],["No lo sé","unknown"]]}
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
 stepCount.textContent=`PASO 0${stepIndex+1} / 04`;
 progress.style.width=((stepIndex+1)/4*100)+"%";
 back.disabled=stepIndex===0;
 questionArea.innerHTML=`<h3>${q.title}</h3><p>${q.help}</p><div class="answers">${q.options.map(([label,value])=>`<button class="answer ${answers[q.key]===value?"selected":""}" data-value="${value}">${label}<span>→</span></button>`).join("")}</div>`;
 questionArea.querySelectorAll(".answer").forEach(btn=>btn.addEventListener("click",()=>{
   answers[q.key]=btn.dataset.value;
   if(stepIndex<questions.length-1){stepIndex++;renderQuestion()}else showResult();
 }));
}
function scoreMineral(m){
 let score=0, known=0, incompatible=false;
 const h=answers.hardness,l=answers.luster,s=answers.streak,c=answers.cleavage;
 if(l!=="unknown"){known++;if(l==="metal")incompatible=true;if(l==="pearly"&&(m.name==="Moscovita"||m.name==="Biotita"||m.name==="Yeso"))score+=1;}
 if(h!=="unknown"){
   known++;
   if(h==="high"&&m.name!=="Cuarzo")incompatible=true;
   if(h==="very_low"&&m.name==="Yeso")score+=2;
   if(h==="around_three"&&m.name==="Calcita")score+=1;
 }
 if(s!=="unknown"){known++;if(s==="dark")incompatible=true;}
 if(c!=="unknown"){
   known++;
   if(c==="sheets"&&(m.name==="Moscovita"||m.name==="Biotita"))score+=3;
   if(c==="rhombohedral"&&m.name==="Calcita")score+=3;
   if(c==="cubic"&&m.name==="Halita")score+=3;
   if(c==="one_direction"&&m.name==="Yeso")score+=2;
   if(c==="conchoidal"&&m.name==="Cuarzo")score+=2;
 }
 return {score,known,incompatible};
}
function showResult(){
 const anyKnown=Object.values(answers).some(v=>v!=="unknown");
 if(!anyKnown){questionArea.innerHTML=`<div class="result-card"><span class="result-label">SIN INFORMACIÓN SUFICIENTE</span><h3>No es posible orientar la identificación.</h3><p>Necesitamos al menos una propiedad observable. Puedes reiniciar la guía cuando tengas más información.</p><button class="btn" id="try-again">VOLVER A EMPEZAR</button></div>`;document.querySelector("#try-again").addEventListener("click",restart);return}
 const ranked=minerals.filter(m=>m.type==="Mineral").map(m=>({m,...scoreMineral(m)})).filter(x=>x.known>0&&!x.incompatible).sort((a,b)=>b.score-a.score);
 const uncertain=Object.values(answers).filter(v=>v==="unknown").length;
 const bestScore=ranked.length?ranked[0].score:0;
 // No mostramos minerales elegidos por el orden del catálogo cuando ninguna propiedad los respalda.
 const top=bestScore>0?ranked.filter(x=>x.score===bestScore):[];
 const hasConflict=answers.luster==="metal"||answers.streak==="dark"||(answers.hardness==="high"&&ranked.length===0);\n const heading=top.length?"Posibilidades compatibles para contrastar":"Información insuficiente para orientar la identificación";
 const candidatesHtml=top.length?`<div class="candidate-list">${top.map(x=>`<article><b>${x.m.name}</b><span>${x.m.formula}</span><p>${x.m.description}</p><small>Posibles confusiones: ${x.m.confusions}</small><a href="${x.m.mindat}" target="_blank" rel="noopener noreferrer">Consultar referencia externa ↗</a></article>`).join("")}</div>`:`<p>${hasConflict?"Una o más propiedades no encajan con las referencias del conjunto inicial de seis minerales.":"No hay una coincidencia respaldada por las propiedades seleccionadas."} No mostraremos minerales al azar. Observa otras características o consulta una persona especialista.</p>`;
 questionArea.innerHTML=`<div class="result-card"><span class="result-label">ORIENTACIÓN PRELIMINAR · NO ES UN DIAGNÓSTICO</span><h3>${heading}</h3><p>La guía compara algunas propiedades declaradas. No calcula probabilidades ni confirma la identidad de una muestra.</p>${candidatesHtml}<p class="result-caution">${uncertain? "Hay propiedades sin determinar; la orientación es especialmente limitada.":"Las propiedades usadas son insuficientes para confirmar un mineral."} Si ninguna opción encaja, no fuerces una identificación.</p><button class="btn" id="try-again">NUEVA OBSERVACIÓN ↺</button></div>`;
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
