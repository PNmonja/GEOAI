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
  {name:"Biotita",type:"Mineral",formula:"K(Mg,Fe)₃AlSi₃O₁₀(F,OH)₂",group:"Silicatos · filosilicatos",hardness:"2,5–3",luster:"Vítreo a nacarado",streak:"Blanca a grisácea",cleavage:"Exfoliación basal perfecta en láminas",description:"Mica oscura rica en hierro y magnesio. Presenta exfoliación en láminas; conviene contrastar con otras micas.",confusions:"Moscovita y otros minerales laminares oscuros.",mindat:"https://www.mindat.org/min-.by_name.html"},
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
 {title:"¿Qué tipo de brillo observas?",help:"Mira la superficie con luz normal. No uses una llama ni productos químicos.",key:"luster",options:[["Metálico","metal"],["Vítreo o no metálico","nonmetal"],["Nacarado o sedoso","pearly"],["No puedo determinarlo","unknown"]]},
 {title:"¿Qué dureza aproximada conoces?",help:"Solo registra una prueba que ya hayas realizado de forma segura. No rayes piezas valiosas.",key:"hardness",options:[["Baja: se raya con la uña","low"],["Media: entre 3 y 5,5","medium"],["Alta: puede rayar vidrio","high"],["No lo sé","unknown"]]},
 {title:"¿Conoces el color de la raya?",help:"La raya es el color del polvo del mineral; no es lo mismo que el color externo.",key:"streak",options:[["Blanca o clara","light"],["Oscura o coloreada","dark"],["No se ha comprobado","unknown"]]},
 {title:"¿Has observado exfoliación o forma de rotura?",help:"La exfoliación produce superficies planas repetidas. Si no lo distingues, elige que no lo sabes.",key:"cleavage",options:[["Láminas finas","sheets"],["Bloques o planos definidos","planes"],["Fractura irregular o curva","fracture"],["No lo sé","unknown"]]}
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
 let score=0,known=0;
 const h=answers.hardness,l=answers.luster,s=answers.streak,c=answers.cleavage;
 if(h!=="unknown"){known++;if(m.name==="Cuarzo"&&h==="high")score+=3;if(["Calcita","Yeso","Halita","Moscovita","Biotita"].includes(m.name)&&h==="low")score+=2;}
 if(l!=="unknown"){known++;if(l==="pearly"&&(m.name==="Moscovita"||m.name==="Biotita"))score+=1;}
 if(s!=="unknown"){known++; /* La raya clara es común a estas clases y no discrimina por sí sola. */ }
 if(c!=="unknown"){known++;if((m.name==="Moscovita"||m.name==="Biotita")&&c==="sheets")score+=3;if((m.name==="Calcita"||m.name==="Halita")&&c==="planes")score+=2;if(m.name==="Cuarzo"&&c==="fracture")score+=2}
 return {score,known};
}
function showResult(){
 const anyKnown=Object.values(answers).some(v=>v!=="unknown");
 if(!anyKnown){questionArea.innerHTML=`<div class="result-card"><span class="result-label">SIN INFORMACIÓN SUFICIENTE</span><h3>No es posible orientar la identificación.</h3><p>Necesitamos al menos una propiedad observable. Puedes reiniciar la guía cuando tengas más información.</p><button class="btn" id="try-again">VOLVER A EMPEZAR</button></div>`;document.querySelector("#try-again").addEventListener("click",restart);return}
 const ranked=minerals.filter(m=>m.type==="Mineral").map(m=>({m,...scoreMineral(m)})).filter(x=>x.known>0).sort((a,b)=>b.score-a.score);
 const top=ranked.filter(x=>x.score===ranked[0].score).slice(0,3);
 const uncertain=Object.values(answers).filter(v=>v==="unknown").length;
 const heading=top[0].score===0?"No hay coincidencia clara":"Posibilidades para contrastar";
 questionArea.innerHTML=`<div class="result-card"><span class="result-label">IDENTIFICACIÓN ORIENTATIVA</span><h3>${heading}</h3><p>La guía no confirma una especie mineral. Estas opciones son referencias iniciales, no probabilidades de acierto.</p><div class="candidate-list">${top.map(x=>`<article><b>${x.m.name}</b><span>${x.m.formula}</span><p>${x.m.description}</p><small>Contrasta: ${x.m.confusions}</small><a href="${x.m.mindat}" target="_blank" rel="noopener noreferrer">Consultar ficha externa ↗</a></article>`).join("")}</div><p class="result-caution">${uncertain? "Hay propiedades sin determinar; el resultado es especialmente limitado.":"Comprueba las propiedades en una fuente fiable o con una persona especialista."} Si ninguna opción encaja, no fuerces una identificación.</p><button class="btn" id="try-again">NUEVA OBSERVACIÓN ↺</button></div>`;
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
