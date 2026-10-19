/**
 * API pública del feature `contact`: el cierre del sitio.
 *
 * - `Contact`: la sección de Contacto, la última del `<main>` del home
 *   (formulario breve + WhatsApp y el mail).
 * - `SiteFooter`: el `<footer>` de la página, que va fuera del `<main>`,
 *   inmediatamente después.
 */
export { Contact, type ContactProps } from './Contact';
export { SiteFooter, type SiteFooterProps } from './components/SiteFooter';
