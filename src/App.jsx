import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

// El test de temperamento se renderiza SIN Layout (sin header, sin footer):
// experiencia enfocada como un mini-app dentro del sitio.
// El resto de páginas comparten el mismo Layout.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tests/temperamento" element={<TestTemperamento />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/"                       element={<Home />} />
                <Route path="/acreditacion"           element={<Acreditacion />} />
                <Route path="/acreditacion/colegios"  element={<AcreditacionColegios />} />
                <Route path="/colegios"               element={<ColegiosPrograma />} />
                <Route path="/universidades"          element={<AcreditacionUniversidades />} />
                <Route path="/educacion-superior"     element={<AcreditacionEducacionSuperior />} />
                {/* redirecciones desde rutas antiguas */}
                <Route path="/acreditacion/universidades"      element={<AcreditacionUniversidades />} />
                <Route path="/acreditacion/educacion-superior" element={<AcreditacionEducacionSuperior />} />
                <Route path="/tests"                  element={<Tests />} />
                <Route path="/contacto"               element={<Contacto />} />
                <Route path="*"                       element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
