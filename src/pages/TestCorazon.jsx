import TestHeart from '../TestHeart';
import SEO from '../components/SEO';
import { useT } from '../i18n';

// Metas SEO por idioma. Se referencian "corazón libre" / "free heart" /
// "cœur libre" / "свободное сердце" — nombre del libro y del test.
const HEART_SEO = {
  es: {
    title: 'Test Corazón Libre | Virtuous Leadership',
    description: 'Test del "Corazón Libre" de Alexandre Havard. Identifica tu tendencia hacia las 8 enfermedades espirituales (racionalismo, voluntarismos y sentimentalismos) y recibe diagnóstico + remedio para cada una. 32 preguntas, 15 minutos, gratis.',
  },
  en: {
    title: 'Free Heart Test | Virtuous Leadership',
    description: 'Alexandre Havard\'s "Free Heart" test. Identify tendencies toward the 8 spiritual disorders (rationalism, voluntarisms, and sentimentalisms). Get diagnosis and remedy for each. 32 questions, 15 minutes, free.',
  },
  fr: {
    title: 'Test Cœur Libre | Virtuous Leadership',
    description: 'Test « Cœur Libre » d\'Alexandre Havard. Identifiez vos tendances vers les 8 maladies spirituelles (rationalisme, volontarismes et sentimentalismes). Diagnostic et remède pour chacune. 32 questions, 15 minutes, gratuit.',
  },
  ru: {
    title: 'Тест «Свободное сердце» | Virtuous Leadership',
    description: 'Тест «Свободное сердце» Александра Авара. Определите склонность к 8 духовным болезням (рационализм, волюнтаризмы и сентиментализмы). Диагноз и решение для каждой. 32 вопроса, 15 минут, бесплатно.',
  },
};

const QUIZ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Test Corazón Libre',
  alternateName: ['Free Heart Test', 'Test Cœur Libre', 'Тест «Свободное сердце»'],
  url: 'https://virtuousleadership.com/tests/corazon-libre',
  description: 'Test basado en el libro "Corazón Libre" de Alexandre Havard. Evalúa la tendencia hacia 8 enfermedades espirituales.',
  educationalLevel: 'all',
  inLanguage: ['es', 'en', 'fr', 'ru'],
  isAccessibleForFree: true,
  about: [
    { '@type': 'Thing', name: 'Corazón' },
    { '@type': 'Thing', name: 'Espiritualidad' },
    { '@type': 'Thing', name: 'Autoconocimiento' },
    { '@type': 'Thing', name: 'Liderazgo' },
  ],
  author: { '@type': 'Person', name: 'Alexandre Havard', url: 'https://alexhavard.com' },
  publisher: { '@type': 'Organization', name: 'Virtuous Leadership', url: 'https://virtuousleadership.com' },
  numberOfQuestions: 32,
  timeRequired: 'PT15M',
};

export default function TestCorazon() {
  const { lang } = useT();
  const seo = HEART_SEO[lang] || HEART_SEO.es;
  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path="/tests/corazon-libre"
        schema={QUIZ_SCHEMA}
      />
      <TestHeart />
    </>
  );
}
