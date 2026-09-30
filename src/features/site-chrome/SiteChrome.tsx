import { Curtain, type CurtainProps } from './components/Curtain';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgress } from './components/ScrollProgress';

/** Props de `SiteChrome`: los textos del telón. */
export type SiteChromeProps = {
  /** Textos del telón de entrada. */
  curtain: CurtainProps;
};

/**
 * Las piezas globales **decorativas** de la página, las que no pertenecen a
 * ninguna sección: telón de entrada, cursor montaña y barra de progreso.
 *
 * Son todas `position: fixed`, así que su lugar en el DOM no cambia cómo se
 * ven; el layout las pone **al principio del `<body>`** para que, si el
 * navegador pinta el HTML a medida que llega, la página no se asome antes que
 * el telón.
 *
 * El WhatsApp flotante (`FloatingWhatsApp`) no va acá a propósito: es
 * interactivo, y su lugar en el DOM es su lugar en el orden de tabulación. El
 * layout lo renderiza al final de la página, que es donde está en el diseño.
 *
 * Server Component: nada acá necesita estado. Las anima el motor por atributos.
 */
export function SiteChrome({ curtain }: SiteChromeProps) {
  return (
    <>
      <Curtain title={curtain.title} logoAlt={curtain.logoAlt} />
      <CustomCursor />
      <ScrollProgress />
    </>
  );
}
