# `src/motion` — motor de animación

Port fiel, a TypeScript orientado a objetos, del motor que trae el diseño de Claude Design: el `<script type="text/x-dc">` al pie de `docs/design/hoy-estoy-ooh-landing.dc.html` (en los comentarios del código, `dc.html:NNN` es una línea de ese archivo).

**Mismas fórmulas, mismos números, mismo orden de operaciones.** Lo que cambia es la forma: una clase por efecto, estado por elemento en `WeakMap`, nombres de atributos legibles y los números en `design-system/tokens/motion.ts`.

---

## Cómo se usa

Los componentes **no importan el motor**: marcan elementos con los helpers de `attributes.ts` y siguen siendo Server Components.

```tsx
import { reveal, parallax } from '@/motion';

<h2 {...reveal('up', { delay: 1 })}>La montaña de verdad</h2>
<img {...parallax(0.4, { introZoom: true })} … />
```

Varios átomos y moléculas ya esparcen sus atributos: `WashedImage` (`parallax` y `zoomOnTilt` por props, con la capa y el overscan resueltos), `SurfaceCard` (`tilt()` en la card interna), `Marquee` (`marquee()` y el contenido duplicado), `MarqueePauseGroup` (`marqueePause()` y el botón que pausa las cintas de adentro), `SectionHeading` y `BulletList` (sus reveals). Para una foto con parallax se usa `<WashedImage parallax={{ factor: 0.4, overscanTop: '-10%', overscanHeight: '122%', introZoom: true }} … />` y no el helper a mano.

El motor se enciende una sola vez, en el layout:

```tsx
import { MotionRuntime } from '@/motion/react';

<MotionRuntime />
```

La intensidad sale de `NEXT_PUBLIC_MOTION_LEVEL` (`suave` · `equilibrado` · `exagerado` · `apagado`; por defecto `exagerado`).

---

## El frame

Un solo loop de `requestAnimationFrame` para toda la página:

```
requestAnimationFrame
        │
        ▼
 ┌─────────────────┐   solo si el DOM cambió (MutationObserver / resize)
 │ collect(doc)    │──▶ cada efecto re-escanea; el frame mide y escribe sí o sí
 └─────────────────┘
        │
        ▼
 ┌─────────────────┐   ScrollTracker · IntroClock · PointerTracker
 │ FrameState      │──▶ scrollY, velocidad suavizada, viewport, intro 0–1,
 └─────────────────┘    intensidad k, off, puntero
        │
        ▼
 ┌─────────────────┐   firma de layout `${scrollY}|${vw}|${vh}|${intro}|${k}`
 │ needsLayout     │──▶ + velocidad redondeada, aparte. ¿Toca layout?
 └─────────────────┘    · re-escaneo o cambio de la firma de layout → sí, y abre
        │                 la ventana de asentamiento (SETTLE_MS, 1,1 s)
        │               · cambio de velocidad → sí, sin extender la ventana
        │               · nada cambió → solo si la ventana sigue abierta
        ▼
 ┌─────────────────┐   si toca layout. LECTURA: getBoundingClientRect,
 │ measure(frame)  │──▶ scrollHeight… de todos los efectos, sin escribir nada
 └─────────────────┘
        │
        ▼
 ┌─────────────────┐   cada frame, haya scroll o no
 │ tick(frame)     │──▶ imanes (si el mouse se movió) → cursor → cintas
 └─────────────────┘    (las que están a la vista)
        │
        ▼
 ┌─────────────────┐   si toca layout. ESCRITURA: progreso → fondo →
 │ apply(frame)    │──▶ horizontal → stack → timeline → contadores → parallax →
 └─────────────────┘    drift → cintas (reseteo si off) → skew → reveals
```

Con la página quieta y la ventana cerrada, el frame es solo `tick`: no se lee ni se escribe layout.

Fuera del loop:

- el `pointermove` actualiza el `PointerTracker` y llama a `onPointerMove` de cada efecto (el tilt reacciona ahí, en el momento);
- el `focusin` de cada sección horizontal, si el foco llegó con Tab (un `keydown` en captura lo marca), lleva a la vista la card enfocada (ver "Decisiones");
- `beforeprint` corre un frame **sincrónico** con el movimiento apagado (cada efecto escribe su pose final y los contadores su valor final) y `afterprint` fuerza que el próximo frame vuelva al estado real del scroll (ver "Decisiones").

---

## Piezas

