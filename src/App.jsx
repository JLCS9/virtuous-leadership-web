import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Acreditacion from './pages/Acreditacion';
import AcreditacionColegios from './pages/AcreditacionColegios';
import ColegiosPrograma from './pages/ColegiosPrograma';
import AcreditacionUniversidades from './pages/AcreditacionUniversidades';
import AcreditacionEducacionSuperior from './pages/AcreditacionEducacionSuperior';
import Tests from './pages/Tests';
import TestTemperamento from './pages/TestTemperamento';
import TestTemperamentoNinos from './pages/TestTemperamentoNinos';
import Contacto from './pages/Contacto';
import NotFound from './pages/NotFound';
import PageTracker from './components/PageTracker';
import { SUPPORTED_LANGS, detectInitialLang, ROUTES, NO_LAYOUT_PAGES } from './i18n';

// Mapeo pageId -> componente. Si añades una pagina aqui, añade tambien su
// entrada en src/i18n/routes.js para definir su slug por idioma.
const PAGE_ELEMENTS = {
  home:                  <Home />,
  acreditacion_landing:  <Acreditacion />,
  acreditacion_colegios: <AcreditacionColegios />,
  programa_colegios:     <ColegiosPrograma />,
  universidades:         <AcreditacionUniversidades />,
  edsup:                 <AcreditacionEducacionSuperior />,
  tests:                 <Tests />,
  test_temperamento:     <TestTemperamento />,
  test_temperamento_ninos: <TestTemperamentoNinos />,
  contacto:              <Contacto />,
};

function LayoutWithOutlet() {
  return <Layout><Outlet /></Layout>;
}

// LegacyRedirect: cualquier path que no empiece por /:lang valido (incluido
// la raiz '/') se redirige a /{idiomaDetectado}{path}. Esto cubre paths
// legacy indexados antes de la migracion a URLs con prefijo de idioma.
function LegacyRedirect() {
  const { pathname, search, hash } = useLocation();
  const detected = detectInitialLang();
  const target = `/${detected}${pathname === '/' ? '' : pathname}${search}${hash}`;
  return <Navigate to={target} replace />;
}

// El test de temperamento se renderiza SIN Layout (sin header, sin footer):
// experiencia enfocada como un mini-app dentro del sitio.
// El resto de paginas comparten el mismo Layout.
export default function App() {
  return (
    <>
      <PageTracker />
      <Routes>
      {/* Test temperamento sin Layout — uno por idioma */}
      {SUPPORTED_LANGS.flatMap(lang =>
        Array.from(NO_LAYOUT_PAGES).map(pageId => {
          const slug = ROUTES[pageId]?.[lang];
          if (slug === undefined) return null;
          return (
            <Route
              key={`${lang}-${pageId}`}
              path={`/${lang}${slug ? `/${slug}` : ''}`}
              element={PAGE_ELEMENTS[pageId]}
            />
          );
        })
      )}

      {/* Paginas con Layout — una rama por idioma, hijos con slug localizado.
          La rama por idioma evita remount de Layout al cambiar de pagina
          dentro del mismo idioma. */}
      {SUPPORTED_LANGS.map(lang => (
        <Route key={`layout-${lang}`} path={`/${lang}`} element={<LayoutWithOutlet />}>
          <Route index element={PAGE_ELEMENTS.home} />
          {Object.entries(PAGE_ELEMENTS).map(([pageId, element]) => {
            if (pageId === 'home' || NO_LAYOUT_PAGES.has(pageId)) return null;
            const slug = ROUTES[pageId]?.[lang];
            if (!slug) return null;
            return <Route key={pageId} path={slug} element={element} />;
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      ))}

      {/* Cualquier path sin prefijo de idioma valido (root o legacy)
          -> redirigir conservando el path original. */}
      <Route path="*" element={<LegacyRedirect />} />
    </Routes>
    </>
  );
}
