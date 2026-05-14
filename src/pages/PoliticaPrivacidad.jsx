import SEO from '../components/SEO';
import LegalPageLayout, { H2, P, UL, LI, Strong, ContactBox, Table } from '../components/LegalPageLayout';

// Política de Privacidad — sólo español por ahora.
// Contenido legal estático hardcodeado en JSX (no i18n) — se actualiza poco
// y mantener el copy junto al markup hace más fácil revisarlo.

export default function PoliticaPrivacidad() {
  return (
    <>
      <SEO
        title="Política de Privacidad | Virtuous Leadership"
        description="Política de Privacidad de Virtuous Leadership (CSO Digital). Información sobre el tratamiento de datos personales, derechos del usuario y encargados del tratamiento."
        path="/politica-de-privacidad"
      />
      <LegalPageLayout
        eyebrow="Información legal"
        title="Política de Privacidad"
        lastUpdated="14/05/2026"
      >
        <H2>1. Responsable del tratamiento</H2>
        <P>
          De conformidad con el Reglamento (UE) 2016/679 General de Protección de Datos
          (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos
          Personales y garantía de los derechos digitales (LOPDGDD), se informa al usuario
          de los siguientes datos del responsable del tratamiento:
        </P>
        <ContactBox>
          <div><Strong>Titular:</Strong> CSO Digital</div>
          <div><Strong>CIF:</Strong> B44568756</div>
          <div><Strong>Domicilio:</Strong> C/ Playa Calafell, nº 9, 28290</div>
          <div><Strong>Teléfono:</Strong> +34 682 277 426</div>
          <div><Strong>Correo electrónico:</Strong> <a href="mailto:info@csodigital.tech">info@csodigital.tech</a></div>
          <div><Strong>Sitio web:</Strong> <a href="http://virtuousleadership.com">virtuousleadership.com</a></div>
        </ContactBox>

        <H2>2. Finalidades del tratamiento</H2>
        <P>
          Los datos personales facilitados a través del sitio web de Virtuous Leadership
          se tratarán para las siguientes finalidades:
        </P>
        <UL>
          <LI><Strong>a) Gestión del test de temperamento (adultos):</Strong> recoger las
            respuestas del cuestionario, elaborar el perfil de temperamento del usuario,
            mostrarle los resultados, almacenarlos asociados a su cuenta o dirección de
            correo, y, en su caso, enviarle el informe correspondiente.</LI>
          <LI><Strong>b) Gestión del test de temperamento infantil:</Strong> recoger las
            respuestas proporcionadas por el padre, madre o tutor legal sobre el menor,
            elaborar el perfil de temperamento del niño/a, mostrar el informe al adulto
            responsable y conservarlo conforme a lo indicado en esta política.</LI>
          <LI><Strong>c) Atención de consultas,</Strong> solicitudes de información y
            comunicaciones dirigidas al responsable a través de formularios, correo
            electrónico u otros canales habilitados.</LI>
          <LI><Strong>d) Envío de comunicaciones comerciales o informativas</Strong> sobre
            productos, servicios, contenidos formativos o eventos relacionados con
            Virtuous Leadership, únicamente cuando el usuario lo haya consentido expresamente.</LI>
          <LI><Strong>e) Análisis estadístico agregado y mejora del servicio,</Strong>
            utilizando, siempre que sea posible, datos seudonimizados o anonimizados que
            no permitan identificar al usuario.</LI>
          <LI><Strong>f) Cumplimiento de las obligaciones legales</Strong> aplicables al
            responsable (fiscales, contables, mercantiles, de protección de datos, etc.).</LI>
        </UL>

        <H2>3. Categorías de datos tratados</H2>
        <P>Según la interacción del usuario con el sitio web, podrán tratarse las siguientes categorías de datos:</P>
        <UL>
          <LI><Strong>Datos identificativos y de contacto:</Strong> nombre, apellidos, correo electrónico y, en su caso, teléfono.</LI>
          <LI><Strong>Datos del test de temperamento adulto:</Strong> respuestas al cuestionario, perfil de temperamento resultante y fecha de realización.</LI>
          <LI><Strong>Datos del test de temperamento infantil:</Strong> nombre o alias del menor, edad o fecha de nacimiento, sexo (si se solicita), respuestas al cuestionario aportadas por el adulto responsable y perfil resultante. No se solicita ningún dato del menor que no sea estrictamente necesario para elaborar el perfil.</LI>
          <LI><Strong>Datos de navegación:</Strong> dirección IP, tipo de dispositivo, navegador, páginas visitadas, tiempo de permanencia y datos similares recogidos mediante cookies u otras tecnologías equivalentes, conforme a la Política de Cookies.</LI>
          <LI><Strong>Datos derivados de la comunicación</Strong> que el usuario nos remita voluntariamente.</LI>
        </UL>
        <P>
          No se solicitan categorías especiales de datos (salud, ideología, religión, etc.).
          Si el usuario incluyera voluntariamente este tipo de datos en sus comunicaciones,
          se tratarán únicamente para responder a su consulta y se eliminarán cuando dejen
          de ser necesarios.
        </P>

        <H2>4. Base legal del tratamiento</H2>
        <P>La legitimación para tratar tus datos personales se fundamenta en:</P>
        <UL>
          <LI><Strong>Consentimiento del interesado</Strong> (art. 6.1.a RGPD), prestado de forma libre, específica, informada e inequívoca al cumplimentar los formularios, marcar las casillas correspondientes o iniciar los tests.</LI>
          <LI><Strong>Ejecución de un contrato</Strong> o aplicación de medidas precontractuales (art. 6.1.b RGPD), cuando el tratamiento sea necesario para prestar el servicio solicitado.</LI>
          <LI><Strong>Cumplimiento de obligaciones legales</Strong> del responsable (art. 6.1.c RGPD).</LI>
          <LI><Strong>Interés legítimo</Strong> del responsable (art. 6.1.f RGPD) en analizar de forma agregada el uso del sitio web para mejorarlo, en los términos previstos en el Considerando 47 del RGPD.</LI>
        </UL>
        <P>
          El usuario puede retirar su consentimiento en cualquier momento, sin que ello
          afecte a la licitud del tratamiento previo a su retirada.
        </P>

        <H2>5. Datos de menores de edad — Test de temperamento infantil</H2>
        <P>
          El test de temperamento infantil está dirigido exclusivamente a ser cumplimentado
          por el padre, la madre o el tutor legal del menor, <Strong>nunca por el propio menor</Strong>.
        </P>
        <P>Antes de iniciar el test, el adulto responsable deberá:</P>
        <UL>
          <LI>Declarar expresamente ostentar la patria potestad o tutela legal sobre el menor.</LI>
          <LI>Consentir el tratamiento de los datos del menor para la finalidad descrita en el apartado 2.b.</LI>
          <LI>Confirmar que ha leído y comprendido la presente política.</LI>
        </UL>
        <P>
          De conformidad con el artículo 7 de la LOPDGDD, el tratamiento de datos personales
          de un menor de catorce años solo se considerará lícito si cuenta con el consentimiento
          del titular de la patria potestad o tutela. Para mayores de 14 años, el consentimiento
          del propio menor podrá ser válido en los términos previstos por la normativa.
        </P>
        <P>
          CSO Digital adoptará medidas razonables para verificar que el consentimiento ha
          sido efectivamente otorgado por el adulto responsable, pudiendo solicitar acreditación
          adicional si concurren dudas razonables sobre la edad del usuario o sobre la titularidad
          de la patria potestad o tutela.
        </P>
        <P>Los datos del menor:</P>
        <UL>
          <LI>Se tratarán con especial diligencia y confidencialidad.</LI>
          <LI>No se utilizarán para elaboración de perfiles comerciales ni se cederán a terceros con fines de marketing.</LI>
          <LI>Podrán suprimirse en cualquier momento a petición del adulto responsable.</LI>
        </UL>

        <H2>6. Plazo de conservación</H2>
        <UL>
          <LI><Strong>Datos del test de temperamento (adulto e infantil):</Strong> se conservarán mientras el usuario mantenga activa su cuenta o no solicite su supresión. Si no existe cuenta de usuario, los datos se conservarán por un máximo de 24 meses desde la realización del test, salvo que el usuario solicite previamente su supresión.</LI>
          <LI><Strong>Datos de consultas y comunicaciones:</Strong> durante el tiempo necesario para atender la solicitud y, posteriormente, durante los plazos legales de prescripción de posibles responsabilidades.</LI>
          <LI><Strong>Datos para envío de comunicaciones comerciales:</Strong> hasta que el usuario revoque el consentimiento o se dé de baja.</LI>
          <LI><Strong>Datos sometidos a obligaciones legales:</Strong> durante los plazos legalmente establecidos (por ejemplo, 6 años en materia mercantil, 4 años en materia fiscal).</LI>
        </UL>
        <P>Transcurridos los plazos anteriores, los datos serán suprimidos o anonimizados.</P>

        <H2>7. Destinatarios y encargados del tratamiento</H2>
        <P>Los datos personales no se cederán a terceros salvo:</P>
        <UL>
          <LI>Cuando exista una obligación legal de comunicación a Administraciones Públicas, jueces o tribunales.</LI>
          <LI>A proveedores de servicios que actúen como encargados del tratamiento, con quienes CSO Digital ha suscrito el correspondiente contrato conforme al artículo 28 RGPD.</LI>
        </UL>
        <P>Actualmente, los principales encargados del tratamiento son:</P>
        <Table
          headers={['Proveedor', 'Finalidad', 'Ubicación']}
          rows={[
            ['Hostinger International Ltd.', 'Servicios de hosting y alojamiento web', 'UE / EEE'],
            ['Sendinblue SAS (Brevo)', 'Plataforma de email marketing y envío de comunicaciones', 'Francia (UE)'],
            ['Supabase Inc.', 'Almacenamiento de datos en la nube y gestión de base de datos', 'EE. UU. (con garantías adecuadas)'],
          ]}
        />
        <P>
          El usuario puede solicitar información detallada sobre estos encargados escribiendo a{' '}
          <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.
        </P>

        <H2>8. Transferencias internacionales de datos</H2>
        <P>
          Algunos de los proveedores mencionados, en particular Supabase Inc., pueden tratar datos
          fuera del Espacio Económico Europeo (EEE). En tales casos, las transferencias internacionales
          se realizan únicamente bajo alguna de las garantías previstas en el Capítulo V del RGPD,
          en particular:
        </P>
        <UL>
          <LI>Decisión de adecuación de la Comisión Europea (por ejemplo, EU–U.S. Data Privacy Framework para EE. UU., cuando el proveedor esté certificado).</LI>
          <LI>Cláusulas Contractuales Tipo aprobadas por la Comisión Europea.</LI>
          <LI>Otras garantías adecuadas conforme al artículo 46 RGPD.</LI>
        </UL>
        <P>
          El usuario puede solicitar copia de dichas garantías escribiendo a{' '}
          <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.
        </P>

        <H2>9. Derechos del usuario</H2>
        <P>Como interesado, puedes ejercer en cualquier momento los siguientes derechos:</P>
        <UL>
          <LI><Strong>Acceso</Strong> a tus datos personales.</LI>
          <LI><Strong>Rectificación</Strong> de datos inexactos o incompletos.</LI>
          <LI><Strong>Supresión</Strong> ("derecho al olvido") cuando concurran las circunstancias legalmente previstas.</LI>
          <LI><Strong>Limitación</Strong> del tratamiento.</LI>
          <LI><Strong>Oposición</Strong> al tratamiento.</LI>
          <LI><Strong>Portabilidad</Strong> de los datos a otro responsable.</LI>
          <LI><Strong>No ser objeto de decisiones automatizadas</Strong> con efectos jurídicos o significativos.</LI>
          <LI><Strong>Retirar el consentimiento</Strong> prestado, en cualquier momento.</LI>
        </UL>
        <P>
          Para ejercerlos, basta con enviar una solicitud a <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>
          {' '}o a la dirección postal indicada en el apartado 1, identificándose adecuadamente e indicando el
          derecho que se desea ejercer. Se podrá solicitar copia de documento identificativo si existen
          dudas razonables sobre la identidad del solicitante.
        </P>
        <P>
          En el caso del test de temperamento infantil, los derechos relativos al menor serán ejercidos
          por su padre, madre o tutor legal.
        </P>
        <P>
          Asimismo, si consideras que el tratamiento no se ajusta a la normativa vigente, tienes derecho a
          presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>;
          C/ Jorge Juan 6, 28001 Madrid).
        </P>

        <H2>10. Medidas de seguridad</H2>
        <P>
          CSO Digital ha adoptado las medidas técnicas y organizativas apropiadas para garantizar un nivel
          de seguridad adecuado al riesgo del tratamiento, conforme al artículo 32 RGPD, incluyendo, entre otras:
        </P>
        <UL>
          <LI>Cifrado en tránsito (HTTPS/TLS).</LI>
          <LI>Control de accesos basado en roles.</LI>
          <LI>Copias de seguridad periódicas.</LI>
          <LI>Registros de actividad.</LI>
          <LI>Formación del personal con acceso a datos.</LI>
          <LI>Revisiones periódicas de las medidas implantadas.</LI>
        </UL>
        <P>
          En caso de violación de seguridad que afecte a los datos personales, se notificará a la Agencia
          Española de Protección de Datos y, cuando proceda, a los interesados, en los plazos legalmente
          establecidos.
        </P>

        <H2>11. Cookies</H2>
        <P>
          El sitio web utiliza cookies propias y/o de terceros conforme a lo dispuesto en la{' '}
          <a href="/es/cookies">Política de Cookies</a>, a la que se remite expresamente.
        </P>

        <H2>12. Modificaciones de la política</H2>
        <P>
          CSO Digital se reserva el derecho de modificar esta Política de Privacidad para adaptarla a
          novedades legislativas, jurisprudenciales o a los servicios ofrecidos. Cualquier modificación
          sustancial será comunicada a los usuarios por los canales habituales y publicada en esta misma
          página, indicando la fecha de la última actualización.
        </P>

        <H2>13. Legislación aplicable y jurisdicción</H2>
        <P>
          La presente política se rige por la legislación española y de la Unión Europea aplicable en
          materia de protección de datos personales. Para la resolución de cualquier controversia, las
          partes se someten a los Juzgados y Tribunales del domicilio del responsable, salvo cuando el
          usuario tenga la condición legal de consumidor, en cuyo caso será competente el órgano
          jurisdiccional que corresponda conforme a la normativa aplicable.
        </P>
      </LegalPageLayout>
    </>
  );
}