| Archivo | Responsabilidad |
|---|---|
| `attributes.ts` | Contrato marcado ↔ motor: nombres (`MOTION_ATTRIBUTES`), selectores (`MOTION_SELECTORS`), atributos de estado (`MOTION_STATE`) y helpers tipados. **No se toca desde el motor.** |
| `core/MotionEngine.ts` | El loop. Listeners (`pointermove` pasivo, `MutationObserver`, `resize`, `beforeprint`/`afterprint`), firma del frame y ventana de asentamiento, fases. `start()`/`dispose()` idempotentes |
| `core/MotionEffect.ts` | Clases base: `MotionEffect` (todas las fases vacías), `FrameEffect` (`tick` obligatorio), `ScrollEffect` (`apply` obligatorio, `measure` opcional), `PointerEffect` (`onPointerMove` obligatorio) |
| `core/FrameState.ts` | Tipos del estado de un frame (`FrameState`, `MotionSettings`, `PointerSnapshot`) |
| `core/StyleWriter.ts` | El `set()` del original: escribe un estilo solo si cambió. Caché en `WeakMap`, una instancia compartida por motor |
| `core/ScrollTracker.ts` | Scroll y velocidad suavizada (12%, zona muerta 0.05, tope ±60) |
| `core/PointerTracker.ts` | Mouse, `moved`, `fine` y la card que el tilt tiene inclinada (`tiltTarget`, compartida con el skew) |
| `core/IntroClock.ts` | Progreso 0→1 de la intro (1,6 s desde que se abre el telón + 500 ms) |
| `core/dom.ts` | `queryAll`, `readNumber` (semántica de `parseFloat(el.dataset.x)`), `scrollingElementOf` |
| `effects/*` | Un efecto por atributo (tabla de abajo) |
| `intro/CurtainController.ts` | Coreografía del telón (`lift()` del original), con la espera contada desde el First Contentful Paint. Avisa al motor cuándo arranca la intro. Con el movimiento apagado, o con la primera tecla, oculta el telón de una vez |
| `math/*` | Funciones puras con tests: `clamp01`, `easeInOutCubic`, ventana de scroll de los reveals, tabla de coreografías, formato de los contadores, avance del scroll horizontal (y su inverso, para seguir el foco) |
| `createMotionEngine.ts` | La fábrica: arma el motor con todos los efectos, **en orden** |
| `react/MotionRuntime.tsx` | Componente cliente que crea motor + telón al montar y los destruye al desmontar. Renderiza `null` |

`core/`, `effects/`, `intro/` y `math/` no importan React.

---

## Atributos → efectos

| Atributo | Helper (`attributes.ts`) | Efecto | Qué hace |
|---|---|---|---|
| `data-reveal` (+ `-delay`, `-span`, `-intro`) | `reveal(variant, { delay, span, intro })` | `RevealEffect` | Aparición atada al scroll (entra por abajo, sale por arriba, vuelve si se sube). `word`: palabra del hero manejada por la intro |
| `data-parallax` (+ `-zoom`) | `parallax(factor, { introZoom })` | `ParallaxEffect` | Traslada la capa en Y según la posición de su padre; con `introZoom` arranca con 18% de zoom y lo suelta en la intro |
| `data-drift` | `drift(factor)` | `DriftEffect` | Desplazamiento en X proporcional al scroll de la página |
| `data-marquee` (+ `-speed`) · `data-marquee-paused` (en un ancestro) | `marquee({ direction, speed })` · `marqueePause(paused)` | `MarqueeEffect` | Cinta infinita; el scroll la acelera y la inclina. Se frena con hover, con el foco adentro o con la pausa de `MarqueePauseGroup`. Fuera del viewport (con margen) no avanza ni escribe |
| `data-hscroll` · `-track` · `-bar` | `horizontalScroll.section()` · `.track()` · `.bar()` | `HorizontalScrollEffect` | Estira la sección y traslada el riel en X con el scroll vertical. Si un Tab lleva el foco a una card fuera de la vista, scrollea la página hasta mostrarla (`focusin`). Con la escena sin fijar (pantallas bajas) no estira ni traslada nada |
| `data-stack` | `stackCard()` | `StackEffect` | La card de adentro se achica, gira y oscurece cuando la siguiente se le sube. Si su envoltorio no está fijado (mobile, pantallas bajas), queda en su pose natural |
| `data-timeline` | `timelineFill()` | `TimelineEffect` | Escala en Y el relleno hasta la línea del 60% del viewport |
| `data-count` (+ `-format`) | `counter(value, format)` | `CounterEffect` | Cuenta de 0 al valor al cruzar la mitad inferior del viewport |
| `data-tilt` · `data-tilt-zoom` | `tilt()` · `tiltZoom()` | `TiltEffect` | Inclinación 3D + brillo que siguen al cursor; zoom de la imagen de adentro |
| `data-skew` | `skew()` | `SkewEffect` | Skew + giro según la velocidad del scroll (no toca la card inclinada por el tilt) |
| `data-magnet` | `magnet()` | `MagnetEffect` | Botón que se deja atraer por el cursor a menos de 110px |
| `data-bg-shift` · `data-bg-root` | `backgroundShift(color)` · `backgroundRoot()` | `BackgroundShiftEffect` | El fondo del root toma el color de la sección que pisa el centro del viewport |
| `data-scroll-progress` | `scrollProgress()` | `ScrollProgressEffect` | Barra de progreso de lectura |
| `data-cursor` | `cursor()` | `CursorEffect` | Cursor montaña; con `pointer: fine` lo muestra y marca `<html data-cursor-active>` |
| `data-curtain` · `-leaf` · `-logo` | `curtain.root()` · `.leaf(side)` · `.logo()` | `CurtainController` | Telón de entrada: logo, hojas, y arranque de la intro |

