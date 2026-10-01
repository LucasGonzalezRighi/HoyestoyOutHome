# Dominio — Hoy Estoy Out Of Home

Las clases del negocio: viajes, precios, duraciones, el link de WhatsApp, las fotos, el cronograma, el itinerario, las stats, la checklist de servicios, los guías y los testimonios.

**TypeScript puro.** Sin React, sin DOM, sin Next. Solo importa de `src/domain` (y, si hiciera falta, tipos de `src/constants`). Por eso se testea con Vitest en `environment: 'node'` y se podría mover a otro proyecto tal cual.

Desde afuera se importa **solo del barrel**: `import { Trip, Price } from '@/domain'`.

## Qué modela cada clase

| Archivo | Qué es | Comportamiento / invariantes |
|---|---|---|
| `shared/Photo.ts` | Value object: ruta + alt + encuadre + dimensiones del archivo | `isDecorative` (alt `''`), `aspectRatio` → `"1080 / 1350"` (para `aspect-ratio` de CSS), `withAlt()`, `withPosition()` (conservan las dimensiones). Ruta con `/` o `http(s)://`; alt vacío o con texto, nunca solo espacios; ancho y alto enteros > 0 |
| `shared/Price.ts` | Precio por persona en pesos, o "a consultar" | `Price.of()` / `Price.onRequest()`, `label()` → `$690.000` / `Consultar`, `inThousands()` → `690` (contador del cierre), `Price.CURRENCY_SYMBOL` (`$`, lo usan `label()` y el precio del cierre). Monto entero > 0 |
| `shared/formatters.ts` | Formateo es-AR | `formatNumber`, `formatCount` (singular/plural con `Intl.PluralRules`), `formatKilometers`, `formatMeters` |
| `shared/invariants.ts` | Guardas de los constructores (interno, no se exporta) | Mensajes uniformes: qué dato falló y qué llegó |
| `contact/WhatsAppLink.ts` | El link de click-to-chat | `href(msg)` con `encodeURIComponent`, `chatHref()` sin mensaje, `withMessage()`. Teléfono de 8 a 15 dígitos |
| `trips/TripDuration.ts` | Días y noches | `label()` → `4 días / 3 noches`, `sentence()` → `4 días, 3 noches`. Enteros ≥ 0, noches ≤ días |
| `trips/Difficulty.ts` | `'baja' \| 'media' \| 'alta'` (tipo, no clase) | `difficultyLabel()` → `Dificultad media`, `isDifficulty()` |
| `trips/Trip.ts` | Entidad viaje (identidad = `slug`) | `distanceLabel()`, `difficultyLabel()`, `hasDetail`, `callToAction(whatsapp)` → ancla propia o chat de WhatsApp |
| `trips/TripCatalog.ts` | El catálogo ordenado | `all()`, `get(slug)` (tira si no está), `find(slug)`. Slugs únicos |
| `itinerary/ScheduleDay.ts` | Día del cronograma de Calle & Stepanek | `statLabels()` → `["4 km", "280 m desnivel", "2 hs de marcha"]`, `dayLabel()` |
| `itinerary/ItineraryStage.ts` | Etapa del itinerario de Lolog | `dayLabel()` → `Día 0`, `distanceLabel()` → `11,3 km`, `elevationLabel()` → `+570 m`. Distancia y desnivel van juntos o ninguno |
| `metrics/Metric.ts` | Stat con contador | `format()` → `+1.900 m`, `formattedValue()` → `1.900` (texto sin JS). Valor entero ≥ 0: el contador anima enteros |
| `services/ServiceChecklist.ts` | Qué incluye / qué llevar | `groups()` → cinco grupos planos en orden fijo. Ningún grupo vacío |
| `people/Guide.ts` | Guía del equipo | `instagramUrl`, `handleLabel` → `@usuario`. Usuario sin `@` |
| `people/Testimonial.ts` | Testimonio | `stars()` → `★★★★★`, `ratingLabel()` → `5 estrellas`, `quotedText()` → `“…”`. Rating entero 1–5 |

