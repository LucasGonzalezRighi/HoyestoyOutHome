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

Varios átomos y moléculas ya esparcen sus atributos: `WashedImage` (`parallax` y `zoomOnTilt` por props, con la capa y el overscan resueltos), `SurfaceCard` (`tilt()` en la card interna), `Marquee` (`marquee()` y el contenido duplicado), `SectionHeading` y `BulletList` (sus reveals). Para una foto con parallax se usa `<WashedImage parallax={{ factor: 0.4, overscanTop: '-10%', overscanHeight: '122%', introZoom: true }} … />` y no el helper a mano.

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
 │ collect(doc)    │──▶ cada efecto re-escanea sus elementos; fuerza el paso 4
 └─────────────────┘
        │
        ▼
 ┌─────────────────┐   ScrollTracker · IntroClock · PointerTracker
 │ FrameState      │──▶ scrollY, velocidad suavizada, viewport, intro 0–1,
 └─────────────────┘    intensidad k, off, puntero
        │
        ▼
 ┌─────────────────┐   cada frame, haya scroll o no
 │ tick(frame)     │──▶ cursor → cintas → imanes (si el mouse se movió)
 └─────────────────┘
        │
        ▼
 ┌─────────────────┐   `${scrollY}|${vw}|${vh}|${intro}|${k}|${round(vel)}`
 │ firma           │──▶ igual a la anterior, sin re-escaneo y pasados SETTLE_MS
 └─────────────────┘    (1,1 s) del último cambio → fin del frame
        │               (la página quieta no lee ni escribe layout)
        │ cambió, o sigue abierta la ventana de asentamiento
        ▼
 ┌─────────────────┐   LECTURA: getBoundingClientRect, scrollWidth…
 │ measure(frame)  │──▶ todos los efectos, sin escribir nada
 └─────────────────┘
        │
        ▼
 ┌─────────────────┐   ESCRITURA: progreso → fondo → horizontal → stack →
 │ apply(frame)    │──▶ timeline → contadores → parallax → drift → cintas
 └─────────────────┘    (reseteo si off) → skew → reveals
