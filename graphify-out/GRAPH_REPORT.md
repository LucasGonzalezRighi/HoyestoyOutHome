# Graph Report - HOY-ESTOY-OOH-frontend  (2026-10-13)

## Corpus Check
- 293 files · ~335,088 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 63 file(s) not represented in the graph (top: .css 60, (none) 2, .example 1)

## Summary
- 1185 nodes · 3259 edges · 56 communities (53 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Campos de formulario
- Atomos y listas compartidas
- Motor: loop e intro
- Configuracion y dependencias
- Motor: efectos por frame
- Botones
- Motor: atributos y estado
- Tests del dominio
- Linea de tiempo (organism)
- Carrusel de viajes anterior
- Pagina de viaje: secciones
- Salidas del calendario
- Precio y tests de salidas
- Dia del itinerario
- Atomo Dot y variantes
- Reveals y easing
- Contenido de cada viaje
- Contenedor, encabezados y cintas
- Link de WhatsApp
- Contenido del home y fotos
- Fechas (CalendarDate)
- Logo y eyebrow
- Atributos del motor
- Configuracion de TypeScript
- Layout y assets
- Secciones, fotos y pension
- Imagen lavada (WashedImage)
- Checklist de servicios
- Contacto y cierre del viaje
- Tokens de movimiento
- Home y hero
- Entidad Trip
- Metricas del viaje
- Datos de contacto y marca
- Navbar y config de Next
- Rutas, sitemap y pagina de viaje
- Tipos del contenido de viaje
- Testimonios
- Cursor del motor
- URL publica y robots
- Tag y GuideCard
- hero y HeroHeadline
- MarqueeEffect y MarqueeEffect.test
- StarRating y TestimonialCard
- trips y cajon-del-azul
- SiteFooter y closingBackground
- ChatIcon y Faq
- FaqAccordion y faq
- ScrollTracker y trackers.test
- Calendar y TimelineGroup
- ServiceChecklist
- TripFit y types
- checklistPanels y types
- departures y calendar
- WhatsAppIcon y package
- Trip y common

## God Nodes (most connected - your core abstractions)
1. `cn()` - 73 edges
2. `reveal()` - 53 edges
3. `FrameState` - 39 edges
4. `react` - 37 edges
5. `vitest` - 35 edges
6. `Section()` - 33 edges
7. `Trip` - 32 edges
8. `Container()` - 29 edges
9. `Photo` - 27 edges
10. `Departure` - 25 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `Navbar()`  [EXTRACTED]
  src/app/layout.tsx → src/components/organisms/Navbar/Navbar.tsx
- `RootLayout()` --calls--> `SiteFooter()`  [EXTRACTED]
  src/app/layout.tsx → src/features/contact/components/SiteFooter/SiteFooter.tsx
- `RootLayout()` --calls--> `FloatingWhatsApp()`  [EXTRACTED]
  src/app/layout.tsx → src/features/site-chrome/components/FloatingWhatsApp/FloatingWhatsApp.tsx
- `RootLayout()` --calls--> `SiteChrome()`  [EXTRACTED]
  src/app/layout.tsx → src/features/site-chrome/SiteChrome.tsx
- `Page()` --calls--> `Landing()`  [EXTRACTED]
  src/app/page.tsx → src/features/landing/Landing.tsx

## Import Cycles
- None detected.

## Communities (56 total, 3 thin omitted)

### Community 0 - "Campos de formulario"
Cohesion: 0.09
Nodes (39): RFC-6068, lucide-react, errorIdOf(), FieldFrame(), FieldFrameProps, fieldStateProps(), TONE_CLASSES, FieldBaseProps (+31 more)

### Community 1 - "Atomos y listas compartidas"
Cohesion: 0.06
Nodes (29): VisuallyHidden(), VisuallyHiddenProps, BulletList(), BulletListProps, BulletListSize, BulletListVariant, DOT_SIZES, SIZE_CLASSES (+21 more)

### Community 2 - "Motor: loop e intro"
Cohesion: 0.07
Nodes (11): IntroClock, changesElements(), MotionEngine, ApplySpy, engine(), IntroSpy, PhaseSpy, startEngine() (+3 more)

### Community 3 - "Configuracion y dependencias"
Cohesion: 0.05
Nodes (41): dependencies, lucide-react, next, react, react-dom, simple-icons, description, devDependencies (+33 more)

### Community 4 - "Motor: efectos por frame"
Cohesion: 0.07
Nodes (11): queryAll(), FrameState, ScrollEffect, MeasureSpy, createMotionEngine(), BackgroundShiftEffect, MagnetEffect, ParallaxEffect (+3 more)

### Community 5 - "Botones"
Cohesion: 0.10
Nodes (21): Button(), buttonClassName(), SIZE_CLASSES, TONE_CLASSES, VARIANT_CLASSES, ButtonBaseProps, ButtonProps, ButtonSize (+13 more)

### Community 6 - "Motor: atributos y estado"
Cohesion: 0.17
Nodes (16): INTRO_DURATION_MS, MOTION_MEDIA, MOTION_ATTRIBUTES, MOTION_SELECTORS, scrollingElementOf(), MotionSettings, PointerSnapshot, FrameEffect (+8 more)

### Community 7 - "Tests del dominio"
Cohesion: 0.07
Nodes (11): vitest, ItineraryDayParams, calleFirstDay, lologSecondDay, photo, Guide, GuideParams, params (+3 more)

### Community 8 - "Linea de tiempo (organism)"
Cohesion: 0.13
Nodes (21): Timeline(), TimelineProps, TimelineHeadingLevel, TimelineMarker, TimelineMarkerDetail, PhotoRatioStyle, TimelinePhoto(), TimelinePhotoProps (+13 more)

### Community 9 - "Carrusel de viajes anterior"
Cohesion: 0.12
Nodes (28): TripsCarouselContent, RESPECT_OS_REDUCED_MOTION, CarouselDirection, carouselPosition, CarouselScrollMetrics, CarouselStepMetrics, clamp(), EDGE_TOLERANCE_PX (+20 more)

### Community 10 - "Pagina de viaje: secciones"
Cohesion: 0.13
Nodes (15): SectionKey, TRIP_SECTION_IDS, TripSectionKey, checklistPanels(), DetailHeading(), TripChecklist(), TripChecklistProps, TripCover() (+7 more)

### Community 11 - "Salidas del calendario"
Cohesion: 0.08
Nodes (13): DateMarker, Departure, DepartureParams, DepartureSchedule, calle, calleMarch, calleNovember, lagunaNegra (+5 more)

### Community 12 - "Precio y tests de salidas"
Cohesion: 0.10
Nodes (9): calle, lagunaNegra, Price, buildTrip(), TripParams, calle, catalog, lolog (+1 more)

### Community 13 - "Dia del itinerario"
Cohesion: 0.11
Nodes (11): ITINERARY_STAT_KINDS, ItineraryDay, ItineraryStat, ItineraryStatKind, formatCount(), formatKilometers(), formatMeters(), formatNumber() (+3 more)

### Community 14 - "Atomo Dot y variantes"
Cohesion: 0.11
Nodes (15): Dot(), DotProps, DotSize, DotTone, SIZE_CLASSES, TONE_CLASSES, Marquee(), MarqueeItemMeta (+7 more)

### Community 15 - "Reveals y easing"
Cohesion: 0.17
Nodes (18): REVEAL, RevealVariant, clamp01(), easeInOutCubic(), introRevealProgress(), isFarFromViewport(), scrollEntryProgress(), scrollExitProgress() (+10 more)

### Community 16 - "Contenido de cada viaje"
Cohesion: 0.17
Nodes (22): homeAnchorTo(), tripAnchorTo(), calleStepanekDetail, trip, consultCta(), consultMessage(), MEALS_FOOTNOTE, OVERVIEW_COPY (+14 more)

### Community 17 - "Contenedor, encabezados y cintas"
Cohesion: 0.17
Nodes (12): Container(), ContainerElement, ContainerProps, SectionHeading(), MarqueePauseGroup(), Gallery(), GalleryProps, Testimonials() (+4 more)

### Community 18 - "Link de WhatsApp"
Cohesion: 0.15
Nodes (9): whatsapp, WhatsAppLink, assertInteger(), assertOptionalPositive(), assertPositive(), assertText(), assertTextList(), describeRange() (+1 more)

### Community 19 - "Contenido del home y fotos"
Cohesion: 0.20
Nodes (14): SITE, LandingContent, PHOTOS, galleryContent, siteContent, AVATARS, teamContent, testimonialsContent (+6 more)

### Community 20 - "Fechas (CalendarDate)"
Cohesion: 0.11
Nodes (7): CalendarDate, DAY_MONTH, DAY_MONTH_YEAR, LONG_MONTH, SHORT_MONTH, parse(), LOCALE

### Community 21 - "Logo y eyebrow"
Cohesion: 0.15
Nodes (11): react, BrandLogoProps, Eyebrow(), EyebrowProps, SectionProps, SectionSpacing, SPACING_CLASSES, SectionHeadingProps (+3 more)

### Community 22 - "Atributos del motor"
Cohesion: 0.15
Nodes (14): COUNTER, CounterFormat, MarqueeOptions, MotionAttributeKey, MotionAttributeName, MotionAttributes, RevealOptions, readNumber() (+6 more)

### Community 23 - "Configuracion de TypeScript"
Cohesion: 0.09
Nodes (22): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+14 more)

