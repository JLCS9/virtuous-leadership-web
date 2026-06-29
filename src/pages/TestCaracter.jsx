import TestCharacter from '../TestCharacter';
import SEO from '../components/SEO';
import { useT } from '../i18n';

// Metas SEO por idioma. Optimizadas para queries de "test de carácter" y
// "virtudes". El test se basa en el modelo de A. Havard (6 virtudes).
const CHARACTER_SEO = {
  es: {
    title: 'Test de Carácter Online Gratis | Virtuous Leadership',
    description: 'Test oficial de carácter de Virtuous Leadership basado en el modelo de las 6 virtudes de Alexandre Havard. Mide tu crecimiento en prudencia, fortaleza, autodominio, justicia, magnanimidad y humildad. 68 preguntas, 10 minutos, resultado inmediato y gratis.',
  },
  en: {
    title: 'Free Online Character Test | Virtuous Leadership',
    description: 'Virtuous Leadership\'s official character test based on Alexandre Havard\'s 6-virtues model. Measure your growth in prudence, courage, self-mastery, justice, magnanimity and humility. 68 questions, 10 minutes, instant free result.',
  },
  fr: {
    title: 'Test de Caractère Gratuit en Ligne | Virtuous Leadership',
    description: 'Test officiel de caractère de Virtuous Leadership basé sur le modèle des 6 vertus d\'Alexandre Havard. Mesurez votre progression en prudence, courage, maîtrise de soi, justice, magnanimité et humilité. 68 questions, 10 minutes, résultat instantané et gratuit.',
  },
  ru: {
    title: 'Бесплатный онлайн-тест на характер | Virtuous Leadership',
    description: 'Официальный тест на характер Virtuous Leadership на основе модели 6 добродетелей Александра Авара. Измерьте ваш рост в благоразумии, мужестве, самообладании, справедливости, великодушии и смирении. 68 вопросов, 10 минут, бесплатный результат.',
  },
};

const QUIZ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Test de Carácter',
  alternateName: ['Character Test', 'Test de Caractère', 'Тест на характер'],
  url: 'https://virtuousleadership.com/tests/caracter',
  description: 'Test oficial de carácter basado en el modelo de las seis virtudes (prudencia, fortaleza, autodominio, justicia, magnanimidad, humildad) de Alexandre Havard.',
  educationalLevel: 'all',
  inLanguage: ['es', 'en', 'fr', 'ru'],
  isAccessibleForFree: true,
  about: [
    { '@type': 'Thing', name: 'Carácter' },
    { '@type': 'Thing', name: 'Virtudes' },
    { '@type': 'Thing', name: 'Autoconocimiento' },
    { '@type': 'Thing', name: 'Liderazgo' },
  ],
  author: { '@type': 'Person', name: 'Alexandre Havard', url: 'https://alexhavard.com' },
  publisher: { '@type': 'Organization', name: 'Virtuous Leadership', url: 'https://virtuousleadership.com' },
  numberOfQuestions: 68,
  timeRequired: 'PT10M',
};

export default function TestCaracter() {
  const { lang } = useT();
  const seo = CHARACTER_SEO[lang] || CHARACTER_SEO.es;
  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path="/tests/caracter"
        schema={QUIZ_SCHEMA}
      />
      <TestCharacter />
    </>
  );
}