```

Fuera del loop: el `pointermove` actualiza el `PointerTracker` y llama a `onPointerMove` de cada efecto (el tilt reacciona ahí, en el momento), y el `focusin` de cada sección horizontal lleva a la vista la card que recibe el foco del teclado (ver "Decisiones").

---

## Piezas

| Archivo | Responsabilidad |
|---|---|
| `attributes.ts` | Contrato marcado ↔ motor: nombres (`MOTION_ATTRIBUTES`), selectores (`MOTION_SELECTORS`), atributos de estado (`MOTION_STATE`) y helpers tipados. **No se toca desde el motor.** |
| `core/MotionEngine.ts` | El loop. Listeners (`pointermove` pasivo, `MutationObserver`, `resize`), firma del frame y ventana de asentamiento, fases. `start()`/`dispose()` idempotentes |
| `core/MotionEffect.ts` | Clases base: `MotionEffect` (todas las fases vacías), `FrameEffect` (`tick` obligatorio), `ScrollEffect` (`apply` obligatorio, `measure` opcional), `PointerEffect` (`onPointerMove` obligatorio) |
| `core/FrameState.ts` | Tipos del estado de un frame (`FrameState`, `MotionSettings`, `PointerSnapshot`) |
| `core/StyleWriter.ts` | El `set()` del original: escribe un estilo solo si cambió. Caché en `WeakMap`, una instancia compartida por motor |
| `core/ScrollTracker.ts` | Scroll y velocidad suavizada (12%, zona muerta 0.05, tope ±60) |
| `core/PointerTracker.ts` | Mouse, `moved`, `fine` y la card que el tilt tiene inclinada (`tiltTarget`, compartida con el skew) |
| `core/IntroClock.ts` | Progreso 0→1 de la intro (1,6 s desde que se abre el telón + 500 ms) |
| `core/dom.ts` | `queryAll`, `readNumber` (semántica de `parseFloat(el.dataset.x)`), `scrollingElementOf` |
| `effects/*` | Un efecto por atributo (tabla de abajo) |
| `intro/CurtainController.ts` | Coreografía del telón (`lift()` del original). Avisa al motor cuándo arranca la intro |
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
| `data-marquee` (+ `-speed`) | `marquee({ direction, speed })` | `MarqueeEffect` | Cinta infinita; el scroll la acelera y la inclina; se frena con hover |
| `data-hscroll` · `-track` · `-bar` | `horizontalScroll.section()` · `.track()` · `.bar()` | `HorizontalScrollEffect` | Estira la sección y traslada el riel en X con el scroll vertical. Si el foco del teclado cae en una card fuera de la vista, scrollea la página hasta mostrarla (`focusin`) |
| `data-stack` | `stackCard()` | `StackEffect` | La card de adentro se achica, gira y oscurece cuando la siguiente se le sube |
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

**Por qué lectura y escritura separadas.** Leer layout (`getBoundingClientRect`) después de escribir un estilo obliga al navegador a recalcular el layout en el momento. Intercalados, son un recálculo por elemento; separados, uno por frame. Por eso todos los efectos miden en `measure` y escriben en `apply`. La única excepción es el imán, que lee y escribe dentro de su `tick`, y solo en los frames en que el mouse se movió (como en el original).

**Por qué la firma del frame.** Con la página quieta, el frame termina antes de medir: el motor solo mueve el cursor y las cintas, que no leen layout. Un re-escaneo fuerza un frame completo aunque la firma no haya cambiado.

**Por qué la ventana de asentamiento.** La firma dice si cambió el scroll, no si cambió el layout. Lo que miden los efectos puede seguir moviéndose después del último cambio de firma: un contador lee su `getBoundingClientRect()`, y si está adentro de un reveal (las stats de Lolog, en `reveal('scale')`), durante los 0,75–1 s de `REVEAL_TRANSITION` esa posición todavía está corrida. En el original, cuando la velocidad suavizada llega a 0 la firma se congela y el contador queda con lo último que midió: en la QA, parando el scroll en las stats de Lolog, "3 días / 2 noches" en vez de "4 / 3" (igual en el diseño que en el port). Por eso cada frame que cambia la firma (o re-escanea) abre una ventana de `SETTLE_MS` (1,1 s, más que el `clip-path` de 1 s, la transición más larga de los reveals) en la que se sigue midiendo y escribiendo con la firma quieta; recién después el motor vuelve a ahorrar frames. No cambia ninguna fórmula ni ningún número: durante la ventana corre el mismo frame que el original corre con cualquier cambio de firma (por ejemplo, durante la intro con el scroll quieto), así que lo que lee la posición de otro elemento —contadores, parallax, stack, timeline, fondo— termina en el valor que le corresponde al layout ya asentado. Los reveals se miden a sí mismos (con su transformación a medio camino, como en el original) y durante la ventana siguen ajustando su pose como en cualquier frame con la firma cambiando. Dos consecuencias chicas, las dos invisibles: el skew por velocidad de las cards termina en 0 exacto (en el original quedaba con la última velocidad que todavía movía la firma, ~0,45 px/frame: `skewX(-0.10deg)` a intensidad 1,8), y después de cada scroll el motor lee layout 1,1 s más, lo mismo que cuesta 1,1 s de scroll.

**Por qué el scroll horizontal sigue al foco.** El riel de Próximos viajes se mueve con `transform` adentro de una escena sticky que recorta: tabular a una card que está fuera de pantalla no la trae, porque lo que la movería es el scroll vertical y el navegador no lo sabe. Encima, el navegador corre en X todo lo que puede para mostrarla, y eso se suma a la traslación del motor: la escena si recortara con `overflow: hidden`, y la página, porque el `overflow-x: clip` del `<body>` llega al viewport como `hidden` (desplazable por programa) y los reveals que entran desde la derecha lo ensanchan (a 790 px de ancho, el foco dejaba la página en `scrollX` 127). `HorizontalScrollEffect` escucha `focusin` en cada sección; si el foco cae en el riel, en el frame siguiente (después del "scroll a la vista" del navegador) deja en 0 el `scrollLeft` de todos los ancestros del riel, página incluida, y, si el ítem enfocado no se ve entero, hace `window.scrollTo` al scroll que lo deja en el gutter: el inverso de la fórmula del efecto (`scrollTopToShowItem` en `math/horizontalScroll.ts`, con test). Suave, salvo con el movimiento apagado: ahí `instant`, no `auto`, porque `auto` toma el `scroll-behavior: smooth` del `<html>`, que `base.css` apaga con reduced motion pero no con el nivel `apagado`. El "ítem" es el ancestro más grande del foco que entra en el viewport (en Próximos viajes, el `<li>` de la card), así que no depende de cómo anide cada sección sus cards.

**Por qué reduced motion apaga todo.** Es lo que hace el diseño (`off()` mira la media query en cada frame): los reveals quedan en su lugar, el parallax, el drift, el skew y las cintas quietas, los contadores en su valor final, el stack sin transformar y el telón sin espera. Kora eligió lo contrario por el ahorro de batería de Windows; acá se sigue al diseño, y la decisión vive en un solo lugar: `RESPECT_OS_REDUCED_MOTION`.

**Por qué el orden de la lista importa.** Todos los efectos pasan por todas las fases (las que no usan están vacías), así que el orden de registro es el orden de cada fase. La cinta, por ejemplo, avanza en `tick` pero su reseteo con el movimiento apagado va en `apply`, entre el drift y el skew, como en el original.

---

## Diferencias con el original

- `rot` se llama `rotate`; los atributos tienen nombres legibles (`data-rv` → `data-reveal`, `data-tl` → `data-timeline`…).
- El zoom de intro del parallax se pide con `parallax(f, { introZoom: true })` (el original lo aplicaba a toda capa que fuera un `<img>`).
- No se portó el carrusel de testimonios (`tRef`, `goT`, `tDots`): el marcado usa una cinta. Tampoco el anillo del cursor (`data-cursor`, oculto siempre en el diseño) ni el `hot` del puntero, que solo lo usaba el anillo.
- No se portó el `case 'word'` del `switch` de reveals: era inalcanzable (las palabras salen antes).
- `dispose()` saca también el listener de `resize` (el original lo dejaba colgado), el telón cancela todos sus timers (el original solo el primero) y el tilt endereza la card que tuviera inclinada.
- El cursor arranca oculto y el motor lo muestra (en el diseño arrancaba visible y el CSS ocultaba siempre el del sistema). La marca `data-cursor-active` de `<html>` vive lo que vive el nodo del cursor: si sale del DOM, se quita en el re-escaneo y vuelve el cursor del sistema.
- `motionOff` vale desde que se construye el motor (no hace falta `start()`): la media query de reduced motion se crea la primera vez que se pide.
- **Ventana de asentamiento** (`SETTLE_MS`): después del último cambio de firma el motor sigue midiendo y escribiendo 1,1 s. En el original los contadores dentro de un reveal podían quedar trabados en un valor intermedio (ver "Decisiones").
- **El scroll horizontal sigue al foco del teclado** (`focusin` en cada `[data-hscroll]`): el original no escuchaba el foco y una card enfocada fuera de la vista quedaba fuera de la vista (ver "Decisiones").
