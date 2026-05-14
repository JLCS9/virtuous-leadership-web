// Política de Cookies — contenido en español. Mismo formato data-driven que privacy.

export default {
  meta: {
    title: 'Política de Cookies | Virtuous Leadership',
    description: 'Política de Cookies de Virtuous Leadership: tipos de cookies utilizadas, finalidad, duración y cómo gestionarlas o desactivarlas.',
    path: '/cookies',
  },
  eyebrow: 'Información legal',
  pageTitle: 'Política de Cookies',
  lastUpdatedLabel: 'Última actualización',
  lastUpdated: '14/06/2026',
  body: [
    { type: 'h2', text: '1. ¿Qué son las cookies?' },
    { type: 'p',  text: 'Una cookie es un pequeño fichero de texto que un sitio web instala en el navegador o dispositivo del usuario (ordenador, smartphone, tablet) al visitarlo. Las cookies permiten al sitio web recordar información sobre la visita, como el idioma preferido, la sesión iniciada o las preferencias de navegación, facilitando la próxima visita y haciendo el sitio más útil.' },
    { type: 'p',  text: 'Junto a las cookies, se utilizan también otras tecnologías de almacenamiento y seguimiento con funcionalidad equivalente, como píxeles, web beacons, local storage, session storage o etiquetas. A todas ellas les resulta aplicable la presente política, aunque por simplicidad se denominen genéricamente "cookies".' },
    { type: 'p',  text: 'El uso de cookies está regulado en España por el artículo 22.2 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), así como por el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), conforme a la Guía sobre el uso de cookies de la Agencia Española de Protección de Datos (AEPD).' },

    { type: 'h2', text: '2. Responsable del uso de cookies' },
    { type: 'contactBox', lines: [
      { label: 'Titular:', value: 'CSO Digital' },
      { label: 'CIF:', value: 'B44568756' },
      { label: 'Domicilio:', value: 'C/ Playa Calafell, nº 9, 28290' },
      { label: 'Correo electrónico:', html: '<a href="mailto:info@csodigital.tech">info@csodigital.tech</a>' },
      { label: 'Sitio web:', html: '<a href="http://virtuousleadership.com">virtuousleadership.com</a>' },
    ]},

    { type: 'h2', text: '3. Tipología de cookies utilizadas' },

    { type: 'h3', text: '3.1. Según la entidad que las gestiona' },
    { type: 'ul', items: [
      { strong: 'Cookies propias:', text: ' las enviadas al equipo terminal del usuario desde un equipo o dominio gestionado por CSO Digital.' },
      { strong: 'Cookies de terceros:', text: ' las enviadas desde un equipo o dominio que no es gestionado por CSO Digital, sino por otra entidad que trata los datos obtenidos a través de las cookies.' },
    ]},

    { type: 'h3', text: '3.2. Según su finalidad' },
    { type: 'ul', items: [
      { strong: 'Cookies técnicas o estrictamente necesarias:', text: ' permiten la navegación y la utilización de las funciones básicas del sitio web (inicio de sesión, seguridad, gestión de la cesta de compra, almacenamiento del consentimiento de cookies, etc.). No requieren consentimiento conforme al art. 22.2 LSSI-CE.' },
      { strong: 'Cookies de preferencias o personalización:', text: ' permiten recordar información para que el usuario acceda al servicio con determinadas características (idioma, región, etc.).' },
      { strong: 'Cookies de análisis o medición:', text: ' permiten cuantificar el número de usuarios y analizar de forma agregada su comportamiento para mejorar el sitio.' },
      { strong: 'Cookies de publicidad comportamental:', text: ' almacenan información del comportamiento del usuario para mostrar publicidad personalizada.' },
    ]},

    { type: 'h3', text: '3.3. Según su duración' },
    { type: 'ul', items: [
      { strong: 'Cookies de sesión:', text: ' se eliminan al cerrar el navegador.' },
      { strong: 'Cookies persistentes:', text: ' permanecen almacenadas durante un período de tiempo definido, pudiendo ser consultadas por el responsable.' },
    ]},

    { type: 'h2', text: '4. Cookies utilizadas en este sitio web' },
    { type: 'p',  html: 'A continuación se detallan las cookies que actualmente se utilizan en virtuousleadership.com. El listado se mantiene actualizado; si detectas alguna discrepancia, te agradecemos que nos lo comuniques en <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },

    { type: 'h3', text: '4.1. Cookies técnicas (exentas de consentimiento)' },
    { type: 'table', headers: ['Cookie', 'Proveedor', 'Finalidad', 'Duración'], rows: [
      ['cookie_consent', 'virtuousleadership.com (propia)', 'Almacenar las preferencias del usuario sobre el uso de cookies', '12 meses'],
      ['sb-access-token / sb-refresh-token', 'Supabase (propia, gestionada por Supabase)', 'Mantener la sesión autenticada del usuario en la plataforma y los tests', 'Sesión / hasta cierre de sesión'],
      ['__cf_bm / cf_clearance', 'Hostinger / Cloudflare', 'Seguridad, detección de bots y protección frente a accesos abusivos', '30 minutos / 1 año'],
      ['PHPSESSID o equivalente', 'Hostinger', 'Mantenimiento de la sesión técnica del servidor', 'Sesión'],
    ]},

    { type: 'h3', text: '4.2. Cookies de análisis (requieren consentimiento)' },
    { type: 'table', headers: ['Cookie', 'Proveedor', 'Finalidad', 'Duración'], rows: [
      ['_ga, _ga_*', 'Google Analytics (Google Ireland Ltd.)', 'Distinguir usuarios y sesiones de forma anónima para medir el uso del sitio', 'Hasta 2 años'],
      ['_gid', 'Google Analytics', 'Distinguir usuarios', '24 horas'],
    ]},

    { type: 'h3', text: '4.3. Cookies de marketing y comunicaciones (requieren consentimiento)' },
    { type: 'table', headers: ['Cookie / píxel', 'Proveedor', 'Finalidad', 'Duración'], rows: [
      ['Píxel de seguimiento de aperturas y clics', 'Brevo (Sendinblue SAS)', 'Medir la interacción con las comunicaciones enviadas por correo electrónico (aperturas, clics)', 'Variable'],
    ]},

    { type: 'h3', text: '4.4. Cookies de redes sociales (si aplica)' },
    { type: 'p',  text: 'Si en algún momento se integran botones o contenidos embebidos de redes sociales (YouTube, Instagram, LinkedIn, X, Facebook, etc.), dichas plataformas podrán instalar cookies propias en el navegador del usuario, regidas por sus respectivas políticas de privacidad. Actualmente, no se utilizan integraciones de redes sociales que instalen cookies sin consentimiento previo.' },

    { type: 'h2', text: '5. Transferencias internacionales de datos' },
    { type: 'p',  text: 'Algunos proveedores de cookies (en particular Google Analytics y, en su caso, Supabase Inc.) pueden suponer una transferencia internacional de datos personales a Estados Unidos. Dichas transferencias se realizan al amparo de las garantías previstas en el Capítulo V del RGPD, incluyendo, según el caso, el EU–U.S. Data Privacy Framework y/o las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.' },
    { type: 'p',  html: 'Más información: ver el apartado correspondiente de la <a href="/es/politica-de-privacidad">Política de Privacidad</a>.' },

    { type: 'h2', text: '6. Consentimiento' },
    { type: 'p',  text: 'La primera vez que accedes al sitio se muestra un banner de cookies mediante el cual puedes:' },
    { type: 'ul', items: [
      { text: 'Aceptar todas las cookies.' },
      { text: 'Rechazar todas las cookies no estrictamente necesarias (con la misma facilidad y prominencia que la opción de aceptar).' },
      { text: 'Configurar tu preferencia por categorías (técnicas, análisis, marketing, etc.).' },
    ]},
    { type: 'p',  text: 'Mientras no manifiestes tu opción, únicamente se instalarán las cookies técnicas estrictamente necesarias. El consentimiento prestado caduca a los 24 meses desde su otorgamiento o renovación, conforme a la Guía de cookies de la AEPD, momento en el cual se volverá a solicitar.' },
    { type: 'p',  text: 'Puedes modificar o retirar tu consentimiento en cualquier momento accediendo al panel de configuración de cookies disponible en el pie de página del sitio web (enlace "Configurar cookies") o eliminando las cookies almacenadas en tu navegador conforme al apartado 7.' },

    { type: 'h2', text: '7. Cómo gestionar y deshabilitar las cookies en tu navegador' },
    { type: 'p',  text: 'Además del panel de configuración del sitio, puedes administrar, bloquear o eliminar las cookies directamente desde la configuración de tu navegador. A continuación, los enlaces oficiales:' },
    { type: 'ul', items: [
      { strong: 'Google Chrome:', html: ' <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">support.google.com/chrome/answer/95647</a>' },
      { strong: 'Mozilla Firefox:', html: ' <a href="https://support.mozilla.org/es/kb/proteccion-mejorada-contra-rastreo-firefox-escrit" target="_blank" rel="noopener noreferrer">support.mozilla.org</a>' },
      { strong: 'Microsoft Edge:', html: ' <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">support.microsoft.com</a>' },
      { strong: 'Safari (macOS / iOS):', html: ' <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">support.apple.com</a>' },
      { strong: 'Opera:', html: ' <a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">help.opera.com</a>' },
    ]},
    { type: 'p',  html: 'Igualmente, puedes utilizar herramientas específicas de terceros para controlar el uso de cookies, como el <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Add-on de inhabilitación para navegadores de Google Analytics</a>.' },
    { type: 'p',  html: '<strong>Importante:</strong> la desactivación de cookies técnicas puede impedir el correcto funcionamiento del sitio o de los tests de temperamento (por ejemplo, no recordar las respuestas o no permitir iniciar sesión).' },

    { type: 'h2', text: '8. Actualizaciones de la política de cookies' },
    { type: 'p',  text: 'CSO Digital podrá modificar esta Política de Cookies en función de exigencias legislativas, reglamentarias, o con la finalidad de adaptar dicha política a las instrucciones dictadas por la Agencia Española de Protección de Datos, así como cuando se modifiquen las herramientas o cookies utilizadas. Por este motivo, se recomienda al usuario revisarla cada vez que acceda al sitio web.' },
    { type: 'p',  text: 'Cuando se produzcan cambios significativos, se notificará al usuario mediante un aviso en el propio sitio web y/o se volverá a solicitar el consentimiento.' },

    { type: 'h2', text: '9. Más información' },
    { type: 'p',  html: 'Para cualquier duda sobre el uso de cookies en este sitio web, puedes contactar con CSO Digital en <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },
    { type: 'p',  html: 'Para más información, puedes consultar la <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener noreferrer">Guía sobre el uso de cookies</a> publicada por la Agencia Española de Protección de Datos.' },
  ],
};