El root del fondo (`backgroundRoot()`) tiene que traer su propia transición (`background-color 1s var(--ease-in-out)` en el diseño): el motor solo cambia el color.

---

## Agregar un efecto

1. Una clase en `effects/` que extienda la base de su fase:
   - `FrameEffect` si corre cada frame (implementa `tick`);
   - `ScrollEffect` si depende del scroll (implementa `apply`, y `measure` si lee layout);
   - `PointerEffect` si reacciona al mouse (implementa `onPointerMove`).
2. `collect(doc)` busca sus elementos con `MOTION_SELECTORS`; el estado por elemento va en un `WeakMap`.
3. Respeta `frame.off`: con el movimiento apagado, el elemento queda en su pose natural. `apply` tiene que dar lo mismo si corre dos veces con la misma medida (durante la ventana de asentamiento corre varias veces seguidas con la firma quieta). Si engancha listeners, los suelta al re-escanear y en `dispose`.
4. Los números van a `design-system/tokens/motion.ts`, con de dónde salen.
5. El atributo y su helper van en `attributes.ts` (es un contrato: coordinarlo).
6. Se registra en `createMotionEngine.ts`, **en el lugar que le corresponde en el orden de escritura**. `MotionEngine` no se toca.

---

## Decisiones

**Por qué un motor propio y no GSAP.** El diseño ya es un motor: fórmulas concretas atadas al scroll, con números afinados a ojo en Claude Design. Reescribirlo en GSAP (ScrollTrigger, timelines) daría *algo parecido*; portarlo da *lo mismo*. Además es un solo loop para toda la página: con GSAP serían decenas de triggers con sus propios listeners. Y son ~0 KB de dependencias.

**Por qué `WeakMap`.** El original pegaba estado a los nodos (`el._x`, `el._half`, `el._rvDone`, `el._txt`, `el._transform`). Con React eso es frágil (el nodo es de React, no nuestro) y no se tipa. Un `WeakMap` por efecto es privado, tipado, y se libera solo cuando React saca el nodo del DOM.

**Por qué lectura y escritura separadas.** Leer layout (`getBoundingClientRect`, `scrollHeight`) después de escribir un estilo obliga al navegador a recalcular estilos y layout en el momento. Intercalados, son un recálculo por elemento; separados, uno por frame. Por eso todos los efectos miden en `measure` y escriben en `apply`, y `measure` corre **antes** que `tick`: el cursor y las cintas escriben `transform` en cada frame, y en el original (que corría primero el `tick`, `dc.html:483-525`) la primera lectura de cada frame de scroll —el `scrollHeight` de la barra de progreso— pagaba ese recálculo (en una traza de 4 s de rueda a CPU 4×, 143 recálculos forzados, ~197 ms). La única lectura fuera de `measure` es la del imán, dentro de su `tick` y solo en los frames en que el mouse se movió (como en el original); por eso el imán es el primer efecto de la lista y lee antes de que el cursor y las cintas escriban.