### Community 24 - "Layout y assets"
Cohesion: 0.14
Nodes (13): metadata, RootLayout(), SHARE_IMAGE, viewport, ASSET_DIRS, BRAND_LOGO, SHARE_IMAGE_ASSET, anchorTo() (+5 more)

### Community 25 - "Secciones, fotos y pension"
Cohesion: 0.18
Nodes (9): Section(), WashedImage(), TripCardContent, TripMeals(), TripMealsProps, TripCard(), TripCardProps, TripsShowcase() (+1 more)

### Community 26 - "Imagen lavada (WashedImage)"
Cohesion: 0.13
Nodes (12): OverscanStyle, TONE_CLASSES, WashedImageParallax, WashedImagePhoto, WashedImageProps, WashedImageTone, TripCoverContent, TripTagKind (+4 more)

### Community 27 - "Checklist de servicios"
Cohesion: 0.22
Nodes (12): MetricParams, SERVICE_GROUP_KINDS, ServiceChecklistParams, ServiceGroup, ServiceGroupKind, params, DIFFICULTIES, Difficulty (+4 more)

### Community 28 - "Contacto y cierre del viaje"
Cohesion: 0.23
Nodes (10): BrandLogo(), LinkButton(), WhatsAppIcon(), Contact(), CLOSING_BACKGROUND, TripClosing(), TripClosingProps, ComingSoon() (+2 more)

