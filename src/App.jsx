import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Acreditacion from './pages/Acreditacion';
const AcreditacionColegios = lazy(() => import('./pages/AcreditacionColegios'));
const ColegiosPage = lazy(() => import('./pages/ColegiosCertificacion'));
import ColegiosGracias from './pages/ColegiosGracias';
const EmpresasPage = lazy(() => import('./pages/EmpresasCertificacion'));
import AcreditacionUniversidades from './pages/AcreditacionUniversidades';
import AcreditacionEducacionSuperior from './pages/AcreditacionEducacionSuperior';
import Tests from './pages/Tests';
const TestTemperamento = lazy(() => import('./pages/TestTemperamento'));
const TestTemperamentoNinos = lazy(() => import('./pages/TestTemperamentoNinos'));
const TestTemperamentoGracias = lazy(() => import('./pages/TestTemperamentoGracias'));
const TestCaracter = lazy(() => import('./pages/TestCaracter'));
const TestCorazon = lazy(() => import('./pages/TestCorazon'));
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import Cookies from './pages/Cookies';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
const PortalGuard = lazy(() => import('./app/PortalGuard'));
const Hoy = lazy(() => import('./app/Hoy'));
const Formacion = lazy(() => import('./formacion/Formacion'));
const Modulo = lazy(() => import('./formacion/Modulo'));
const Perfil = lazy(() => import('./app/Perfil'));
import Restablecer from './pages/Restablecer';
import ConsentimientoTutor from './pages/ConsentimientoTutor';
import NotFound from './pages/NotFound';
import PageTracker from './components/PageTracker';
import CookieConsent from './components/CookieConsent';
import { SUPPORTED_LANGS, detectInitialLang, ROUTES, NO_LAYOUT_PAGES } from './i18n';

const PAGE_ELEMENTS = {
  home:                  <Home />,
  acreditacion_landing:  <Acreditacion />,
  acreditacion_colegios: <AcreditacionColegios />,
  programa_colegios:     <ColegiosPage />,
  colegios_gracias:      <ColegiosGracias />,
  programa_empresas:     <EmpresasPage />,
  universidades:         <AcreditacionUniversidades />,
  edsup:                 <AcreditacionEducacionSuperior />,
  tests:                 <Tests />,
  test_temperamento:     <TestTemperamento />,
  test_temperamento_ninos: <TestTemperamentoNinos />,
  test_temperamento_gracias: <TestTemperamentoGracias />,
  test_caracter:         <TestCaracter />,
  test_corazon:          <TestCorazon />,
  politica_privacidad:   <PoliticaPrivacidad />,
  cookies:               <Cookies />,
  contacto:              <Contacto />,
  login:                 <Login />,
  mi_panel:              <LegacyRedirect to="/app" />,
  restablecer:           <Restablecer />,
  consentimiento_tutor:  <ConsentimientoTutor />,
};

function LayoutWithOutlet() {
  return <Layout><Outlet /></Layout>;
}

function LegacyRedirect({ to }) {
  const { pathname, search, hash } = useLocation();

  if (to) {
    const detected = detectInitialLang();
    return <Navigate to={`/${detected}${to}${search}${hash}`} replace />;
  }

  const detected = detectInitialLang();
  const target = `/${detected}${pathname === '/' ? '' : pathname}${search}${hash}`;
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <>
      <PageTracker />
      <CookieConsent />
      <Suspense fallback={null}>
      <Routes>
      {/* Páginas sin Layout (tests, legales, login, etc.) */}
      {SUPPORTED_LANGS.flatMap(lang =>
        Array.from(NO_LAYOUT_PAGES).map(pageId => {
          if (pageId === 'app') return null;
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

      {/* Portal /app — ruta padre con AppShell compartido, hijas como pestañas */}
      {SUPPORTED_LANGS.map(lang => {
        const appSlug = ROUTES.app?.[lang];
        if (!appSlug) return null;
        return (
          <Route key={`portal-${lang}`} path={`/${lang}/${appSlug}`} element={<PortalGuard />}>
            <Route index element={<Hoy />} />
            <Route path="camino" element={<Navigate to=".." replace />} />
            <Route path="formacion" element={<Formacion />} />
            <Route path="formacion/:cursoId" element={<Modulo />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
        );
      })}

      {/* Legacy redirects: /mi-panel/camino → /app/camino, /mi-panel/formacion → /app/formacion */}
      {SUPPORTED_LANGS.map(lang => {
        const panelSlug = ROUTES.mi_panel?.[lang];
        if (!panelSlug) return null;
        return [
          <Route key={`legacy-camino-${lang}`} path={`/${lang}/${panelSlug}/camino`}
                 element={<LegacyRedirect to="/app/camino" />} />,
          <Route key={`legacy-formacion-${lang}`} path={`/${lang}/${panelSlug}/formacion`}
                 element={<LegacyRedirect to="/app/formacion" />} />,
          <Route key={`legacy-retos-${lang}`} path={`/${lang}/${panelSlug}/retos`}
                 element={<LegacyRedirect to="/app" />} />,
        ];
      })}

      {/* Páginas con Layout (header + footer del sitio) */}
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

      <Route path="*" element={<LegacyRedirect />} />
    </Routes>
    </Suspense>
    </>
  );
}