**Por qué la firma del frame.** Con la página quieta, el frame termina antes de medir: el motor solo mueve el cursor y las cintas, que no leen layout. Un re-escaneo fuerza un frame completo aunque la firma no haya cambiado. La firma del original (`dc.html:514`) se parte en dos: la de layout (scroll, viewport, intro, intensidad) y la velocidad redondeada. Las dos hacen que el frame mida y escriba (el skew de las cards depende de la velocidad), pero solo la de layout abre la ventana de asentamiento.

**Por qué la ventana de asentamiento.** La firma dice si cambió el scroll, no si cambió el layout. Lo que miden los efectos puede seguir moviéndose después del último cambio de firma: un contador lee su `getBoundingClientRect()`, y si está adentro de un reveal (las stats de Lolog, en `reveal('scale')`), durante los 0,75–1 s de `REVEAL_TRANSITION` esa posición todavía está corrida. En el original, cuando la velocidad suavizada llega a 0 la firma se congela y el contador queda con lo último que midió: en la QA, parando el scroll en las stats de Lolog, "3 días / 2 noches" en vez de "4 / 3" (igual en el diseño que en el port). Por eso cada frame que cambia la firma de layout —scroll, viewport, intro o intensidad— (o re-escanea) abre una ventana de `SETTLE_MS` (1,1 s, más que el `clip-path` de 1 s, la transición más larga de los reveals) en la que se sigue midiendo y escribiendo con la firma quieta; recién después el motor vuelve a ahorrar frames. Un cambio de la velocidad redondeada mide y escribe ese frame, como en el original, pero **no** extiende la ventana: después de cada scroll la velocidad suavizada tarda ~0,6 s en llegar a 0 (más después de un salto), y si cada entero que cruza reabriera la ventana, serían ~1,7 s de frames completos por scroll (medido: 13–16 ms por callback a CPU 4× hasta ~2,25 s después de un salto, contra ~2 ms en reposo). No cambia ninguna fórmula ni ningún número: durante la ventana corre el mismo frame que el original corre con cualquier cambio de firma (por ejemplo, durante la intro con el scroll quieto), así que lo que lee la posición de otro elemento —contadores, parallax, stack, timeline, fondo— termina en el valor que le corresponde al layout ya asentado. Los reveals se miden a sí mismos (con su transformación a medio camino, como en el original) y durante la ventana siguen ajustando su pose como en cualquier frame con la firma cambiando. Dos consecuencias chicas, las dos invisibles: el skew por velocidad de las cards termina en 0 exacto cuando la velocidad llega a la zona muerta dentro de la ventana, que es lo normal a 60 Hz (después de un salto muy largo puede quedar en centésimas de grado, como en el original, que quedaba con la última velocidad que todavía movía la firma, ~0,45 px/frame: `skewX(-0.10deg)` a intensidad 1,8), y después de cada scroll el motor lee layout 1,1 s más, lo mismo que cuesta 1,1 s de scroll.

**Por qué el scroll horizontal sigue al foco.** El riel de Próximos viajes se mueve con `transform` adentro de una escena sticky que recorta: tabular a una card que está fuera de pantalla no la trae, porque lo que la movería es el scroll vertical y el navegador no lo sabe. `HorizontalScrollEffect` escucha `focusin` en cada sección; si el foco cae en el riel, en el frame siguiente (después del "scroll a la vista" del navegador) y si el ítem enfocado no se ve entero, hace `window.scrollTo` al scroll que lo deja en el gutter: el inverso de la fórmula del efecto (`scrollTopToShowItem` en `math/horizontalScroll.ts`, con test). Suave, salvo con el movimiento apagado: ahí `instant`, no `auto`, porque `auto` toma el `scroll-behavior: smooth` del `<html>`, que `base.css` apaga con reduced motion pero no con el nivel `apagado`. Tres detalles:

- **Solo el foco que llega con Tab.** Un `keydown` en captura marca el Tab y la marca se apaga en la tarea siguiente (el navegador mueve el foco como acción por defecto del `keydown`, después de los listeners). Un clic o un toque también enfocan el link: mover la página en ese momento corría el botón debajo del puntero (el `mouseup` caía afuera y el clic no ocurría) o pisaba el salto al ancla, y volver a la pestaña re-enfoca el último link y hacía saltar la página.
- **El "ítem"** es el ancestro más grande del foco que entra en el ancho útil (el viewport menos los dos gutters): en Próximos viajes, el `<li>` de la card. Contra el viewport entero, con anchos de 1678 a ~1776 px (una MacBook Pro de 16" da 1728) entraba la lista entera y la última card quedaba 50 px afuera.
- **Con la escena sin fijar** (pantallas bajas, ver `TripsShowcase.module.css`), el riel es un contenedor de scroll común: la página no se mueve, y solo se termina de entrar en el riel, en X, la card que asoma a medias (Chrome desplaza el riel solo si el foco está entero fuera de la vista, y lo centra sin mirar la card).

Antes de calcular, el efecto deja en 0 el `scrollLeft` de los ancestros del riel (`resetHorizontalScroll`): el "scroll a la vista" del navegador corre en X todo lo que puede, y eso se sumaría a la traslación del motor. Con `overflow: clip` en la escena y `overflow-x: clip` en el `<html>` no queda nada que desplazar; queda para navegadores sin `clip` (cuando el `clip` estaba solo en el `<body>`, que llega al viewport como `hidden`, a 790 px de ancho el foco dejaba la página en `scrollX` 127).

**Por qué reduced motion apaga todo.** Es lo que hace el diseño (`off()` mira la media query en cada frame): los reveals quedan en su lugar, el parallax, el drift, el skew y las cintas quietas, los contadores en su valor final y el stack sin transformar. El telón va más allá que el diseño (que solo le saca la espera): se oculta de una vez al hidratar, sin el fundido del logo ni el giro 3D de las hojas a pantalla completa. Kora eligió lo contrario por el ahorro de batería de Windows; acá se sigue al diseño, y la decisión vive en un solo lugar: `RESPECT_OS_REDUCED_MOTION` (el respaldo CSS del telón, `transition: none` con `prefers-reduced-motion`, no lo sigue: si se apaga esa constante, hay que sacarlo).

**Por qué imprimir corre un frame apagado.** `design-system/print.css` pone todo lo animado en su pose final con `!important`, pero el texto de los contadores solo lo puede escribir el motor: un contador al que nunca se llegó scrolleando se imprimía en 0 ("$0.000", "0 km"). En `beforeprint` el motor marca `printing` (el movimiento cuenta como apagado, como con reduced motion) y corre un frame **sincrónico**: cada efecto escribe su pose final y los contadores su valor final. No espera al próximo `requestAnimationFrame` porque el navegador arma la vista de impresión apenas termina de despachar el evento. En `afterprint` desmarca y fuerza que el próximo frame mida y escriba aunque la firma no haya cambiado: todo vuelve al estado real del scroll. Para que esa vuelta funcione, los reseteos con el movimiento apagado (parallax, drift, skew) pasan por el `StyleWriter`: con una escritura directa, la caché se quedaba con la pose anterior y la misma pose recalculada no se volvía a escribir. Lo cubren los tests de "impresión" de `MotionEngine.test.ts`.

**Por qué el orden de la lista importa.** Todos los efectos pasan por todas las fases (las que no usan están vacías), así que el orden de registro es el orden de cada fase. La cinta, por ejemplo, avanza en `tick` pero su reseteo con el movimiento apagado va en `apply`, entre el drift y el skew, como en el original. El `tick` queda imanes → cursor → cintas (el original corría cursor → cintas → imanes): el imán, que lee rects, va primero para leer antes de que los otros dos escriban; como no tiene `measure` ni `apply`, eso no mueve el orden de las otras fases.

**Por qué las cintas fuera de pantalla se frenan.** El original movía las cuatro cintas en cada frame, se vieran o no: con la página quieta en Lolog (ninguna cinta a la vista), a CPU 4×, 925 ms/s de tareas del hilo principal contra 463 con las cintas ocultas, y ~1970 `UpdateLayer` por segundo. `MarqueeEffect.measure` guarda si cada riel está en el viewport con `MARQUEE.visibilityMarginPx` de margen, y `tick` saltea los que no: no avanzan ni escriben, y al volver a entrar siguen desde donde quedaron (el loop es continuo, no se nota). La visibilidad se mide en cada frame de layout, antes del `tick` del mismo frame.

**Por qué las cintas se pueden pausar.** Las cintas de testimonios (frases de hasta 24 palabras) y de la galería se mueven solas sin fin, y en el diseño solo se frenan con el mouse encima: con teclado o en pantalla táctil no había forma de pararlas (WCAG 2.2.2, nivel A). `MarqueePauseGroup` (organism `Marquee`, Client Component) pone un botón debajo de las cintas y marca su envoltorio con `data-marquee-paused`; la cinta también se frena con el foco adentro (`:focus-within`). Como el `MutationObserver` del motor no re-escanea por atributos, `MarqueeEffect` consulta el atributo con `closest()` en cada frame, igual que el hover. La cinta del hero, decorativa y con `aria-hidden`, no lleva botón. La velocidad sigue siendo por frame, como en el original.

---

## Diferencias con el original

- `rot` se llama `rotate`; los atributos tienen nombres legibles (`data-rv` → `data-reveal`, `data-tl` → `data-timeline`…).
- El zoom de intro del parallax se pide con `parallax(f, { introZoom: true })` (el original lo aplicaba a toda capa que fuera un `<img>`).
- No se portó el carrusel de testimonios (`tRef`, `goT`, `tDots`): el marcado usa una cinta. Tampoco el anillo del cursor (`data-cursor`, oculto siempre en el diseño) ni el `hot` del puntero, que solo lo usaba el anillo.
- No se portó el `case 'word'` del `switch` de reveals: era inalcanzable (las palabras salen antes).
- `dispose()` saca también el listener de `resize` (el original lo dejaba colgado), el telón cancela todos sus timers (el original solo el primero) y suelta su listener de `keydown`, y el tilt endereza la card que tuviera inclinada.
- **Telón**: la espera de 1,3 s se cuenta desde el First Contentful Paint y no desde que hidrata la página (en un celular lento el logo ya llevaba ~2 s a la vista); con el movimiento apagado se oculta de una vez, sin fundido ni giro; y la primera tecla mientras tapa lo oculta en el acto y arranca la intro (si no, el segundo Tab enfocaba la marca del nav escondida detrás).
- **Impresión**: `beforeprint` corre un frame sincrónico con el movimiento apagado y `afterprint` vuelve al estado real; el original no escuchaba la impresión y los contadores a los que no se había llegado se imprimían en 0 (ver "Decisiones").
- El cursor arranca oculto y el motor lo muestra (en el diseño arrancaba visible y el CSS ocultaba siempre el del sistema). La marca `data-cursor-active` de `<html>` vive lo que vive el nodo del cursor: si sale del DOM, se quita en el re-escaneo y vuelve el cursor del sistema.
- `motionOff` vale desde que se construye el motor (no hace falta `start()`): la media query de reduced motion se crea la primera vez que se pide.
- **Ventana de asentamiento** (`SETTLE_MS`): después del último cambio de scroll, viewport, intro o intensidad el motor sigue midiendo y escribiendo 1,1 s; un cambio de velocidad mide ese frame pero no la extiende. En el original los contadores dentro de un reveal podían quedar trabados en un valor intermedio (ver "Decisiones").
- **Lectura antes que `tick`**: el frame mide, después corre los `tick` y al final escribe; el original corría el cursor y las cintas antes de medir. Y el `tick` del imán va antes que el del cursor y las cintas. No cambia ningún valor, solo evita recálculos de estilo forzados (ver "Decisiones").
- **Cintas**: se frenan también con el foco adentro y con el botón de `MarqueePauseGroup` (`data-marquee-paused`), y las que están fuera del viewport no avanzan (ver "Decisiones").
- Con el movimiento apagado, el parallax, el drift y el skew vuelven a su lugar escribiendo por el `StyleWriter` (el original escribía `transform = ''` directo, `dc.html:558`): si no, la caché se quedaba con la pose anterior y, al volver el movimiento (después de imprimir, o al apagar reduced motion), esa misma pose recalculada no se escribía.
- `CounterEffect` compara el entero antes de formatear (el original comparaba el texto ya formateado) y formatea con un `Intl.NumberFormat` reutilizado en vez de `toLocaleString`: mismo texto, ~30 veces más barato.
- **El scroll horizontal sigue al foco del teclado** (`focusin` en cada `[data-hscroll]`, solo si llegó con Tab): el original no escuchaba el foco y una card enfocada fuera de la vista quedaba fuera de la vista (ver "Decisiones").
- **Escenas sin fijar**: el scroll horizontal y el stack le preguntan al CSS si su escena o su envoltorio es sticky (`position` computado). Si no lo es (Próximos viajes con menos de 500 px de alto; el itinerario de Lolog en ≤ 820 px de ancho o con menos de 600 px de alto), no estiran, no trasladan, no achican ni oscurecen nada. El corte vive en un solo lugar, el `@media` del módulo CSS.
