import { CustomCursor } from './components/CustomCursor';
import { ScrollProgress } from './components/ScrollProgress';

/**
 * Las piezas globales **decorativas** del sitio, las que no pertenecen a
 * ninguna sección ni a ninguna página: el cursor montaña y la barra de
 * progreso. Se ven igual en el home y en las páginas de viaje.
 *
 * Son `position: fixed` y `aria-hidden`, así que su lugar en el DOM no cambia
 * cómo se ven ni lo que lee un lector de pantalla. El layout las pone al
 * principio del fondo de la página, antes del nav.
 *
 * El WhatsApp flotante (`FloatingWhatsApp`) no va acá a propósito: es
 * interactivo, y su lugar en el DOM es su lugar en el orden de tabulación. El
 * layout lo renderiza al final de la página, que es donde está en el diseño.
 *
 * Server Component: nada acá necesita estado. Las anima el motor por atributos.
 */
export function SiteChrome() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
    </>
  );
}
