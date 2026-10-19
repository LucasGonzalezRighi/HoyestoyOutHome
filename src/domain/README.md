# Dominio — Hoy Estoy Out Of Home

Las clases del negocio: viajes, precios, duraciones, el link de WhatsApp, las fotos, el cronograma de cada viaje, el calendario de salidas, las stats, la checklist de servicios, los guías y los testimonios.

**TypeScript puro.** Sin React, sin DOM, sin Next. Solo importa de `src/domain` (y, si hiciera falta, tipos de `src/constants`). Por eso se testea con Vitest en `environment: 'node'` y se podría mover a otro proyecto tal cual.

Desde afuera se importa **solo del barrel**: `import { Trip, Price } from '@/domain'`.

## Qué modela cada clase

| Archivo | Qué es | Comportamiento / invariantes |
|---|---|---|
| `shared/Photo.ts` | Value object: ruta + alt + encuadre + dimensiones del archivo | `isDecorative` (alt `''`), `aspectRatio` → `"1080 / 1350"` (para `aspect-ratio` de CSS), `withAlt()`, `withPosition()` (conservan las dimensiones). Ruta con `/` o `http(s)://`; alt vacío o con texto, nunca solo espacios; ancho y alto enteros > 0 |
| `shared/Price.ts` | Precio por persona en pesos, o "a consultar" | `Price.of()` / `Price.onRequest()`, `label()` → `$690.000` / `Consultar`, `inThousands()` → `690` (contador del precio), `Price.CURRENCY_SYMBOL` (`$`, lo usan `label()` y el precio grande). Monto entero > 0 |
| `shared/formatters.ts` | Formateo es-AR | `formatNumber`, `formatCount` (singular/plural con `Intl.PluralRules`), `formatKilometers`, `formatMeters`. Exporta `LOCALE` solo para el resto del dominio |
| `shared/CalendarDate.ts` | Fecha de calendario sin hora ni zona (interno, no se exporta) | `CalendarDate.parse('2026-11-13')`, `addDays()`, `compare()`, `monthKey()` → `2026-11`, `dayMonthLabel()` → `13 de noviembre`, `shortMonthLabel()` → `nov`, `monthYearLabel()` → `Noviembre 2026`, `rangeLabelTo(end)`. Todo en UTC. Tira con formatos que no son `AAAA-MM-DD` o días que no existen (`2026-02-30`) |
| `shared/invariants.ts` | Guardas de los constructores (interno, no se exporta) | Mensajes uniformes: qué dato falló y qué llegó |
| `contact/WhatsAppLink.ts` | El link de click-to-chat | `href(msg)` con `encodeURIComponent`, `chatHref()` sin mensaje, `withMessage()`. Teléfono de 8 a 15 dígitos |
| `trips/TripDuration.ts` | Días y noches | `label()` → `4 días / 3 noches`, `sentence()` → `4 días, 3 noches`. Enteros ≥ 0, noches ≤ días |
| `trips/Difficulty.ts` | `'baja' \| 'media' \| 'alta'` (tipo, no clase) | `difficultyLabel()` → `Dificultad media`, `isDifficulty()` |
| `trips/Trip.ts` | Entidad viaje (identidad = `slug`, que es también el tramo de su URL) | `distanceLabel()` → `24 km`, `difficultyLabel()`, `summitLabel()` → `Cumbre 4.290 m` o `undefined`. Textos con contenido, distancia > 0, cumbre entera > 0 si está |
| `trips/TripCatalog.ts` | El catálogo ordenado | `all()`, `get(slug)` (tira si no está), `find(slug)`. Slugs únicos |
| `itinerary/ItineraryDay.ts` | Un día del cronograma de un viaje (el ítem de su línea de tiempo) | `markerLabel()` → `1` (el círculo), `dayLabel()` → `Día 0`, `hasPhoto`, `hasStats`, `statLabels()` → `["4 km", "280 m desnivel", "2 hs de marcha"]`, `stats()` → `[{ kind: 'distance', value: '11,3 km' }, { kind: 'elevationGain', value: '+570 m' }]`, y sueltos `distanceLabel()`, `elevationGainLabel()`, `walkingTimeLabel()` (`undefined` si falta). Día entero ≥ 0, título con contenido, al menos un párrafo, stats > 0 e independientes |
| `calendar/Departure.ts` | Una salida programada de un viaje | `startsOn` / `endsOn` ISO (el fin sale de `trip.duration.days`, inclusivo), `id` → `calle-stepanek-2026-11-13`, `rangeLabel()` → `13 al 16 de noviembre`, `startLabel()` → `13 de noviembre`, `marker()` → `{ day: '13', month: 'nov' }`, `monthLabel()` → `Noviembre 2026`, `monthKey()`, `compareTo()`. Fecha `AAAA-MM-DD` que exista; el viaje dura al menos un día |
| `calendar/DepartureSchedule.ts` | El calendario de salidas | `all()` en orden cronológico, `forTrip(slug)`, `byMonth()` → `[{ key: '2026-11', label: 'Noviembre 2026', departures }]`. Sin dos salidas del mismo viaje el mismo día |
| `metrics/Metric.ts` | Stat con contador | `format()` → `+1.900 m`, `formattedValue()` → `1.900` (texto sin JS). Valor entero ≥ 0: el contador anima enteros |
| `services/ServiceChecklist.ts` | Qué incluye / qué llevar | `groups()` → cinco grupos planos en orden fijo. Ningún grupo vacío |
| `people/Guide.ts` | Guía del equipo | `instagramUrl`, `handleLabel` → `@usuario`. Usuario sin `@` |
| `people/Testimonial.ts` | Testimonio | `stars()` → `★★★★★`, `ratingLabel()` → `5 estrellas`, `quotedText()` → `“…”`. Rating entero 1–5 |

