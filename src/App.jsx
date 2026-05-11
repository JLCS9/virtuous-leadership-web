import { Routes, Route, Outlet, Navigate, useParams, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Acreditacion from './pages/Acreditacion';
import AcreditacionColegios from './pages/AcreditacionColegios';
import ColegiosPrograma from './pages/ColegiosPrograma';
import AcreditacionUniversidades from './pages/AcreditacionUniversidades';
import AcreditacionEducacionSuperior from './pages/AcreditacionEducacionSuperior';
import Tests from './pages/Tests';
import TestTemperamento from './pages/TestTemperamento';
import Contacto from './pages/Contacto';
import NotFound from './pages/NotFound';
import { SUPPORTED_LANGS, detectInitialLang } from './i18n';

// LangGuard: dentro de las rutas /:lang/... valida que el segmento sea uno
// de los idiomas soportados. Si no, redirige al idioma detectado conservando
// el resto del path. Esto cubre paths antiguos cacheados como /colegios.
function LangGuard({ children }) {
  const { lang } = useParams();
  const location = useLocation();
  if (!SUPPORTED_LANGS.includes(lang)) {
    const detected = detectInitialLang();
    const target = `/${detected}${location.pathname === '/' ? '/' : location.pathname}${location.search}${location.hash}`;
    return <Navigate to={target} replace />;
  }
  return children;
}

// LegacyRedirect: para paths que no empiezan con /:lang (incluido el root '/').
// Redirige a /{idiomaDetectado}{pathOriginal}.
function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();
  const detected = detectInitialLang();
  const target = `/${detected}${pathname === '/' ? '/' : pathname}${search}${hash}`;
  return <Navigate to={target} replace />;
}

function LayoutWithOutlet() {
  return <Layout><Outlet /></Layout>;
}

// El test de temperamento se renderiza SIN Layout (sin header, sin footer):
// experiencia enfocada como un mini-app dentro del sitio.
// El resto de paginas comparten el mismo Layout.
export default function App() {
  return (
    <Routes>
      {/* Test temperamento sin Layout */}
      <Route path="/:lang/tests/temperamento" element={<LangGuard><TestTemperamento /></LangGuard>} />

      {/* Paginas con Layout (header + footer). El idioma vive en /:lang */}
      <Route path="/:lang" element={<LangGuard><LayoutWithOutlet /></LangGuard>}>
        <Route index                                element={<Home />} />
        <Route path="acreditacion"                  element={<Acreditacion />} />
        <Route path="acreditacion/colegios"         element={<AcreditacionColegios />} />
        <Route path="colegios"                      element={<ColegiosPrograma />} />
        <Route path="universidades"                 element={<AcreditacionUniversidades />} />
        <Route path="educacion-superior"            element={<AcreditacionEducacionSuperior />} />
        {/* Redirecciones suaves desde rutas antiguas dentro del lang */}
        <Route path="acreditacion/universidades"      element={<AcreditacionUniversidades />} />
        <Route path="acreditacion/educacion-superior" element={<AcreditacionEducacionSuperior />} />
        <Route path="tests"                         element={<Tests />} />
        <Route path="contacto"                      element={<Contacto />} />
        <Route path="*"                             element={<NotFound />} />
      </Route>

      {/* Cualquier path sin prefijo de idioma (legacy o root) -> redirigir */}
      <Route path="*" element={<LegacyRedirect />} />
    </Routes>
  );
}
