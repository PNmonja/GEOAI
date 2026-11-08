// OQTHERA — banco visual de candidatos de Wikimedia Commons.
// Los resultados se guardan como pendientes; nunca se verifican automáticamente.
(() => {
 const $ = s => document.querySelector(s);
 const queryInput=$("#commons-query"), classSelect=$("#commons-class"), results=$("#commons-results"), status=$("#commons-status"), count=$("#commons-count"), exportButton=$("#commons-export");
 if(!queryInput || !classSelect || !results) return;
 let candidates=[];
 const csvCell=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const clean=v=>String(v??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
 const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
 function updateCount(){count.textContent=String(candidates.length);exportButton.disabled=!candidates.length;}
 function renderCard(page){
  const info=page.imageinfo?.[0]||{}, meta=info.extmetadata||{}, license=clean(meta.LicenseShortName?.value), source=info.descriptionurl||"", artist=clean(meta.Artist?.value||meta.Credit?.value||meta.Attribution?.value);
  const usable=Boolean(info.thumburl&&license&&source&&artist), card=node("article","commons-card");
  if(info.thumburl){const img=node("img","commons-thumb");img.src=info.thumburl;img.alt=clean(meta.ImageDescription?.value||page.title);img.loading="lazy";card.append(img);}
  const body=node("div","commons-card-body");body.append(node("b","",clean(page.title.replace(/^File:/,""))));
  body.append(node("p","", "Autoría: "+(artist||"No indicada en metadatos")));body.append(node("p","", "Licencia: "+(license||"No identificada automáticamente")));
  const link=node("a","","ABRIR FICHA ORIGINAL ↗");link.href=source||"#";link.target="_blank";link.rel="noopener noreferrer";body.append(link);
  if(!usable){body.append(node("p","commons-warning","No se puede añadir automáticamente: faltan metadatos básicos. Revisión manual necesaria."));}
  else {const button=node("button","btn ghost","AÑADIR A REVISIÓN +");button.addEventListener("click",()=>{
   if(candidates.some(x=>x.image_id===String(page.pageid)))return;
   const parts=classSelect.value.split("|");
   candidates.push({image_id:String(page.pageid),sample_id:"",class_id:parts[0],scientific_name:parts[1],determination_source:"PENDIENTE_DE_REVISION",determined_by:"",review_status:"pending",locality:"unknown",image_path:"",photographer:artist,license,attribution:clean(meta.Attribution?.value||artist),source_url:source,view:"unknown",lighting:"unknown",background:"unknown",condition:"unknown",split:"",sha256:"",notes:"Candidato Commons; confirmar que representa la clase antes de aceptar."});
   updateCount();button.textContent="AÑADIDO ✓";button.disabled=true;
  });body.append(button);}
  card.append(body);results.append(card);
 }
 async function search(){
  const q=queryInput.value.trim();if(!q){status.textContent="Escribe un término de búsqueda.";return;}
  results.replaceChildren();status.textContent="Buscando fotografías y metadatos…";$("#commons-search").disabled=true;
  try{const p=new URLSearchParams({action:"query",format:"json",origin:"*",generator:"search",gsrsearch:q,gsrnamespace:"6",gsrlimit:"18",prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"720",iiextmetadatafilter:"Artist|Attribution|Credit|LicenseShortName|LicenseUrl|ImageDescription"});
   const response=await fetch("https://commons.wikimedia.org/w/api.php?"+p.toString());if(!response.ok)throw new Error("API error");
   const data=await response.json(), pages=Object.values(data.query?.pages||{});if(!pages.length){status.textContent="No se encontraron archivos. Prueba otro término.";return;}
   pages.sort((a,b)=>a.title.localeCompare(b.title));pages.forEach(renderCard);status.textContent=pages.length+" resultados. Revisa cada ficha original antes de reutilizarla.";
  }catch(e){status.textContent="No se pudo completar la búsqueda. Comprueba la conexión e inténtalo de nuevo.";}finally{$("#commons-search").disabled=false;}
 }
 function exportCsv(){if(!candidates.length)return;const fields=["image_id","sample_id","class_id","scientific_name","determination_source","determined_by","review_status","locality","image_path","photographer","license","attribution","source_url","view","lighting","background","condition","split","sha256","notes"];
  const csv=[fields.map(csvCell).join(","),...candidates.map(row=>fields.map(k=>csvCell(row[k])).join(","))].join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=node("a");a.href=url;a.download="oqthera-candidatos-pendientes.csv";a.click();URL.revokeObjectURL(url);
 }
 $("#commons-search").addEventListener("click",search);queryInput.addEventListener("keydown",e=>{if(e.key==="Enter")search();});$("#commons-export").addEventListener("click",exportCsv);updateCount();
})();