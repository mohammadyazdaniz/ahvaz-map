const element = id => document.getElementById(id);
const year = element('year'), modern = element('modern');
const map = L.map('map', {minZoom: 12, maxZoom: 19, zoomAnimation: false});
map.attributionControl.addAttribution(
  'Designed & Developed by ' +
  '<a href="https://github.com/mohammadyazdaniz" target="_blank" rel="noopener noreferrer">Mohammad Yazdani</a>' +
  ' | <a href="https://github.com/mohammadyazdaniz/ahvaz-map" target="_blank" rel="noopener noreferrer">Map Source</a>'
);
const params = new URLSearchParams(location.hash.slice(1));
if (Object.hasOwn(bounds, params.get('year'))) year.value = params.get('year');

const [lat, lon, zoom] = (params.get('view') || '').split(',').map(Number);
map.setView(lat > 31 && lat < 32 && lon > 48 && lon < 49 && zoom >= 12 && zoom <= 19 ? [lat, lon] : [31.3238, 48.6764], zoom >= 12 && zoom <= 19 ? zoom : 16);
function sentinelMosaic(year) {
  return L.tileLayer(
    `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-${year}_3857/default/g/{z}/{y}/{x}.jpg`,
    {
      maxNativeZoom: 14,
      maxZoom: 19,
      attribution: `Sentinel-2 cloudless © <a href="https://maps.eox.at/">EOX</a> · Contains modified Copernicus Sentinel data ${year} · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>`
    }
  );
}

const layers = {
  sentinel2025: sentinelMosaic(2025),
  sentinel2024: sentinelMosaic(2024),
  streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
  satellite: L.tileLayer('https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=LudSN1LpSzzj7M6BuS03', {maxNativeZoom: 19, maxZoom: 19, attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
};
if (MAPBOX_PUBLIC_TOKEN.startsWith('pk.')) {
  layers.mapbox = L.tileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}{r}.jpg90?access_token={accessToken}', {
    accessToken: MAPBOX_PUBLIC_TOKEN,
    maxZoom: 19,
    attribution: '<a href="https://www.mapbox.com/"><img src="vendor/mapbox-logo.svg" width="88" alt="Mapbox"></a> © <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.maxar.com/">Maxar</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a id="mapbox-feedback" href="https://apps.mapbox.com/feedback/">Improve this map</a>'
  });
  modern.add(new Option('ماهواره‌ای Mapbox', 'mapbox'), modern.options[1]);
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
  modern.add(new Option('تصویر ماهواره‌ای اِزری', 'esri'), modern.options[1]);
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
  statusMessage.textContent = message;
  save();
}
element('retry-layer').onclick = () => {
  element('retry-layer').hidden = true;
  statusMessage.textContent = 'در حال دریافت تصویر…';
  current.redraw();
};
modern.onchange = () => selectModern(modern.value);

for (const [name, layer] of Object.entries(layers)) {
  let failed = 0;
  let loaded = 0;
  layer.on('loading', () => { failed = 0; loaded = 0; });
  layer.on('tileerror', () => { failed++; });
  layer.on('tileload', () => { loaded++; });
  layer.on('load', () => {
    if (current !== layer) return;
    if (failed && name === 'mapbox' && !loaded) {
      statusMessage.textContent = 'تصویر مپ‌باکس دریافت نشد. کمی بعد دوباره تلاش کنید یا لایهٔ دیگری انتخاب کنید.';
      element('retry-layer').hidden = false;
      return;
    }
    element('retry-layer').hidden = true;
    if (failed && name !== 'streets' && !loaded) {
      selectModern('streets', 'تصویر ماهواره‌ای بارگیری نشد. نقشهٔ معابر انتخاب شد.');
    } else if (failed) {
      statusMessage.textContent = 'برخی قسمت‌های نقشه بارگیری نشدند.';
    } else if (name === 'mapbox' || statusMessage.textContent === 'برخی قسمت‌های نقشه بارگیری نشدند.') {
      statusMessage.textContent = '';
    }
  });
}
current.addTo(map);
element('extent').onclick = () => map.fitBounds(bounds[year.value], {padding: [32, 70]});
element('maptiler-logo').hidden = modern.value !== 'satellite';
map.on('moveend', save);
updateAccuracy();