## Reglas

- **Clase cuando hay comportamiento o invariantes; tipo plano cuando es solo dato.** Un pilar de "Por qué viajar con nosotros" (número, título, bajada) es un tipo en `content/`, no una clase. `Difficulty` es un tipo porque lo único que hace es leerse.
- **Encapsulamiento.** Cada clase guarda sus datos en un único campo `private readonly props` (congelado con `Object.freeze`) y los expone con getters. Las listas se guardan como copias congeladas: nadie puede empujar un ítem desde afuera.
- **Invariantes en el constructor.** Si un dato no cumple, el constructor tira un `Error` con un mensaje en español que dice qué dato y qué valor llegó. No se "arregla" el dato en silencio: el contenido es estático y se prerenderiza, así que el error salta en el build o en los tests, nunca en el navegador de alguien.
- **Inmutabilidad.** No hay setters. Los `with…()` (`photo.withPosition()`, `whatsapp.withMessage()`) devuelven una instancia nueva y validada; la original no cambia.
- **Sin copys de UI.** El dominio solo tiene las palabras que necesita para formatear cantidades (`días`, `noches`, `km`, `desnivel`, `Día`, `Dificultad`, `Consultar`, `estrellas`). Los textos de botones y títulos viven en `content/`; para eso existen los discriminantes como `TripCallToAction.kind` (el contenido elige "Ver viaje" o "Consultar") o `ServiceGroup.kind`.

## Un solo idioma: es-AR

La landing está solo en español rioplatense, así que los formateos tienen el locale fijo (`es-AR`, en `shared/formatters.ts`). Tiene que ser `es-AR` y no `es`: el español genérico de CLDR no agrupa los números de cuatro cifras (`1900` en vez de `1.900`).

Si se suma otro idioma, los formateos dejan de ser funciones sueltas: cada clase que formatea recibe un **formateador por constructor** (una interfaz con `number()`, `count()`, `kilometers()`… y las palabras de unidad), y `content/` crea las instancias con el formateador del locale activo. La API pública de las clases (`label()`, `statLabels()`) no cambia.

## Frontera servidor / cliente

Las instancias se crean en `content/` y las leen los Server Components. **No cruzan a un Client Component** (`'use client'`): React solo serializa objetos planos, y una instancia de clase tira error. Cuando un Client Component necesita datos del dominio, se le pasa la versión plana (`checklist.groups()`, `photo.src`/`photo.alt`/`photo.position`, los `label()` ya calculados).

Relacionado: `Photo` es estructuralmente compatible con `{ src: string; alt: string; position?: string }`, pero sus datos son getters, así que se leen de a uno. Un spread (`{...photo}`) no los copia.

`Photo` conoce el ancho y el alto de su archivo porque hay marcos que tienen que medir lo que mediría la foto en flujo: en el diseño la foto de cada etapa de Lolog es una `<img>` con su alto natural, que estira la card; con `next/image` en modo `fill` ese alto se pierde, y la card lo recupera con `photo.aspectRatio`. Las medidas se cargan en `content/media.ts` y hay que actualizarlas si se reemplaza un archivo.

## Tests

Cada clase tiene su `*.test.ts` al lado. Se corren con:

```bash
npx vitest run src/domain
```

Qué cubren: los constructores que tiran (cada invariante), los formateos exactos que muestra el diseño (`$690.000`, `"1080 / 1350"`, `4 días / 3 noches`, `2 días / 1 noche`, `1.400 m desnivel`, `11,3 km`, `+1.900 m`), los dos destinos de `Trip.callToAction`, `TripCatalog.get` con un slug que no está, y el `encodeURIComponent` del mensaje de WhatsApp.

`trips/Trip.fixture.ts` es una fábrica de viajes válidos para los tests (`buildTrip({ slug: 'lolog' })`): cada test pisa solo lo que prueba. No se usa fuera de los tests.
