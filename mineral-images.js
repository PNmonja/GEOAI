/* OQTHERA shared mineral photography resolver.
   One stable image per mineral name, reused by every OQTHERA page. */
(() => {
 const englishNames={
  "Cuarzo":"Quartz","Calcita":"Calcite","Yeso":"Gypsum","Halita":"Halite",
  "Moscovita":"Muscovite","Biotita (grupo)":"Biotite","Granito":"Granite",
  "Basalto":"Basalt","Fluorita":"Fluorite","Pirita":"Pyrite","Hematita":"Hematite",
  "Magnetita":"Magnetite","Ortoclasa":"Orthoclase","Olivino":"Olivine",
  "Talco":"Talc","Dolomita":"Dolomite"
 };
 const clean=value=>String(value||"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
 const key=name=>"oqthera:mineral-image:"+name.toLocaleLowerCase("es");
 const cacheRead=name=>{
  try{return JSON.parse(localStorage.getItem(key(name))||"null")}catch{return null}
 };
 const cacheWrite=(name,value)=>{
  try{localStorage.setItem(key(name),JSON.stringify(value))}catch{}
 };
 const pending=new Map();
 async function get(name){
  const saved=cacheRead(name);
  if(saved?.url)return saved;
  if(pending.has(name))return pending.get(name);
  const task=(async()=>{
   const searchName=englishNames[name]||name;
   const params=new URLSearchParams({
    action:"query",format:"json",origin:"*",generator:"search",
    gsrsearch:'filetype:bitmap "'+searchName+'" mineral specimen',
    gsrnamespace:"6",gsrlimit:"12",prop:"imageinfo",
    iiprop:"url|extmetadata",iiurlwidth:"1100"
   });
   const response=await fetch("https://commons.wikimedia.org/w/api.php?"+params.toString());
   if(!response.ok)throw new Error("Wikimedia Commons no disponible");
   const data=await response.json();
   const pages=Object.values(data.query?.pages||{});
   const terms=searchName.toLowerCase().split(/\s+/).filter(word=>word.length>3);
   const ranked=pages.filter(page=>page.imageinfo?.[0]?.thumburl).map(page=>{
    const title=(page.title||"").toLowerCase();
    const score=terms.reduce((sum,term)=>sum+(title.includes(term)?4:0),0)
      +(/specimen|crystal|mineral|rock/i.test(title)?1:0);
    return {page,score};
   }).sort((a,b)=>b.score-a.score);
   const match=ranked.find(item=>item.score>=4)?.page;
   if(!match)return null;
   const info=match.imageinfo[0];
   const result={url:info.thumburl,source:info.descriptionurl||("https://commons.wikimedia.org/wiki/"+encodeURIComponent(match.title.replace(/ /g,"_"))),title:match.title,license:clean(info.extmetadata?.LicenseShortName?.value||"Consultar licencia en archivo original")};
   cacheWrite(name,result);
   return result;
  })().finally(()=>pending.delete(name));
  pending.set(name,task);
  return task;
 }
 window.OQTHERA_MINERAL_IMAGES={get};
})();
