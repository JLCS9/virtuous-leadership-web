import TestTBP from '../TestTBP';
import SEO from '../components/SEO';
import { useT } from '../i18n';

// Metas SEO por idioma. Optimizadas para rankear por queries de "test de
// temperamento" sin mencionar "test de personalidad" en ninguna parte —
// Google reconoce la relación semántica entre ambos términos.
const TEMPERAMENT_SEO = {
  es: {
    title: 'Test de Temperamento Online Gratis | Virtuous Leadership',
    description: 'Haz el test de temperamento oficial de Virtuous Leadership basado en la teoría de Alexandre Havard. Descubre tu temperamento dominante (colérico, melancólico, sanguíneo o flemático), tu temperamento secundario y la virtud que más necesitas desarrollar. 22 preguntas, 5 minutos, resultado inmediato y gratis.',
  },
  en: {
    title: 'Free Online Temperament Test | Virtuous Leadership',
    description: 'Take Virtuous Leadership\'s official temperament test based on Alexandre Havard\'s theory. Discover your dominant temperament (choleric, melancholic, sanguine or phlegmatic), your secondary temperament and the virtue you most need to develop. 22 questions, 5 minutes, instant free result.',
  },
  fr: {
    title: 'Test de Tempérament Gratuit en Ligne | Virtuous Leadership',
    description: 'Fais le test de tempérament officiel de Virtuous Leadership basé sur la théorie d\'Alexandre Havard. Découvre ton tempérament dominant (colérique, mélancolique, sanguin ou flegmatique), ton tempérament secondaire et la vertu que tu dois le plus développer. 22 questions, 5 minutes, résultat instantané et gratuit.',
  },
};

const QUIZ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Test de Temperamento',
  alternateName: ['Temperament Test', 'Test de Tempérament'],
  url: 'https://virtuousleadership.com/tests/temperamento',
  description: 'Test oficial de temperamento basado en la teoría del Liderazgo Virtuoso de Alexandre Havard. Evalúa los cuatro temperamentos clásicos (colérico, melancólico, sanguíneo, flemático) y la virtud-desafío correspondiente.',
  educationalLevel: 'all',
  inLanguage: ['es', 'en', 'fr'],
  isAccessibleForFree: true,
  about: [
    { '@type': 'Thing', name: 'Temperamento' },
    { '@type': 'Thing', name: 'Carácter' },
    { '@type': 'Thing', name: 'Autoconocimiento' },
    { '@type': 'Thing', name: 'Liderazgo' },
  ],
  author: {
    '@type': 'Person',
    name: 'Alexandre Havard',
    url: 'https://alexhavard.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Virtuous Leadership',
    url: 'https://virtuousleadership.com',
  },
  numberOfQuestions: 22,
  timeRequired: 'PT5M',
};

export default function TestTemperamento() {
  const { lang } = useT();
  const seo = TEMPERAMENT_SEO[lang] || TEMPERAMENT_SEO.es;
  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path="/tests/temperamento"
        schema={QUIZ_SCHEMA}
      />
      <TestTBP />
    </>
  );
}
