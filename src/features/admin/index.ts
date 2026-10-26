/*
 * El panel de administración (`/admin`): pantallas, formularios y acciones.
 * Las rutas viven en `app/admin/`; el contenido que editan, en
 * `server/content/`.
 */
export { AdminPage, AdminShell } from './components/AdminShell';
export { Dashboard } from './components/Dashboard/Dashboard';
export {
  DeparturesEditor,
  FaqEditor,
  HomeTextsEditor,
  TestimonialsEditor,
  type DepartureTripOption,
} from './components/ListEditors';
export { LoginForm } from './components/LoginForm/LoginForm';
export { TripEditor } from './components/TripEditor/TripEditor';
export { TripList } from './components/TripList/TripList';