## Reglas

- **Clase cuando hay comportamiento o invariantes; tipo plano cuando es solo dato.** Un pilar de "Por qué viajar con nosotros" (título, bajada) es un tipo en `content/`, no una clase. `Difficulty` es un tipo porque lo único que hace es leerse.
- **Encapsulamiento.** Cada clase guarda sus datos en un único campo `private readonly props` (congelado con `Object.freeze`) y los expone con getters. Las listas se guardan como copias congeladas: nadie puede empujar un ítem desde afuera.
- **Invariantes en el constructor.** Si un dato no cumple, el constructor tira un `Error` con un mensaje en español que dice qué dato y qué valor llegó. No se "arregla" el dato en silencio: el contenido es estático y se prerenderiza, así que el error salta en el build o en los tests, nunca en el navegador de alguien.
- **Inmutabilidad.** No hay setters. Los `with…()` (`photo.withPosition()`, `whatsapp.withMessage()`) devuelven una instancia nueva y validada; la original no cambia.
- **Sin rutas.** El dominio no sabe de URLs del sitio: la página de un viaje es `tripPath(trip.slug)` (`constants/routes.ts`). Todos los viajes tienen página propia.
- **Sin copys de UI.** El dominio solo tiene las palabras que necesita para formatear cantidades y fechas (`días`, `noches`, `km`, `desnivel`, `de marcha`, `Día`, `Dificultad`, `Cumbre`, `Consultar`, `estrellas`, el `al` de los rangos y los meses, que salen de `Intl`). Los rótulos, textos de botones y títulos viven en `content/`; para eso existen los discriminantes como `ItineraryStat.kind` (el contenido elige "Distancia:" o "Desnivel:") o `ServiceGroup.kind`.

## Un solo idioma: es-AR

La landing está solo en español rioplatense, así que los formateos tienen el locale fijo (`es-AR`, `LOCALE` en `shared/formatters.ts`; las fechas de `CalendarDate` usan el mismo). Tiene que ser `es-AR` y no `es`: el español genérico de CLDR no agrupa los números de cuatro cifras (`1900` en vez de `1.900`).

Si se suma otro idioma, los formateos dejan de ser funciones sueltas: cada clase que formatea recibe un **formateador por constructor** (una interfaz con `number()`, `count()`, `kilometers()`, `dateRange()`… y las palabras de unidad), y `content/` crea las instancias con el formateador del locale activo. La API pública de las clases (`label()`, `statLabels()`, `rangeLabel()`) no cambia.

## Fechas sin zona horaria

Las salidas son fechas de calendario (`'2026-11-13'`), no instantes. `CalendarDate` guarda la medianoche UTC de ese día y hace la aritmética y el formato en UTC (`Intl.DateTimeFormat` con `timeZone: 'UTC'`), así la salida del 13 dice "13" en el servidor que prerenderiza y en un navegador de cualquier huso. Nunca se usan los métodos locales de `Date` (`getDate()`, `new Date(2026, 10, 13)`): en Buenos Aires, la medianoche UTC del 13 todavía es el 12. Los tests de `calendar/Departure.test.ts` lo controlan con `TZ=America/Argentina/Buenos_Aires`, `UTC` y los dos extremos (UTC+14 y UTC−11).

## Frontera servidor / cliente

Las instancias se crean en `content/` y las leen los Server Components. **No cruzan a un Client Component** (`'use client'`): React solo serializa objetos planos, y una instancia de clase tira error. Cuando un Client Component necesita datos del dominio, se le pasa la versión plana (`checklist.groups()`, `day.stats()`, `departure.marker()`, `photo.src`/`photo.alt`/`photo.position`, los `label()` ya calculados).

Relacionado: `Photo` es estructuralmente compatible con `{ src: string; alt: string; position?: string }`, pero sus datos son getters, así que se leen de a uno. Un spread (`{...photo}`) no los copia.

`Photo` conoce el ancho y el alto de su archivo porque hay marcos que tienen que medir lo que mediría la foto en flujo: en el diseño la foto de cada día de Lolog es una `<img>` con su alto natural, que estira la card; con `next/image` en modo `fill` ese alto se pierde, y la card lo recupera con `photo.aspectRatio`. Las medidas se cargan en `content/media.ts` y hay que actualizarlas si se reemplaza un archivo.

## Tests

Cada clase tiene su `*.test.ts` al lado. Se corren con:

```bash
npx vitest run src/domain
```

Qué cubren: los constructores que tiran (cada invariante), los formateos exactos que muestra el sitio (`$690.000`, `"1080 / 1350"`, `4 días / 3 noches`, `2 días / 1 noche`, `1.400 m desnivel`, `11,3 km`, `+570 m`, `2 hs de marcha`, `Cumbre 4.290 m`, `+1.900 m`), los rangos de fechas (mismo mes, cruce de mes, cruce de año, 29 de febrero), que las fechas no se corran con otro `TZ`, el orden y los grupos por mes del calendario, `TripCatalog.get` con un slug que no está, y el `encodeURIComponent` del mensaje de WhatsApp.

`trips/Trip.fixture.ts` es una fábrica de viajes válidos para los tests (`buildTrip({ slug: 'lago-lolog-laguna-verde' })`): cada test pisa solo lo que prueba. No se usa fuera de los tests.
