// Pagina /colegios (Programas) — re-usa el componente AcreditacionColegios
// pero apunta a la rama i18n 'colegios_prog' para que los textos puedan
// divergir de /acreditacion/colegios sin afectarse mutuamente.
import AcreditacionColegios from './AcreditacionColegios';

export default function ColegiosPrograma() {
  return <AcreditacionColegios ns="colegios_prog" />;
}
