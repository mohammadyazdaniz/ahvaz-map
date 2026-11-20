# نقشه تاریخی اهواز | Ahvaz Historical Map

**نمایش زنده / Live demo:** https://mohammadyazdaniz.github.io/ahvaz-map/

نقشه‌ای تعاملی برای مشاهده و مقایسهٔ تحول تاریخی شهر اهواز؛ عکس هوایی سال ۱۳۳۵ و نقشه‌های ۱۹۶۰ و ۱۹۷۱ میلادی در کنار نقشه و تصاویر ماهواره‌ای امروزی شهر.

An interactive side-by-side map comparing historical imagery of Ahvaz, Iran — a 1956 (1335 SH) aerial photo and 1960/1971 maps — against present-day satellite imagery and street maps.

## ویژگی‌ها | Features

- مقایسهٔ نقشهٔ تاریخی و وضع موجود با نواری قابل‌کشیدن (Side-by-side historical/present comparison with a draggable divider)
- چند منبع تصویر برای وضع موجود: MapTiler، Sentinel-2 (2025 و 2016)، OpenStreetMap، و در صورت وجود کلید API، Mapbox و Esri
- قابلیت اشتراک‌گذاری نما از طریق URL (مختصات، زوم، سال تاریخی، لایهٔ وضع موجود و درصد تقسیم)
- Multiple present-day basemaps: MapTiler Satellite, Sentinel-2 cloudless (2025 and 2016), OpenStreetMap, and (with an API key) Mapbox and Esri satellite imagery
- Shareable view state via URL hash (coordinates, zoom, historical year, basemap, and split position)

## نحوهٔ استفاده از URL | URL parameters

آدرس نقشه وضعیت نما را در بخش hash نگه می‌دارد، برای مثال:

```
#view=31.33320,48.68321,16&year=1335&modern=esri&split=49
```

| پارامتر | توضیح |
| --- | --- |
| `view` | `lat,lng,zoom` |
| `year` | سال نقشهٔ تاریخی: `1335`, `1960`, `1971` |
| `modern` | لایهٔ وضع موجود: `satellite`, `sentinel2025`, `sentinel2016`, `streets`, و در صورت پیکربندی `mapbox`, `esri` |
| `split` | درصد موقعیت نوار تقسیم (۰ تا ۱۰۰) |

## راه‌اندازی محلی | Local development

این یک سایت استاتیک است و نیازی به مرحلهٔ build ندارد:

```sh
cd ahvaz-web
python -m http.server 8000
```

سپس به آدرس `http://localhost:8000` مراجعه کنید. برای فعال‌سازی لایه‌های Mapbox و Esri، کلیدهای مربوطه را در `config.js` قرار دهید.

This is a static site with no build step — just serve the `ahvaz-web` folder and open it in a browser. Set `MAPBOX_PUBLIC_TOKEN` and/or `ARCGIS_API_KEY` in `config.js` to enable those basemaps.

## منابع و حق نشر داده‌ها | Data sources & attribution

- عکس هوایی ۱۳۳۵ و نقشه‌های تاریخی اهواز (۱۹۶۰ و ۱۹۷۱) — جورف‌رفرنس‌شده توسط این پروژه
- [MapTiler](https://www.maptiler.com/) satellite imagery
- [Sentinel-2 cloudless](https://s2maps.eu) by [EOX IT Services GmbH](https://maps.eox.at/)
- [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- [Mapbox](https://www.mapbox.com/) satellite imagery (when configured)
- [Esri](https://www.esri.com/), Maxar, Earthstar Geographics, and the GIS User Community (when configured)
- Built with [Leaflet](https://leafletjs.com/) and [Leaflet.SideBySide](https://github.com/digidem/leaflet-side-by-side)

## نویسنده | Author

ساخته‌شده توسط [Mohammad Yazdani](https://www.linkedin.com/in/mohammad2001yazdani/)

Developed by [Mohammad Yazdani](https://www.linkedin.com/in/mohammad2001yazdani/)