### Community 29 - "Tokens de movimiento"
Cohesion: 0.16
Nodes (14): BACKGROUND_SHIFT, DEFAULT_MOTION_LEVEL, isMotionLevel(), MAGNET, MAGNET_TRANSITION, MOTION_LEVELS, MotionLevel, PARALLAX (+6 more)

### Community 30 - "Home y hero"
Cohesion: 0.21
Nodes (8): Page(), SECTION_IDS, BACKGROUND_PARALLAX, Hero(), HeroProps, Landing(), Team(), TeamProps

### Community 31 - "Entidad Trip"
Cohesion: 0.16
Nodes (3): Trip, TripSlug, TripCatalog

### Community 32 - "Metricas del viaje"
Cohesion: 0.17
Nodes (7): CountSuffix, SUFFIXES, dayHike, LABELS, TripMetricLabels, tripMetrics(), Metric

### Community 33 - "Datos de contacto y marca"
Cohesion: 0.21
Nodes (10): CONTACT_EMAIL, FEATURE_FLAGS, SOCIAL_PROFILES, WHATSAPP, ContactChannelsContent, contactContent, ContactFieldContent, ContactSentStatusContent (+2 more)

### Community 34 - "Navbar y config de Next"
Cohesion: 0.26
Nodes (8): nextConfig, next, Navbar(), NavbarBrand, NavbarLink, NavbarProps, NavLink(), NavLinkProps

### Community 35 - "Rutas, sitemap y pagina de viaje"
Cohesion: 0.23
Nodes (9): sitemap(), dynamicParams, generateMetadata(), TripPage(), TripPageProps, ROUTES, tripPath(), toCard() (+1 more)

### Community 36 - "Tipos del contenido de viaje"
Cohesion: 0.15
Nodes (12): TripAudienceListContent, TripChecklistPanel, TripClosingContent, TripComingSoonContent, TripDeparturesContent, TripFactContent, TripMealContent, TripMealsContent (+4 more)

### Community 37 - "Testimonios"
Cohesion: 0.18
Nodes (3): params, Testimonial, TestimonialParams

### Community 38 - "Cursor del motor"
Cohesion: 0.19
Nodes (3): MOTION_STATE, CursorEffect, FakeElement

### Community 39 - "URL publica y robots"
Cohesion: 0.26
Nodes (8): isLocalHostname(), LOCAL_HOSTNAMES, nonEmpty(), parseUrl(), pickSiteUrl(), resolveSiteUrl(), SITE_URL, SiteUrlEnv

### Community 40 - "Tag y GuideCard"
Cohesion: 0.27
Nodes (6): Tag(), TagProps, TagVariant, VARIANT_CLASSES, GuideCard(), GuideCardProps

