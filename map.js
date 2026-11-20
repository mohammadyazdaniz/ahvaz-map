const element = id => document.getElementById(id);
const year = element('year'), modern = element('modern');
const map = L.map('map', {minZoom: 12, maxZoom: 19, zoomAnimation: false});
map.attributionControl.addAttribution('Designed & Developed by <a href="https://www.linkedin.com/in/mohammad2001yazdani" target="_blank" rel="noopener noreferrer">Mohammad Yazdani</a>');
const params = new URLSearchParams(location.hash.slice(1));
if (Object.hasOwn(bounds, params.get('year'))) year.value = params.get('year');
if (['streets', 'satellite'].includes(params.get('modern'))) modern.value = params.get('modern');
const [lat, lon, zoom] = (params.get('view') || '').split(',').map(Number);
map.setView(lat > 31 && lat < 32 && lon > 48 && lon < 49 && zoom >= 12 && zoom <= 19 ? [lat, lon] : [31.3238, 48.6764], zoom >= 12 && zoom <= 19 ? zoom : 16);
const layers = {
  streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
  satellite: L.tileLayer('https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=LudSN1LpSzzj7M6BuS03', {maxNativeZoom: 19, maxZoom: 19, attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
};
let current = layers[modern.value].addTo(map);
let historical;
function makeHistorical() {
 const y = year.value;
 return L.tileLayer('tiles-lossless/' + y + '/{z}/{x}/{y}.png', {bounds: bounds[y], minZoom: 12, maxNativeZoom: y === '1335' ? 18 : 17, maxZoom: 19, noWrap: true});
}
historical = makeHistorical().addTo(map);
const comparison = L.control.sideBySide(current, historical).addTo(map);
document.querySelector('.leaflet-sbs-range').setAttribute('aria-label', 'جابجایی مرز نقشهٔ تاریخی و وضع موجود');
function save() {
 const c = map.getCenter();
 const p = new URLSearchParams({view: [c.lat.toFixed(5), c.lng.toFixed(5), map.getZoom()].join(','), year: year.value, modern: modern.value});
 history.replaceState(null, '', '#' + p);
}
function updateAccuracy() { element('accuracy').textContent = 'خطای مکانی RMS حدود ' + ({'1335':'۳۵','1960':'۸۸','1971':'۱۳۲'}[year.value]) + ' متر'; }
year.onchange = () => { map.removeLayer(historical); historical = makeHistorical().addTo(map); comparison.setRightLayers(historical); updateAccuracy(); save(); };
modern.onchange = () => { map.removeLayer(current); current = layers[modern.value].addTo(map); comparison.setLeftLayers(current); element('maptiler-logo').hidden = modern.value !== 'satellite'; save(); };
element('extent').onclick = () => map.fitBounds(bounds[year.value], {padding: [32, 70]});
element('maptiler-logo').hidden = modern.value !== 'satellite';
map.on('moveend', save);
updateAccuracy();
