const element = id => document.getElementById(id);
const year = element("year"), split = element("split");
const map = L.map("map",{minZoom:12,maxZoom:19,zoomAnimation:false});

map.attributionControl.addAttribution(
  'Designed & Developed by ' +
  '<a href="https://github.com/mohammadyazdaniz" target="_blank" rel="noopener noreferrer">Mohammad Yazdani</a>' +
  ' | <a href="https://github.com/mohammadyazdaniz/ahvaz-map" target="_blank" rel="noopener noreferrer">Map Source</a>'
);

const params = new URLSearchParams(location.hash.slice(1));
if (Object.hasOwn(bounds,params.get("year"))) year.value=params.get("year");
const [lat,lon,zoom]=(params.get("view")||"").split(",").map(Number);
map.setView(lat>31 && lat<32 && lon>48 && lon<49 && zoom>=12 && zoom<=19 ? [lat,lon] : [31.3238,48.6764],zoom>=12 && zoom<=19 ? zoom : 16);
if(params.has("split")) split.value=params.get("split");
const streets=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
function script(url){return new Promise((resolve,reject)=>{const el=document.createElement("script");el.src=url;el.onload=resolve;el.onerror=reject;document.head.append(el);});}
async function satellite(){
 await script("https://unpkg.com/esri-leaflet@3.0.19/dist/esri-leaflet.js");
 await script("https://unpkg.com/esri-leaflet-vector@4.3.2/dist/esri-leaflet-vector.js");
 const sat=L.esri.Vector.vectorBasemapLayer("arcgis/imagery",{token:ARCGIS_API_KEY});
 sat.addTo(map);
 L.control.layers({"نقشهٔ معاصر":streets,"تصویر ماهواره‌ای":sat},null,{position:"bottomleft",collapsed:false}).addTo(map);
 map.removeLayer(streets);
 element("modern").textContent="تصویر ماهواره‌ای";
 map.on("baselayerchange",e=>element("modern").textContent=e.name);
}
if(ARCGIS_API_KEY)satellite().catch(()=>element("modern").textContent="نقشهٔ معاصر (بارگذاری ماهواره ناموفق)");
const pane=map.createPane("historical");
pane.style.zIndex=350;pane.style.pointerEvents="none";
let historyLayer;
function updateClip(){
 const size=map.getSize(),a=map.containerPointToLayerPoint([0,0]);
 pane.style.clip="rect("+a.y+"px,"+(a.x+size.x*split.value/100)+"px,"+(a.y+size.y)+"px,"+a.x+"px)";
 element("line").style.left=split.value+"%";
}
function save(){
 const c=map.getCenter(),p=new URLSearchParams({view:[c.lat.toFixed(5),c.lng.toFixed(5),map.getZoom()].join(","),year:year.value,split:split.value});
 window.history.replaceState(null,"","#"+p);
}
function selectYear(){
 const y=year.value;
 if(historyLayer)map.removeLayer(historyLayer);
 historyLayer=L.tileLayer("tiles-lossless/"+y+"/{z}/{x}/{y}.png",{pane:"historical",bounds:bounds[y],minZoom:12,maxNativeZoom:y==="1335"?18:17,maxZoom:19,noWrap:true}).addTo(map);
 element("accuracy").textContent="خطای مکانی RMS حدود "+({"1335":"۳۵","1960":"۸۸","1971":"۱۳۲"}[y])+" متر";
 updateClip();save();
}
map.on("viewreset move resize zoom",updateClip);map.on("moveend",save);
year.onchange=selectYear;split.oninput=()=>{updateClip();save();};
element("extent").onclick=()=>map.fitBounds(bounds[year.value],{padding:[32,70]});
selectYear();

