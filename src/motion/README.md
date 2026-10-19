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

<MotionRuntime />;
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
 │ apply(frame)    │──▶ timeline → contadores → parallax →
 └─────────────────┘    cintas (reseteo si off) → reveals
        │
        ▼
   solo el primer frame: marca <html data-intro-controlled>
   (las piezas de la intro ya tienen su pose inline; ver "Decisiones")
```

Con la página quieta y la ventana cerrada, el frame es solo `tick`: no se lee ni se escribe layout.

La intro (`IntroClock`) arranca en el primer frame, al hidratar; con el movimiento apagado arranca terminada (en 1).

Fuera del loop:

- el `pointermove` actualiza el `PointerTracker` y llama a `onPointerMove` de cada efecto (el tilt reacciona ahí, en el momento);
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
| `core/PointerTracker.ts` | Mouse, `moved` y `fine` |
| `core/IntroClock.ts` | Progreso 0→1 de la intro: 1,6 s desde el primer frame del motor (al hidratar), o terminada desde el arranque con el movimiento apagado |
| `core/dom.ts` | `queryAll`, `readNumber` (semántica de `parseFloat(el.dataset.x)`), `scrollingElementOf` |
| `effects/*` | Un efecto por atributo (tabla de abajo) |
| `math/*` | Funciones puras con tests: `clamp01`, `easeInOutCubic`, ventana de scroll de los reveals, tabla de coreografías, formato de los contadores |
| `createMotionEngine.ts` | La fábrica: arma el motor con todos los efectos, **en orden** |
| `react/MotionRuntime.tsx` | Componente cliente que crea y arranca el motor al montar y lo destruye al desmontar. Renderiza `null` |

`core/`, `effects/` y `math/` no importan React.

---

## Atributos → efectos

| Atributo | Helper (`attributes.ts`) | Efecto | Qué hace |
|---|---|---|---|
| `data-reveal` (+ `-delay`, `-span`, `-intro`) | `reveal(variant, { delay, span, intro })` | `RevealEffect` | Aparición atada al scroll (entra por abajo, sale por arriba, vuelve si se sube). `word`: palabra del hero manejada por la intro |
| `data-parallax` (+ `-zoom`) | `parallax(factor, { introZoom })` | `ParallaxEffect` | Traslada la capa en Y según la posición de su padre; con `introZoom` arranca con 18% de zoom y lo suelta en la intro |
| `data-marquee` (+ `-speed`) · `data-marquee-paused` (en un ancestro) | `marquee({ direction, speed })` · `marqueePause(paused)` | `MarqueeEffect` | Cinta infinita; el scroll la acelera y la inclina. Se frena con hover, con el foco adentro o con la pausa de `MarqueePauseGroup`. Fuera del viewport (con margen) no avanza ni escribe |
| `data-timeline` | `timelineFill()` | `TimelineEffect` | Escala en Y el relleno hasta la línea del 60% del viewport |
| `data-count` (+ `-format`) | `counter(value, format)` | `CounterEffect` | Cuenta de 0 al valor al cruzar la mitad inferior del viewport |
| `data-tilt` · `data-tilt-zoom` | `tilt()` · `tiltZoom()` | `TiltEffect` | Inclinación 3D + brillo que siguen al cursor; zoom de la imagen de adentro |
| `data-magnet` | `magnet()` | `MagnetEffect` | Botón que se deja atraer por el cursor a menos de 110px |
| `data-bg-shift` · `data-bg-root` | `backgroundShift(color)` · `backgroundRoot()` | `BackgroundShiftEffect` | El fondo del root toma el color de la sección que pisa el centro del viewport |
| `data-scroll-progress` | `scrollProgress()` | `ScrollProgressEffect` | Barra de progreso de lectura |
| `data-nav-bar` · `data-nav-overlay` | `navBar()` · `navOverlay()` | `NavBarEffect` | El nav transparente sobre la foto de portada y sólido al scrollear (`--nav-solid`, pedido del cliente, octubre 2026) |
| `data-cover-pair` | `coverPair()` | `CoverPairEffect` | Cortina entre dos secciones: dónde se fija la primera (`--cover-top`) y cómo se achica y apaga mientras la segunda la tapa (pedido del cliente, octubre 2026) |
| `data-cursor` | `cursor()` | `CursorEffect` | Cursor montaña; con `pointer: fine` lo muestra y marca `<html data-cursor-active>` |

Atributos de estado que pone el motor en `<html>` (`MOTION_STATE`, no se esparcen en JSX): `data-cursor-active` (el cursor custom anda: `base.css` oculta el del sistema) y `data-intro-controlled` (el motor ya posó la intro: `design-system/intro.css` deja de sostenerla).

**Se sacaron por pedido del cliente (octubre 2026)**, con sus atributos, helpers, tokens y tests: el telón de entrada (`CurtainController`, `data-curtain`), el scroll horizontal de Próximos viajes (`HorizontalScrollEffect`, `data-hscroll`: hoy es un carrusel con scroll nativo que no pasa por el motor), las cards apilables del itinerario de Lolog (`StackEffect`, `data-stack`), el skew por velocidad de las cards de viaje (`SkewEffect`, `data-skew`) y el desplazamiento del texto calado del hero (`DriftEffect`, `data-drift`).

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

**Por qué un motor propio y no GSAP.** El diseño ya es un motor: fórmulas concretas atadas al scroll, con números afinados a ojo en Claude Design. Reescribirlo en GSAP (ScrollTrigger, timelines) daría _algo parecido_; portarlo da _lo mismo_. Además es un solo loop para toda la página: con GSAP serían decenas de triggers con sus propios listeners. Y son ~0 KB de dependencias.

**Por qué `WeakMap`.** El original pegaba estado a los nodos (`el._x`, `el._half`, `el._rvDone`, `el._txt`, `el._transform`). Con React eso es frágil (el nodo es de React, no nuestro) y no se tipa. Un `WeakMap` por efecto es privado, tipado, y se libera solo cuando React saca el nodo del DOM.

**Por qué lectura y escritura separadas.** Leer layout (`getBoundingClientRect`, `scrollHeight`) después de escribir un estilo obliga al navegador a recalcular estilos y layout en el momento. Intercalados, son un recálculo por elemento; separados, uno por frame. Por eso todos los efectos miden en `measure` y escriben en `apply`, y `measure` corre **antes** que `tick`: el cursor y las cintas escriben `transform` en cada frame, y en el original (que corría primero el `tick`, `dc.html:483-525`) la primera lectura de cada frame de scroll —el `scrollHeight` de la barra de progreso— pagaba ese recálculo (en una traza de 4 s de rueda a CPU 4×, 143 recálculos forzados, ~197 ms). La única lectura fuera de `measure` es la del imán, dentro de su `tick` y solo en los frames en que el mouse se movió (como en el original); por eso el imán es el primer efecto de la lista y lee antes de que el cursor y las cintas escriban.

**Por qué la firma del frame.** Con la página quieta, el frame termina antes de medir: el motor solo mueve el cursor y las cintas, que no leen layout. Un re-escaneo fuerza un frame completo aunque la firma no haya cambiado. La firma del original (`dc.html:514`) se parte en dos: la de layout (scroll, viewport, intro, intensidad) y la velocidad redondeada. Las dos hacen que el frame mida y escriba, como en el original, pero solo la de layout abre la ventana de asentamiento. (Desde que se sacó el skew de las cards, lo único que depende de la velocidad es el skew de las cintas, que se escribe en `tick`.)

**Por qué la ventana de asentamiento.** La firma dice si cambió el scroll, no si cambió el layout. Lo que miden los efectos puede seguir moviéndose después del último cambio de firma: un contador lee su `getBoundingClientRect()`, y si está adentro de un reveal (las stats de Lolog, en `reveal('scale')`), durante los 0,75–1 s de `REVEAL_TRANSITION` esa posición todavía está corrida. En el original, cuando la velocidad suavizada llega a 0 la firma se congela y el contador queda con lo último que midió: en la QA, parando el scroll en las stats de Lolog, "3 días / 2 noches" en vez de "4 / 3" (igual en el diseño que en el port). Por eso cada frame que cambia la firma de layout —scroll, viewport, intro o intensidad— (o re-escanea) abre una ventana de `SETTLE_MS` (1,1 s, más que el `clip-path` de 1 s, la transición más larga de los reveals) en la que se sigue midiendo y escribiendo con la firma quieta; recién después el motor vuelve a ahorrar frames. Un cambio de la velocidad redondeada mide y escribe ese frame, como en el original, pero **no** extiende la ventana: después de cada scroll la velocidad suavizada tarda ~0,6 s en llegar a 0 (más después de un salto), y si cada entero que cruza reabriera la ventana, serían ~1,7 s de frames completos por scroll (medido: 13–16 ms por callback a CPU 4× hasta ~2,25 s después de un salto, contra ~2 ms en reposo). No cambia ninguna fórmula ni ningún número: durante la ventana corre el mismo frame que el original corre con cualquier cambio de firma (por ejemplo, durante la intro con el scroll quieto), así que lo que lee la posición de otro elemento —contadores, parallax, timeline, fondo— termina en el valor que le corresponde al layout ya asentado. Los reveals se miden a sí mismos (con su transformación a medio camino, como en el original) y durante la ventana siguen ajustando su pose como en cualquier frame con la firma cambiando. La única consecuencia, invisible: después de cada scroll el motor lee layout 1,1 s más, lo mismo que cuesta 1,1 s de scroll. La intro también cambia la firma: en la carga, el motor mide en cada frame durante la intro (1,6 s) y la ventana que le sigue.

**Por qué hay una hoja de arranque de la intro.** Sin telón, entre el primer pintado y la hidratación la página se ve tal como la renderizó el servidor: sin estilos inline del motor, con el titular, la bajada y los botones del hero enteros. Al hidratar, el primer frame los pondría en su pose de arranque (ocultos) y la intro los volvería a mostrar: un parpadeo, más largo cuanto más tarde la hidratación. `design-system/intro.css` los sostiene en esa pose desde el primer pintado (las palabras del titular detrás de su máscara, los reveals con `intro` transparentes) mientras `<html>` no tenga `data-intro-controlled`, que el motor pone al terminar su primer frame, cuando cada pieza ya tiene la misma pose inline. La hoja solo aplica con `scripting: enabled` y sin `prefers-reduced-motion: reduce`: sin JS, o con el movimiento reducido, la página se ve entera de entrada. Si el JS no llega nunca (bloqueado, error de hidratación), a los 6 s una animación de la hoja las muestra igual (el mismo respaldo que tenía el telón). Con el nivel `apagado` (`NEXT_PUBLIC_MOTION_LEVEL`) la hoja las oculta hasta que hidrata la página y el motor las suelta sin animar: CSS no conoce el nivel.

**Por qué el carrusel de viajes no pasa por el motor.** Próximos viajes era una sección horizontal fijada que el motor trasladaba con el scroll vertical (`HorizontalScrollEffect`). El cliente la cambió por un carrusel con scroll nativo (`scroll-snap`, flechas y swipe): el navegador ya mueve el riel, sigue el foco del teclado y responde al dedo, así que el motor no tiene nada que hacer ahí. Con el efecto se fueron el seguimiento del foco con Tab, el reseteo del `scrollLeft` y los cortes por alto que necesitaba (todo eso lo resuelve el scroll nativo).

**Por qué reduced motion apaga todo.** Es lo que hace el diseño (`off()` mira la media query en cada frame): los reveals quedan en su lugar, el parallax y las cintas quietas, los contadores en su valor final y la intro arranca terminada (en 1). Kora eligió lo contrario por el ahorro de batería de Windows; acá se sigue al diseño, y la decisión vive en un solo lugar: `RESPECT_OS_REDUCED_MOTION` (la hoja de arranque de la intro, `design-system/intro.css`, mira `prefers-reduced-motion` por su cuenta: si se apaga esa constante, hay que sacarle esa condición).

**Por qué imprimir corre un frame apagado.** `design-system/print.css` pone todo lo animado en su pose final con `!important`, pero el texto de los contadores solo lo puede escribir el motor: un contador al que nunca se llegó scrolleando se imprimía en 0 ("$0.000", "0 km"). En `beforeprint` el motor marca `printing` (el movimiento cuenta como apagado, como con reduced motion) y corre un frame **sincrónico**: cada efecto escribe su pose final y los contadores su valor final. No espera al próximo `requestAnimationFrame` porque el navegador arma la vista de impresión apenas termina de despachar el evento. En `afterprint` desmarca y fuerza que el próximo frame mida y escriba aunque la firma no haya cambiado: todo vuelve al estado real del scroll. Para que esa vuelta funcione, los reseteos con el movimiento apagado (parallax, reveals) pasan por el `StyleWriter`: con una escritura directa, la caché se quedaba con la pose anterior y la misma pose recalculada no se volvía a escribir. Lo cubren los tests de "impresión" de `MotionEngine.test.ts`.

**Por qué el orden de la lista importa.** Todos los efectos pasan por todas las fases (las que no usan están vacías), así que el orden de registro es el orden de cada fase. La cinta, por ejemplo, avanza en `tick` pero su reseteo con el movimiento apagado va en `apply`, entre el parallax y los reveals, como en el original. El `tick` queda imanes → cursor → cintas (el original corría cursor → cintas → imanes): el imán, que lee rects, va primero para leer antes de que los otros dos escriban; como no tiene `measure` ni `apply`, eso no mueve el orden de las otras fases.

**Por qué las cintas fuera de pantalla se frenan.** El original movía las cuatro cintas en cada frame, se vieran o no: con la página quieta en Lolog (ninguna cinta a la vista), a CPU 4×, 925 ms/s de tareas del hilo principal contra 463 con las cintas ocultas, y ~1970 `UpdateLayer` por segundo. `MarqueeEffect.measure` guarda si cada riel está en el viewport con `MARQUEE.visibilityMarginPx` de margen, y `tick` saltea los que no: no avanzan ni escriben, y al volver a entrar siguen desde donde quedaron (el loop es continuo, no se nota). La visibilidad se mide en cada frame de layout, antes del `tick` del mismo frame.

**Por qué las cintas se pueden pausar.** Las cintas de testimonios (frases de hasta 24 palabras) y de la galería se mueven solas sin fin, y en el diseño solo se frenan con el mouse encima: con teclado o en pantalla táctil no había forma de pararlas (WCAG 2.2.2, nivel A). `MarqueePauseGroup` (organism `Marquee`, Client Component) pone un botón debajo de las cintas y marca su envoltorio con `data-marquee-paused`; la cinta también se frena con el foco adentro (`:focus-within`). Como el `MutationObserver` del motor no re-escanea por atributos, `MarqueeEffect` consulta el atributo con `closest()` en cada frame, igual que el hover. La cinta del hero, decorativa y con `aria-hidden`, no lleva botón. La velocidad sigue siendo por frame, como en el original.

---

## Diferencias con el original

- `rot` se llama `rotate`; los atributos tienen nombres legibles (`data-rv` → `data-reveal`, `data-tl` → `data-timeline`…).
- El zoom de intro del parallax se pide con `parallax(f, { introZoom: true })` (el original lo aplicaba a toda capa que fuera un `<img>`).
- No se portó el carrusel de testimonios (`tRef`, `goT`, `tDots`): el marcado usa una cinta. Tampoco el anillo del cursor (`data-cursor`, oculto siempre en el diseño) ni el `hot` del puntero, que solo lo usaba el anillo.
- No se portó el `case 'word'` del `switch` de reveals: era inalcanzable (las palabras salen antes).
- `dispose()` saca también el listener de `resize` (el original lo dejaba colgado), y el tilt endereza la card que tuviera inclinada.
- **Sin telón, ni scroll horizontal, ni stack, ni skew, ni drift** (pedido del cliente, octubre 2026; ver "Atributos → efectos"). La intro arranca en el primer frame del motor, al hidratar (en el diseño, 500 ms después de abrirse el telón), y con el movimiento apagado arranca terminada. Hasta que el motor toma el control, `design-system/intro.css` sostiene las piezas de la intro en su pose de arranque (ver "Decisiones").
- **Impresión**: `beforeprint` corre un frame sincrónico con el movimiento apagado y `afterprint` vuelve al estado real; el original no escuchaba la impresión y los contadores a los que no se había llegado se imprimían en 0 (ver "Decisiones").
- El cursor arranca oculto y el motor lo muestra (en el diseño arrancaba visible y el CSS ocultaba siempre el del sistema). La marca `data-cursor-active` de `<html>` vive lo que vive el nodo del cursor: si sale del DOM, se quita en el re-escaneo y vuelve el cursor del sistema.
- `motionOff` vale desde que se construye el motor (no hace falta `start()`): la media query de reduced motion se crea la primera vez que se pide.
- **Ventana de asentamiento** (`SETTLE_MS`): después del último cambio de scroll, viewport, intro o intensidad el motor sigue midiendo y escribiendo 1,1 s; un cambio de velocidad mide ese frame pero no la extiende. En el original los contadores dentro de un reveal podían quedar trabados en un valor intermedio (ver "Decisiones").
- **Lectura antes que `tick`**: el frame mide, después corre los `tick` y al final escribe; el original corría el cursor y las cintas antes de medir. Y el `tick` del imán va antes que el del cursor y las cintas. No cambia ningún valor, solo evita recálculos de estilo forzados (ver "Decisiones").
- **Cintas**: se frenan también con el foco adentro y con el botón de `MarqueePauseGroup` (`data-marquee-paused`), y las que están fuera del viewport no avanzan (ver "Decisiones").
- Con el movimiento apagado, el parallax vuelve a su lugar escribiendo por el `StyleWriter` (el original escribía `transform = ''` directo, `dc.html:558`): si no, la caché se quedaba con la pose anterior y, al volver el movimiento (después de imprimir, o al apagar reduced motion), esa misma pose recalculada no se escribía.
- `CounterEffect` compara el entero antes de formatear (el original comparaba el texto ya formateado) y formatea con un `Intl.NumberFormat` reutilizado en vez de `toLocaleString`: mismo texto, ~30 veces más barato.