### Community 41 - "hero y HeroHeadline"
Cohesion: 0.24
Nodes (8): HEADLINE_LINES, heroContent, HeroHeadlineContent, HeroHeadlineLine, HeroHeadline(), HeroHeadlineProps, StaggeredWord, staggerWords()

### Community 42 - "MarqueeEffect y MarqueeEffect.test"
Cohesion: 0.26
Nodes (5): MARQUEE, MarqueeEffect, frame(), run(), TrackOptions

### Community 43 - "StarRating y TestimonialCard"
Cohesion: 0.31
Nodes (5): StarRating(), StarRatingProps, TestimonialCard(), TestimonialCardProps, tilt()

### Community 44 - "trips y cajon-del-azul"
Cohesion: 0.33
Nodes (5): tripCatalog, cajonDelAzulDetail, tripDetails, lagunaNegraDetail, TripDetailContent

### Community 45 - "SiteFooter y closingBackground"
Cohesion: 0.31
Nodes (5): footerContent, CLOSING_BACKGROUND, SiteFooter(), SiteFooterProps, ContactProps

### Community 46 - "ChatIcon y Faq"
Cohesion: 0.39
Nodes (4): ChatIcon(), ChatIconProps, Faq(), FaqProps

### Community 47 - "FaqAccordion y faq"
Cohesion: 0.36
Nodes (6): FaqEntry, FaqAccordion(), FaqAccordionProps, onClient(), onServer(), subscribeToNothing()

### Community 48 - "ScrollTracker y trackers.test"
Cohesion: 0.28
Nodes (4): SCROLL, ScrollSample, ScrollTracker, clamp()

### Community 49 - "Calendar y TimelineGroup"
Cohesion: 0.43
Nodes (5): TimelineGroup(), Calendar(), CalendarProps, DepartureItemProps, reveal()

### Community 51 - "TripFit y types"
Cohesion: 0.38
Nodes (3): TripFitContent, TripFit(), TripFitProps

### Community 52 - "checklistPanels y types"
Cohesion: 0.33
Nodes (4): TripChecklistContent, ChecklistGroupData, ChecklistPanelData, GROUP_DOT_TONES

### Community 53 - "departures y calendar"
Cohesion: 0.60
Nodes (3): departureSchedule, calendarContent, DepartureMonth

## Knowledge Gaps
- **7 isolated node(s):** `@types/node`, `@types/react`, `@types/react-dom`, `prettier`, `typescript` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 351 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Tests del dominio` to `Campos de formulario`, `Motor: loop e intro`, `Configuracion y dependencias`, `Botones`, `Carrusel de viajes anterior`, `Salidas del calendario`, `Precio y tests de salidas`, `Dia del itinerario`, `Reveals y easing`, `Link de WhatsApp`, `Fechas (CalendarDate)`, `Atributos del motor`, `Checklist de servicios`, `Tokens de movimiento`, `Metricas del viaje`, `Testimonios`, `Cursor del motor`, `URL publica y robots`, `MarqueeEffect y MarqueeEffect.test`, `trips y cajon-del-azul`, `ScrollTracker y trackers.test`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **What connects `@types/node`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Campos de formulario` be split into smaller, more focused modules?**
  _Cohesion score 0.08831168831168831 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Logo y eyebrow` to `Campos de formulario`, `Atomos y listas compartidas`, `Navbar y config de Next`, `Configuracion y dependencias`, `Botones`, `Tag y GuideCard`, `Linea de tiempo (organism)`, `hero y HeroHeadline`, `StarRating y TestimonialCard`, `Carrusel de viajes anterior`, `Atomo Dot y variantes`, `FaqAccordion y faq`, `Contenedor, encabezados y cintas`, `WhatsAppIcon y package`, `Layout y assets`, `Imagen lavada (WashedImage)`, `Contacto y cierre del viaje`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `Atomos y listas compartidas` be split into smaller, more focused modules?**
  _Cohesion score 0.0632996632996633 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Logo y eyebrow` to `Campos de formulario`, `Atomos y listas compartidas`, `Navbar y config de Next`, `Botones`, `Tag y GuideCard`, `Linea de tiempo (organism)`, `Pagina de viaje: secciones`, `StarRating y TestimonialCard`, `Carrusel de viajes anterior`, `Atomo Dot y variantes`, `FaqAccordion y faq`, `Contenedor, encabezados y cintas`, `Calendar y TimelineGroup`, `Layout y assets`, `Secciones, fotos y pension`, `Imagen lavada (WashedImage)`, `Contacto y cierre del viaje`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Motor: loop e intro` be split into smaller, more focused modules?**
  _Cohesion score 0.06767676767676768 - nodes in this community are weakly interconnected._