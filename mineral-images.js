/* OQTHERA shared specimen photography.
   The same cached image is reused wherever a mineral appears. */
(() => {
 const searches={
  "Cuarzo":["quartz crystal specimen","rock crystal quartz"],
  "Calcita":["calcite crystal specimen","Iceland spar calcite"],
  "Yeso":["gypsum selenite crystal","desert rose gypsum"],
  "Halita":["halite rock salt crystal","halite cubic crystal"],
  "Moscovita":["muscovite mica specimen","muscovite mica sheets"],
  "Biotita (grupo)":["biotite mica specimen","biotite crystal"],
  "Granito":["granite rock hand specimen","granite coarse grained rock"],
  "Basalto":["basalt rock hand specimen","basalt lava rock"],
  "Fluorita":["fluorite cubic crystal specimen","fluorite purple green crystal"],
  "Pirita":["pyrite cubic crystal specimen","pyrite mineral cluster"],
  "Hematita":["hematite specular mineral specimen","hematite botryoidal specimen"],
  "Magnetita":["magnetite octahedral crystal specimen","magnetite mineral specimen"],
  "Ortoclasa":["orthoclase feldspar crystal specimen","orthoclase feldspar mineral"],
  "Olivino":["olivine peridot crystal specimen","olivine mineral specimen"],
  "Talco":["talc mineral specimen","talc schist specimen"],
  "Dolomita":["dolomite rhombohedral crystal specimen","dolomite mineral specimen"]
 };
 const clean=value=>String(value||"").replace(/<[^>]*>/g," ").replace(/\\s+/g," ").trim();
 const key=name=>"oqthera:mineral-image-v2:"+name.toLocaleLowerCase("es");
 const cacheRead=name=>{try{return JSON.parse(localStorage.getItem(key(name))||"null")}catch{return null}};
 const cacheWrite=(name,value)=>{try{localStorage.setItem(key(name),JSON.stringify(value))}catch{}};
 const pending=new Map();
 async function get(name){
  const saved=cacheRead(name);if(saved?.url)return saved;
  if(pending.has(name))return pending.get(name);
  const task=(async()=>{
   const queries=searches[name]||[name+" mineral specimen"];
   for(const query of queries){
    const params=new URLSearchParams({action:"query",format:"json",origin:"*",generator:"search",gsrsearch:'filetype:bitmap "'+query+'"',gsrnamespace:"6",gsrlimit:"15",prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"1100"});
    const response=await fetch("https://commons.wikimedia.org/w/api.php?"+params.toString());
    if(!response.ok)continue;
    const data=await response.json();
    const pages=Object.values(data.query?.pages||{});
    const terms=query.toLowerCase().split(/\\s+/).filter(word=>word.length>3&&!["specimen","crystal","mineral","rock","hand"].includes(word));
    const ranked=pages.filter(page=>page.imageinfo?.[0]?.thumburl).map(page=>{
     const title=(page.title||"").toLowerCase();
     const score=terms.reduce((sum,term)=>sum+(title.includes(term)?3:0),0)
      +(/specimen|crystal|mineral|rock/i.test(title)?1:0);
     return {page,score};
    }).sort((a,b)=>b.score-a.score);
    const match=ranked.find(item=>item.score>=3)?.page;
    if(!match)continue;
    const info=match.imageinfo[0];
    const result={url:info.thumburl,source:info.descriptionurl||("https://commons.wikimedia.org/wiki/"+encodeURIComponent(match.title.replace(/ /g,"_"))),title:match.title,license:clean(info.extmetadata?.LicenseShortName?.value||"Consultar licencia en archivo original")};
    cacheWrite(name,result);return result;
   }
   return null;
  })().finally(()=>pending.delete(name));
  pending.set(name,task);return task;
 }
 window.OQTHERA_MINERAL_IMAGES={get};
})();
