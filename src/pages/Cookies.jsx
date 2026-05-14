import SEO from '../components/SEO';
import LegalPageLayout, { H2, H3, P, UL, LI, Strong, ContactBox, Table } from '../components/LegalPageLayout';

export default function Cookies() {
  return (
    <>
      <SEO
        title="Política de Cookies | Virtuous Leadership"
        description="Política de Cookies de Virtuous Leadership: tipos de cookies utilizadas, finalidad, duración y cómo gestionarlas o desactivarlas."
        path="/cookies"
      />
      <LegalPageLayout
        eyebrow="Información legal"
        title="Política de Cookies"
        lastUpdated="14/06/2026"
      >
        <H2>1. ¿Qué son las cookies?</H2>
        <P>
          Una cookie es un pequeño fichero de texto que un sitio web instala en el navegador
          o dispositivo del usuario (ordenador, smartphone, tablet) al visitarlo. Las cookies
          permiten al sitio web recordar información sobre la visita, como el idioma preferido,
          la sesión iniciada o las preferencias de navegación, facilitando la próxima visita y
          haciendo el sitio más útil.
        </P>
        <P>
          Junto a las cookies, se utilizan también otras tecnologías de almacenamiento y seguimiento
          con funcionalidad equivalente, como píxeles, web beacons, local storage, session storage o
          etiquetas. A todas ellas les resulta aplicable la presente política, aunque por simplicidad
          se denominen genéricamente "cookies".
        </P>
        <P>
          El uso de cookies está regulado en España por el artículo 22.2 de la Ley 34/2002, de Servicios
          de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), así como por el Reglamento
          (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), conforme a la Guía sobre el uso de
          cookies de la Agencia Española de Protección de Datos (AEPD).
        </P>

        <H2>2. Responsable del uso de cookies</H2>
        <ContactBox>
          <div><Strong>Titular:</Strong> CSO Digital</div>
          <div><Strong>CIF:</Strong> B44568756</div>
          <div><Strong>Domicilio:</Strong> C/ Playa Calafell, nº 9, 28290</div>
          <div><Strong>Correo electrónico:</Strong> <a href="mailto:info@csodigital.tech">info@csodigital.tech</a></div>
          <div><Strong>Sitio web:</Strong> <a href="http://virtuousleadership.com">virtuousleadership.com</a></div>
        </ContactBox>

        <H2>3. Tipología de cookies utilizadas</H2>

        <H3>3.1. Según la entidad que las gestiona</H3>
        <UL>
          <LI><Strong>Cookies propias:</Strong> las enviadas al equipo terminal del usuario desde un equipo o dominio gestionado por CSO Digital.</LI>
          <LI><Strong>Cookies de terceros:</Strong> las enviadas desde un equipo o dominio que no es gestionado por CSO Digital, sino por otra entidad que trata los datos obtenidos a través de las cookies.</LI>
        </UL>

        <H3>3.2. Según su finalidad</H3>
        <UL>
          <LI><Strong>Cookies técnicas o estrictamente necesarias:</Strong> permiten la navegación y la utilización de las funciones básicas del sitio web (inicio de sesión, seguridad, gestión de la cesta de compra, almacenamiento del consentimiento de cookies, etc.). No requieren consentimiento conforme al art. 22.2 LSSI-CE.</LI>
          <LI><Strong>Cookies de preferencias o personalización:</Strong> permiten recordar información para que el usuario acceda al servicio con determinadas características (idioma, región, etc.).</LI>
          <LI><Strong>Cookies de análisis o medición:</Strong> permiten cuantificar el número de usuarios y analizar de forma agregada su comportamiento para mejorar el sitio.</LI>
          <LI><Strong>Cookies de publicidad comportamental:</Strong> almacenan información del comportamiento del usuario para mostrar publicidad personalizada.</LI>
        </UL>

        <H3>3.3. Según su duración</H3>
        <UL>
          <LI><Strong>Cookies de sesión:</Strong> se eliminan al cerrar el navegador.</LI>
          <LI><Strong>Cookies persistentes:</Strong> permanecen almacenadas durante un período de tiempo definido, pudiendo ser consultadas por el responsable.</LI>
        </UL>

        <H2>4. Cookies utilizadas en este sitio web</H2>
        <P>
          A continuación se detallan las cookies que actualmente se utilizan en virtuousleadership.com.
          El listado se mantiene actualizado; si detectas alguna discrepancia, te agradecemos que nos
          lo comuniques en <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.
        </P>

        <H3>4.1. Cookies técnicas (exentas de consentimiento)</H3>
        <Table
          headers={['Cookie', 'Proveedor', 'Finalidad', 'Duración']}
          rows={[
            ['cookie_consent', 'virtuousleadership.com (propia)', 'Almacenar las preferencias del usuario sobre el uso de cookies', '12 meses'],
            ['sb-access-token / sb-refresh-token', 'Supabase (propia, gestionada por Supabase)', 'Mantener la sesión autenticada del usuario en la plataforma y los tests', 'Sesión / hasta cierre de sesión'],
            ['__cf_bm / cf_clearance', 'Hostinger / Cloudflare', 'Seguridad, detección de bots y protección frente a accesos abusivos', '30 minutos / 1 año'],
            ['PHPSESSID o equivalente', 'Hostinger', 'Mantenimiento de la sesión técnica del servidor', 'Sesión'],
          ]}
        />

        <H3>4.2. Cookies de análisis (requieren consentimiento)</H3>
        <Table
          headers={['Cookie', 'Proveedor', 'Finalidad', 'Duración']}
          rows={[
            ['_ga, _ga_*', 'Google Analytics (Google Ireland Ltd.)', 'Distinguir usuarios y sesiones de forma anónima para medir el uso del sitio', 'Hasta 2 años'],
            ['_gid', 'Google Analytics', 'Distinguir usuarios', '24 horas'],
          ]}
        />

        <H3>4.3. Cookies de marketing y comunicaciones (requieren consentimiento)</H3>
        <Table
          headers={['Cookie / píxel', 'Proveedor', 'Finalidad', 'Duración']}
          rows={[
            ['Píxel de seguimiento de aperturas y clics', 'Brevo (Sendinblue SAS)', 'Medir la interacción con las comunicaciones enviadas por correo electrónico (aperturas, clics)', 'Variable'],
          ]}
        />

        <H3>4.4. Cookies de redes sociales (si aplica)</H3>
        <P>
          Si en algún momento se integran botones o contenidos embebidos de redes sociales (YouTube,
          Instagram, LinkedIn, X, Facebook, etc.), dichas plataformas podrán instalar cookies propias
          en el navegador del usuario, regidas por sus respectivas políticas de privacidad. Actualmente,
          no se utilizan integraciones de redes sociales que instalen cookies sin consentimiento previo.
        </P>

        <H2>5. Transferencias internacionales de datos</H2>
        <P>
          Algunos proveedores de cookies (en particular Google Analytics y, en su caso, Supabase Inc.)
          pueden suponer una transferencia internacional de datos personales a Estados Unidos. Dichas
          transferencias se realizan al amparo de las garantías previstas en el Capítulo V del RGPD,
          incluyendo, según el caso, el EU–U.S. Data Privacy Framework y/o las Cláusulas Contractuales
          Tipo aprobadas por la Comisión Europea.
        </P>
        <P>
          Más información: ver el apartado correspondiente de la{' '}
          <a href="/es/politica-de-privacidad">Política de Privacidad</a>.
        </P>

        <H2>6. Consentimiento</H2>
        <P>La primera vez que accedes al sitio se muestra un banner de cookies mediante el cual puedes:</P>
        <UL>
          <LI>Aceptar todas las cookies.</LI>
          <LI>Rechazar todas las cookies no estrictamente necesarias (con la misma facilidad y prominencia que la opción de aceptar).</LI>
          <LI>Configurar tu preferencia por categorías (técnicas, análisis, marketing, etc.).</LI>
        </UL>
        <P>
          Mientras no manifiestes tu opción, únicamente se instalarán las cookies técnicas estrictamente
          necesarias. El consentimiento prestado caduca a los 24 meses desde su otorgamiento o renovación,
          conforme a la Guía de cookies de la AEPD, momento en el cual se volverá a solicitar.
        </P>
        <P>
          Puedes modificar o retirar tu consentimiento en cualquier momento accediendo al panel de
          configuración de cookies disponible en el pie de página del sitio web (enlace "Configurar
          cookies") o eliminando las cookies almacenadas en tu navegador conforme al apartado 7.
        </P>

        <H2>7. Cómo gestionar y deshabilitar las cookies en tu navegador</H2>
        <P>
          Además del panel de configuración del sitio, puedes administrar, bloquear o eliminar las
          cookies directamente desde la configuración de tu navegador. A continuación, los enlaces oficiales:
        </P>
        <UL>
          <LI><Strong>Google Chrome:</Strong> <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">support.google.com/chrome/answer/95647</a></LI>
          <LI><Strong>Mozilla Firefox:</Strong> <a href="https://support.mozilla.org/es/kb/proteccion-mejorada-contra-rastreo-firefox-escrit" target="_blank" rel="noopener noreferrer">support.mozilla.org</a></LI>
          <LI><Strong>Microsoft Edge:</Strong> <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">support.microsoft.com</a></LI>
          <LI><Strong>Safari (macOS / iOS):</Strong> <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">support.apple.com</a></LI>
          <LI><Strong>Opera:</Strong> <a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">help.opera.com</a></LI>
        </UL>
        <P>
          Igualmente, puedes utilizar herramientas específicas de terceros para controlar el uso de
          cookies, como el{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Add-on de inhabilitación para navegadores de Google Analytics
          </a>.
        </P>
        <P>
          <Strong>Importante:</Strong> la desactivación de cookies técnicas puede impedir el correcto
          funcionamiento del sitio o de los tests de temperamento (por ejemplo, no recordar las respuestas
          o no permitir iniciar sesión).
        </P>

        <H2>8. Actualizaciones de la política de cookies</H2>
        <P>
          CSO Digital podrá modificar esta Política de Cookies en función de exigencias legislativas,
          reglamentarias, o con la finalidad de adaptar dicha política a las instrucciones dictadas por
          la Agencia Española de Protección de Datos, así como cuando se modifiquen las herramientas o
          cookies utilizadas. Por este motivo, se recomienda al usuario revisarla cada vez que acceda
          al sitio web.
        </P>
        <P>
          Cuando se produzcan cambios significativos, se notificará al usuario mediante un aviso en el
          propio sitio web y/o se volverá a solicitar el consentimiento.
        </P>

        <H2>9. Más información</H2>
        <P>
          Para cualquier duda sobre el uso de cookies en este sitio web, puedes contactar con CSO Digital
          en <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.
        </P>
        <P>
          Para más información, puedes consultar la{' '}
          <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener noreferrer">
            Guía sobre el uso de cookies
          </a>
          {' '}publicada por la Agencia Española de Protección de Datos.
        </P>
      </LegalPageLayout>
    </>
  );
}
