import TestTBPChildren from '../TestTBPChildren';
import SEO from '../components/SEO';

// Página wrapper del test de temperamento para niños (6-17 años).
// Sólo disponible en español de momento — la ruta sólo existe en /es/.
// Sin schema Quiz porque el destinatario del test no es el sujeto evaluado.

const SEO_DATA = {
  title: 'Test de Temperamento para Niños y Adolescentes | Virtuous Leadership',
  description:
    'Test de temperamento para niños y adolescentes de 6 a 17 años, basado en la teoría de Alexandre Havard. Pensado para que padres, madres o tutores descubran el temperamento de su hijo/a (colérico, melancólico, sanguíneo o flemático) y los retos que conviene acompañar. Resultado inmediato y gratis.',
};

export default function TestTemperamentoNinos() {
  return (
    <>
      <SEO
        title={SEO_DATA.title}
        description={SEO_DATA.description}
        path="/tests/temperamento-infantil"
      />
      <TestTBPChildren />
    </>
  );
}
