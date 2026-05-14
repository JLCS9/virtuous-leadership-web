import SEO from '../components/SEO';
import { useT } from '../i18n';
import LegalPageLayout, {
  H2, H3, P, UL, LI, Strong, ContactBox, Table,
} from '../components/LegalPageLayout';
import contentEs from '../data/legal/cookies.es';
import contentEn from '../data/legal/cookies.en';
import contentFr from '../data/legal/cookies.fr';
import contentRu from '../data/legal/cookies.ru';

const CONTENTS = { es: contentEs, en: contentEn, fr: contentFr, ru: contentRu };

export default function Cookies() {
  const { lang } = useT();
  const content = CONTENTS[lang] || CONTENTS.es;

  return (
    <>
      <SEO
        title={content.meta.title}
        description={content.meta.description}
        path={content.meta.path}
      />
      <LegalPageLayout
        eyebrow={content.eyebrow}
        title={content.pageTitle}
        lastUpdatedLabel={content.lastUpdatedLabel}
        lastUpdated={content.lastUpdated}
      >
        {content.body.map((section, idx) => renderSection(section, idx))}
      </LegalPageLayout>
    </>
  );
}

// Mismo renderer que PoliticaPrivacidad. Mantenemos una copia local en lugar
// de extraerlo a un helper compartido porque sólo se usa en estas 2 páginas
// y vivir aparte añade ceremonia para poco valor.

function renderSection(s, idx) {
  switch (s.type) {
    case 'h2':
      return <H2 key={idx}>{s.text}</H2>;
    case 'h3':
      return <H3 key={idx}>{s.text}</H3>;
    case 'p':
      return s.html
        ? <P key={idx} html={s.html} />
        : <P key={idx}>{s.text}</P>;
    case 'ul':
      return (
        <UL key={idx}>
          {s.items.map((it, ii) => (
            <LI key={ii}>
              {it.strong && <Strong>{it.strong}</Strong>}
              {it.html
                ? <span dangerouslySetInnerHTML={{ __html: it.html }} />
                : it.text}
            </LI>
          ))}
        </UL>
      );
    case 'contactBox':
      return (
        <ContactBox key={idx}>
          {s.lines.map((line, li) => (
            <div key={li}>
              <Strong>{line.label}</Strong>{' '}
              {line.html
                ? <span dangerouslySetInnerHTML={{ __html: line.html }} />
                : line.value}
            </div>
          ))}
        </ContactBox>
      );
    case 'table':
      return <Table key={idx} headers={s.headers} rows={s.rows} />;
    default:
      return null;
  }
}
