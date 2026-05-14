// Política de Privacidad — contenido en español.
// Formato data-driven: el componente PoliticaPrivacidad.jsx itera `body` y
// renderiza cada sección según su `type`. Para añadir/editar contenido aquí
// no hace falta tocar JSX — sólo este fichero.

export default {
  meta: {
    title: 'Política de Privacidad | Virtuous Leadership',
    description: 'Política de Privacidad de Virtuous Leadership (CSO Digital). Información sobre el tratamiento de datos personales, derechos del usuario y encargados del tratamiento.',
    path: '/politica-de-privacidad',
  },
  eyebrow: 'Información legal',
  pageTitle: 'Política de Privacidad',
  lastUpdatedLabel: 'Última actualización',
  lastUpdated: '14/05/2026',
  body: [
    { type: 'h2', text: '1. Responsable del tratamiento' },
    { type: 'p',  text: 'De conformidad con el Reglamento (UE) 2016/679 General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa al usuario de los siguientes datos del responsable del tratamiento:' },
    { type: 'contactBox', lines: [
      { label: 'Titular:', value: 'CSO Digital' },
      { label: 'CIF:', value: 'B44568756' },
      { label: 'Domicilio:', value: 'C/ Playa Calafell, nº 9, 28290' },
      { label: 'Teléfono:', value: '+34 682 277 426' },
      { label: 'Correo electrónico:', html: '<a href="mailto:info@csodigital.tech">info@csodigital.tech</a>' },
      { label: 'Sitio web:', html: '<a href="http://virtuousleadership.com">virtuousleadership.com</a>' },
    ]},

    { type: 'h2', text: '2. Finalidades del tratamiento' },
    { type: 'p',  text: 'Los datos personales facilitados a través del sitio web de Virtuous Leadership se tratarán para las siguientes finalidades:' },
    { type: 'ul', items: [
      { strong: 'a) Gestión del test de temperamento (adultos):', text: ' recoger las respuestas del cuestionario, elaborar el perfil de temperamento del usuario, mostrarle los resultados, almacenarlos asociados a su cuenta o dirección de correo, y, en su caso, enviarle el informe correspondiente.' },
      { strong: 'b) Gestión del test de temperamento infantil:', text: ' recoger las respuestas proporcionadas por el padre, madre o tutor legal sobre el menor, elaborar el perfil de temperamento del niño/a, mostrar el informe al adulto responsable y conservarlo conforme a lo indicado en esta política.' },
      { strong: 'c) Atención de consultas,', text: ' solicitudes de información y comunicaciones dirigidas al responsable a través de formularios, correo electrónico u otros canales habilitados.' },
      { strong: 'd) Envío de comunicaciones comerciales o informativas', text: ' sobre productos, servicios, contenidos formativos o eventos relacionados con Virtuous Leadership, únicamente cuando el usuario lo haya consentido expresamente.' },
      { strong: 'e) Análisis estadístico agregado y mejora del servicio,', text: ' utilizando, siempre que sea posible, datos seudonimizados o anonimizados que no permitan identificar al usuario.' },
      { strong: 'f) Cumplimiento de las obligaciones legales', text: ' aplicables al responsable (fiscales, contables, mercantiles, de protección de datos, etc.).' },
    ]},

    { type: 'h2', text: '3. Categorías de datos tratados' },
    { type: 'p',  text: 'Según la interacción del usuario con el sitio web, podrán tratarse las siguientes categorías de datos:' },
    { type: 'ul', items: [
      { strong: 'Datos identificativos y de contacto:', text: ' nombre, apellidos, correo electrónico y, en su caso, teléfono.' },
      { strong: 'Datos del test de temperamento adulto:', text: ' respuestas al cuestionario, perfil de temperamento resultante y fecha de realización.' },
      { strong: 'Datos del test de temperamento infantil:', text: ' nombre o alias del menor, edad o fecha de nacimiento, sexo (si se solicita), respuestas al cuestionario aportadas por el adulto responsable y perfil resultante. No se solicita ningún dato del menor que no sea estrictamente necesario para elaborar el perfil.' },
      { strong: 'Datos de navegación:', text: ' dirección IP, tipo de dispositivo, navegador, páginas visitadas, tiempo de permanencia y datos similares recogidos mediante cookies u otras tecnologías equivalentes, conforme a la Política de Cookies.' },
      { strong: 'Datos derivados de la comunicación', text: ' que el usuario nos remita voluntariamente.' },
    ]},
    { type: 'p',  text: 'No se solicitan categorías especiales de datos (salud, ideología, religión, etc.). Si el usuario incluyera voluntariamente este tipo de datos en sus comunicaciones, se tratarán únicamente para responder a su consulta y se eliminarán cuando dejen de ser necesarios.' },

    { type: 'h2', text: '4. Base legal del tratamiento' },
    { type: 'p',  text: 'La legitimación para tratar tus datos personales se fundamenta en:' },
    { type: 'ul', items: [
      { strong: 'Consentimiento del interesado', text: ' (art. 6.1.a RGPD), prestado de forma libre, específica, informada e inequívoca al cumplimentar los formularios, marcar las casillas correspondientes o iniciar los tests.' },
      { strong: 'Ejecución de un contrato', text: ' o aplicación de medidas precontractuales (art. 6.1.b RGPD), cuando el tratamiento sea necesario para prestar el servicio solicitado.' },
      { strong: 'Cumplimiento de obligaciones legales', text: ' del responsable (art. 6.1.c RGPD).' },
      { strong: 'Interés legítimo', text: ' del responsable (art. 6.1.f RGPD) en analizar de forma agregada el uso del sitio web para mejorarlo, en los términos previstos en el Considerando 47 del RGPD.' },
    ]},
    { type: 'p',  text: 'El usuario puede retirar su consentimiento en cualquier momento, sin que ello afecte a la licitud del tratamiento previo a su retirada.' },

    { type: 'h2', text: '5. Datos de menores de edad — Test de temperamento infantil' },
    { type: 'p',  html: 'El test de temperamento infantil está dirigido exclusivamente a ser cumplimentado por el padre, la madre o el tutor legal del menor, <strong>nunca por el propio menor</strong>.' },
    { type: 'p',  text: 'Antes de iniciar el test, el adulto responsable deberá:' },
    { type: 'ul', items: [
      { text: 'Declarar expresamente ostentar la patria potestad o tutela legal sobre el menor.' },
      { text: 'Consentir el tratamiento de los datos del menor para la finalidad descrita en el apartado 2.b.' },
      { text: 'Confirmar que ha leído y comprendido la presente política.' },
    ]},
    { type: 'p',  text: 'De conformidad con el artículo 7 de la LOPDGDD, el tratamiento de datos personales de un menor de catorce años solo se considerará lícito si cuenta con el consentimiento del titular de la patria potestad o tutela. Para mayores de 14 años, el consentimiento del propio menor podrá ser válido en los términos previstos por la normativa.' },
    { type: 'p',  text: 'CSO Digital adoptará medidas razonables para verificar que el consentimiento ha sido efectivamente otorgado por el adulto responsable, pudiendo solicitar acreditación adicional si concurren dudas razonables sobre la edad del usuario o sobre la titularidad de la patria potestad o tutela.' },
    { type: 'p',  text: 'Los datos del menor:' },
    { type: 'ul', items: [
      { text: 'Se tratarán con especial diligencia y confidencialidad.' },
      { text: 'No se utilizarán para elaboración de perfiles comerciales ni se cederán a terceros con fines de marketing.' },
      { text: 'Podrán suprimirse en cualquier momento a petición del adulto responsable.' },
    ]},

    { type: 'h2', text: '6. Plazo de conservación' },
    { type: 'ul', items: [
      { strong: 'Datos del test de temperamento (adulto e infantil):', text: ' se conservarán mientras el usuario mantenga activa su cuenta o no solicite su supresión. Si no existe cuenta de usuario, los datos se conservarán por un máximo de 24 meses desde la realización del test, salvo que el usuario solicite previamente su supresión.' },
      { strong: 'Datos de consultas y comunicaciones:', text: ' durante el tiempo necesario para atender la solicitud y, posteriormente, durante los plazos legales de prescripción de posibles responsabilidades.' },
      { strong: 'Datos para envío de comunicaciones comerciales:', text: ' hasta que el usuario revoque el consentimiento o se dé de baja.' },
      { strong: 'Datos sometidos a obligaciones legales:', text: ' durante los plazos legalmente establecidos (por ejemplo, 6 años en materia mercantil, 4 años en materia fiscal).' },
    ]},
    { type: 'p',  text: 'Transcurridos los plazos anteriores, los datos serán suprimidos o anonimizados.' },

    { type: 'h2', text: '7. Destinatarios y encargados del tratamiento' },
    { type: 'p',  text: 'Los datos personales no se cederán a terceros salvo:' },
    { type: 'ul', items: [
      { text: 'Cuando exista una obligación legal de comunicación a Administraciones Públicas, jueces o tribunales.' },
      { text: 'A proveedores de servicios que actúen como encargados del tratamiento, con quienes CSO Digital ha suscrito el correspondiente contrato conforme al artículo 28 RGPD.' },
    ]},
    { type: 'p',  text: 'Actualmente, los principales encargados del tratamiento son:' },
    { type: 'table', headers: ['Proveedor', 'Finalidad', 'Ubicación'], rows: [
      ['Hostinger International Ltd.', 'Servicios de hosting y alojamiento web', 'UE / EEE'],
      ['Sendinblue SAS (Brevo)', 'Plataforma de email marketing y envío de comunicaciones', 'Francia (UE)'],
      ['Supabase Inc.', 'Almacenamiento de datos en la nube y gestión de base de datos', 'EE. UU. (con garantías adecuadas)'],
    ]},
    { type: 'p',  html: 'El usuario puede solicitar información detallada sobre estos encargados escribiendo a <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },

    { type: 'h2', text: '8. Transferencias internacionales de datos' },
    { type: 'p',  text: 'Algunos de los proveedores mencionados, en particular Supabase Inc., pueden tratar datos fuera del Espacio Económico Europeo (EEE). En tales casos, las transferencias internacionales se realizan únicamente bajo alguna de las garantías previstas en el Capítulo V del RGPD, en particular:' },
    { type: 'ul', items: [
      { text: 'Decisión de adecuación de la Comisión Europea (por ejemplo, EU–U.S. Data Privacy Framework para EE. UU., cuando el proveedor esté certificado).' },
      { text: 'Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.' },
      { text: 'Otras garantías adecuadas conforme al artículo 46 RGPD.' },
    ]},
    { type: 'p',  html: 'El usuario puede solicitar copia de dichas garantías escribiendo a <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },

    { type: 'h2', text: '9. Derechos del usuario' },
    { type: 'p',  text: 'Como interesado, puedes ejercer en cualquier momento los siguientes derechos:' },
    { type: 'ul', items: [
      { strong: 'Acceso', text: ' a tus datos personales.' },
      { strong: 'Rectificación', text: ' de datos inexactos o incompletos.' },
      { strong: 'Supresión', text: ' ("derecho al olvido") cuando concurran las circunstancias legalmente previstas.' },
      { strong: 'Limitación', text: ' del tratamiento.' },
      { strong: 'Oposición', text: ' al tratamiento.' },
      { strong: 'Portabilidad', text: ' de los datos a otro responsable.' },
      { strong: 'No ser objeto de decisiones automatizadas', text: ' con efectos jurídicos o significativos.' },
      { strong: 'Retirar el consentimiento', text: ' prestado, en cualquier momento.' },
    ]},
    { type: 'p',  html: 'Para ejercerlos, basta con enviar una solicitud a <a href="mailto:info@csodigital.tech">info@csodigital.tech</a> o a la dirección postal indicada en el apartado 1, identificándose adecuadamente e indicando el derecho que se desea ejercer. Se podrá solicitar copia de documento identificativo si existen dudas razonables sobre la identidad del solicitante.' },
    { type: 'p',  text: 'En el caso del test de temperamento infantil, los derechos relativos al menor serán ejercidos por su padre, madre o tutor legal.' },
    { type: 'p',  html: 'Asimismo, si consideras que el tratamiento no se ajusta a la normativa vigente, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>; C/ Jorge Juan 6, 28001 Madrid).' },

    { type: 'h2', text: '10. Medidas de seguridad' },
    { type: 'p',  text: 'CSO Digital ha adoptado las medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo del tratamiento, conforme al artículo 32 RGPD, incluyendo, entre otras:' },
    { type: 'ul', items: [
      { text: 'Cifrado en tránsito (HTTPS/TLS).' },
      { text: 'Control de accesos basado en roles.' },
      { text: 'Copias de seguridad periódicas.' },
      { text: 'Registros de actividad.' },
      { text: 'Formación del personal con acceso a datos.' },
      { text: 'Revisiones periódicas de las medidas implantadas.' },
    ]},
    { type: 'p',  text: 'En caso de violación de seguridad que afecte a los datos personales, se notificará a la Agencia Española de Protección de Datos y, cuando proceda, a los interesados, en los plazos legalmente establecidos.' },

    { type: 'h2', text: '11. Cookies' },
    { type: 'p',  html: 'El sitio web utiliza cookies propias y/o de terceros conforme a lo dispuesto en la <a href="/es/cookies">Política de Cookies</a>, a la que se remite expresamente.' },

    { type: 'h2', text: '12. Modificaciones de la política' },
    { type: 'p',  text: 'CSO Digital se reserva el derecho de modificar esta Política de Privacidad para adaptarla a novedades legislativas, jurisprudenciales o a los servicios ofrecidos. Cualquier modificación sustancial será comunicada a los usuarios por los canales habituales y publicada en esta misma página, indicando la fecha de la última actualización.' },

    { type: 'h2', text: '13. Legislación aplicable y jurisdicción' },
    { type: 'p',  text: 'La presente política se rige por la legislación española y de la Unión Europea aplicable en materia de protección de datos personales. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales del domicilio del responsable, salvo cuando el usuario tenga la condición legal de consumidor, en cuyo caso será competente el órgano jurisdiccional que corresponda conforme a la normativa aplicable.' },
  ],
};
