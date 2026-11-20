const element = id => document.getElementById(id);
const year = element('year'), modern = element('modern');
const map = L.map('map', {minZoom: 12, maxZoom: 19, zoomAnimation: false});
map.attributionControl.addAttribution(
  'Designed & Developed by ' +
  '<a href="https://www.linkedin.com/in/mohammad2001yazdani/" target="_blank" rel="noopener noreferrer">Mohammad Yazdani</a>' +
  ' | <a href="https://github.com/mohammadyazdaniz/ahvaz-map" target="_blank" rel="noopener noreferrer">Map Source</a>'
);
const params = new URLSearchParams(location.hash.slice(1));
if (Object.hasOwn(bounds, params.get('year'))) year.value = params.get('year');

const [lat, lon, zoom] = (params.get('view') || '').split(',').map(Number);
map.setView(lat > 31 && lat < 32 && lon > 48 && lon < 49 && zoom >= 12 && zoom <= 19 ? [lat, lon] : [31.3238, 48.6764], zoom >= 12 && zoom <= 19 ? zoom : 16);
function sentinelMosaic(year) {
  // The oldest available mosaic (2016) is published without a year suffix
  // and under a plain CC BY 4.0 license, unlike the later yearly layers.
  const id = year === 2016 ? 's2cloudless' : `s2cloudless-${year}`;
  const license = year === 2016
    ? '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>'
    : '<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>';
  return L.tileLayer(
    `https://tiles.maps.eox.at/wmts/1.0.0/${id}_3857/default/g/{z}/{y}/{x}.jpg`,
    {
      maxNativeZoom: 14,
      maxZoom: 19,
      attribution: `Sentinel-2 cloudless © <a href="https://maps.eox.at/">EOX</a> · Contains modified Copernicus Sentinel data ${year} · ${license}`
    }
  );
}

const layers = {
  sentinel2025: sentinelMosaic(2025),
  sentinel2016: sentinelMosaic(2016),
  streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
  satellite: L.tileLayer('https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=LudSN1LpSzzj7M6BuS03', {maxNativeZoom: 19, maxZoom: 19, attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
};
if (MAPBOX_PUBLIC_TOKEN.startsWith('pk.')) {
  layers.mapbox = L.tileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}{r}.jpg90?access_token={accessToken}', {
    accessToken: MAPBOX_PUBLIC_TOKEN,
    maxZoom: 19,
    attribution: '<a href="https://www.mapbox.com/"><img src="vendor/mapbox-logo.svg" width="88" alt="Mapbox"></a> © <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.maxar.com/">Maxar</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a id="mapbox-feedback" href="https://apps.mapbox.com/feedback/">Improve this map</a>'
  });
  modern.add(new Option('Mapbox Satellite', 'mapbox'), modern.options[1]);
  map.on('moveend layeradd layerremove', () => {
    const link = element('mapbox-feedback');
    const center = map.getCenter();
    if (link) link.href = 'https://apps.mapbox.com/feedback/#/' + [center.lng, center.lat, map.getZoom()].join('/');
  });
}
if (ARCGIS_API_KEY.trim()) {
  layers.esri = L.tileLayer('https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token={token}', {
    token: encodeURIComponent(ARCGIS_API_KEY.trim()),
    maxZoom: 19,
    attribution: '<a href="https://www.esri.com/">Powered by Esri</a> | Esri, Maxar, Earthstar Geographics, and the GIS User Community'
  });
  modern.add(new Option('Esri Satellite', 'esri'), modern.options[1]);
}
if (Object.hasOwn(layers, params.get('modern'))) modern.value = params.get('modern');
let current = layers[modern.value];
let historical;
function makeHistorical() {
 const y = year.value;
 return L.tileLayer('tiles-lossless/' + y + '/{z}/{x}/{y}.png', {bounds: bounds[y], minZoom: 12, maxNativeZoom: y === '1335' ? 18 : 17, maxZoom: 19, noWrap: true});
}
historical = makeHistorical().addTo(map);
const comparison = L.control.sideBySide(current, historical).addTo(map);
const divider = document.querySelector('.leaflet-sbs-range');
divider.step = '0.01';
const split = params.get('split');
if (split && Number.isFinite(Number(split))) {
  divider.value = String(Number(split) / 100);
  divider.dispatchEvent(new Event('input'));
}
divider.addEventListener('change', save);
divider.setAttribute('aria-label', 'جابجایی مرز نقشهٔ تاریخی و وضع موجود');
// leaflet-side-by-side only wires up mouse events when it thinks the device
// has no touch support; on touch-capable laptops it wires touch events
// instead, so dragging the divider with a mouse ends up panning the map
// instead. Explicitly handle the mouse case ourselves as a fallback.
divider.addEventListener('mousedown', () => map.dragging.disable());
window.addEventListener('mouseup', () => map.dragging.enable());
function save() {
 const c = map.getCenter();
 const p = new URLSearchParams({view: [c.lat.toFixed(5), c.lng.toFixed(5), map.getZoom()].join(','), year: year.value, modern: modern.value, split: Math.round(Number(divider.value) * 100)});
 history.replaceState(null, '', '#' + p);
}
function updateAccuracy() { element('accuracy').textContent = 'خطای مکانی RMS حدود ' + ({'1335':'۳۵','1960':'۸۸','1971':'۱۳۲'}[year.value]) + ' متر'; }
year.onchange = () => { map.removeLayer(historical); historical = makeHistorical().addTo(map); comparison.setRightLayers(historical); updateAccuracy(); save(); };
const statusMessage = element('status');
function selectModern(name, message = '') {
  map.removeLayer(current);
  modern.value = name;
  element('retry-layer').hidden = true;
  current = layers[name];
  current.addTo(map);
  comparison.setLeftLayers(current);
  element('maptiler-logo').hidden = name !== 'satellite';
  statusMessage.textContent = name === 'mapbox' ? 'این سرویس فعلا در دسترس نیست.' : message;
  save();
}
element('retry-layer').onclick = () => {
  element('retry-layer').hidden = true;
  statusMessage.textContent = 'در حال دریافت تصویر…';
  current.redraw();
};
modern.onchange = () => selectModern(modern.value);

for (const [name, layer] of Object.entries(layers)) {
  // Mapbox is flagged as unavailable the moment it's selected (see
  // selectModern), so there's no need to react to its tile events.
  if (name === 'mapbox') continue;
  let failed = 0;
  let loaded = 0;
  layer.on('loading', () => { failed = 0; loaded = 0; });
  layer.on('tileerror', () => { failed++; });
  layer.on('tileload', () => { loaded++; });
  layer.on('load', () => {
    if (current !== layer) return;
    if (failed && !loaded && name !== 'streets') {
      statusMessage.textContent = 'این تصویر بارگیری نشد. برای استفاده از این سرویس از VPN استفاده کنید.';
      element('retry-layer').hidden = false;
      return;
    }
    element('retry-layer').hidden = true;
    if (failed) {
      statusMessage.textContent = 'برخی قسمت‌های نقشه بارگیری نشدند.';
    } else if (statusMessage.textContent === 'برخی قسمت‌های نقشه بارگیری نشدند.') {
      statusMessage.textContent = '';
    }
  });
}
current.addTo(map);
element('extent').onclick = () => map.fitBounds(bounds[year.value], {padding: [32, 70]});
element('maptiler-logo').hidden = modern.value !== 'satellite';
if (modern.value === 'mapbox') statusMessage.textContent = 'این سرویس فعلا در دسترس نیست.';
map.on('moveend', save);
updateAccuracy();
