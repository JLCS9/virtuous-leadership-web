// Cookies Policy — English version. Faithful translation of the Spanish
// source. In case of discrepancy, the Spanish version prevails.

export default {
  meta: {
    title: 'Cookies Policy | Virtuous Leadership',
    description: 'Cookies Policy of Virtuous Leadership: types of cookies used, purpose, duration and how to manage or disable them.',
    path: '/cookies',
  },
  eyebrow: 'Legal information',
  pageTitle: 'Cookies Policy',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: '14/06/2026',
  body: [
    { type: 'h2', text: '1. What are cookies?' },
    { type: 'p',  text: 'A cookie is a small text file that a website installs on the user browser or device (computer, smartphone, tablet) when visited. Cookies allow the website to remember information about the visit, such as preferred language, logged-in session or browsing preferences, making the next visit easier and the site more useful.' },
    { type: 'p',  text: 'Along with cookies, other storage and tracking technologies with equivalent functionality are also used, such as pixels, web beacons, local storage, session storage or tags. All of them are subject to this policy, although for simplicity they are generically referred to as "cookies".' },
    { type: 'p',  text: 'The use of cookies is regulated in Spain by article 22.2 of Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE), as well as by Regulation (EU) 2016/679 (GDPR) and Organic Law 3/2018 (LOPDGDD), in accordance with the Guide on the use of cookies of the Spanish Data Protection Agency (AEPD).' },

    { type: 'h2', text: '2. Cookie controller' },
    { type: 'contactBox', lines: [
      { label: 'Owner:', value: 'CSO Digital' },
      { label: 'Tax ID (CIF):', value: 'B44568756' },
      { label: 'Address:', value: 'C/ Playa Calafell, no. 9, 28290' },
      { label: 'Email:', html: '<a href="mailto:info@csodigital.tech">info@csodigital.tech</a>' },
      { label: 'Website:', html: '<a href="http://virtuousleadership.com">virtuousleadership.com</a>' },
    ]},

    { type: 'h2', text: '3. Types of cookies used' },

    { type: 'h3', text: '3.1. By the entity managing them' },
    { type: 'ul', items: [
      { strong: 'First-party cookies:', text: ' those sent to the user terminal equipment from equipment or domain managed by CSO Digital.' },
      { strong: 'Third-party cookies:', text: ' those sent from equipment or domain not managed by CSO Digital, but by another entity that processes data obtained through cookies.' },
    ]},

    { type: 'h3', text: '3.2. By purpose' },
    { type: 'ul', items: [
      { strong: 'Technical or strictly necessary cookies:', text: ' enable navigation and the use of basic website functions (login, security, cart management, cookie consent storage, etc.). They do not require consent according to art. 22.2 LSSI-CE.' },
      { strong: 'Preference or personalization cookies:', text: ' allow remembering information so that the user accesses the service with certain characteristics (language, region, etc.).' },
      { strong: 'Analytics or measurement cookies:', text: ' enable quantifying the number of users and analyzing their behavior in aggregate form to improve the site.' },
      { strong: 'Behavioral advertising cookies:', text: ' store information about user behavior to display personalized advertising.' },
    ]},

    { type: 'h3', text: '3.3. By duration' },
    { type: 'ul', items: [
      { strong: 'Session cookies:', text: ' deleted when closing the browser.' },
      { strong: 'Persistent cookies:', text: ' stored for a defined period of time, retrievable by the controller.' },
    ]},

    { type: 'h2', text: '4. Cookies used on this website' },
    { type: 'p',  html: 'The cookies currently used on virtuousleadership.com are detailed below. The list is kept up to date; if you notice any discrepancy, we appreciate you letting us know at <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },

    { type: 'h3', text: '4.1. Technical cookies (exempt from consent)' },
    { type: 'table', headers: ['Cookie', 'Provider', 'Purpose', 'Duration'], rows: [
      ['cookie_consent', 'virtuousleadership.com (first-party)', 'Store user preferences about cookies', '12 months'],
      ['sb-access-token / sb-refresh-token', 'Supabase (first-party, managed by Supabase)', 'Maintain the authenticated user session on the platform and tests', 'Session / until logout'],
      ['__cf_bm / cf_clearance', 'Hostinger / Cloudflare', 'Security, bot detection and protection against abusive access', '30 minutes / 1 year'],
      ['PHPSESSID or equivalent', 'Hostinger', 'Server technical session maintenance', 'Session'],
    ]},

    { type: 'h3', text: '4.2. Analytics cookies (require consent)' },
    { type: 'table', headers: ['Cookie', 'Provider', 'Purpose', 'Duration'], rows: [
      ['_ga, _ga_*', 'Google Analytics (Google Ireland Ltd.)', 'Distinguish users and sessions anonymously to measure site use', 'Up to 2 years'],
      ['_gid', 'Google Analytics', 'Distinguish users', '24 hours'],
    ]},

    { type: 'h3', text: '4.3. Marketing and communications cookies (require consent)' },
    { type: 'table', headers: ['Cookie / pixel', 'Provider', 'Purpose', 'Duration'], rows: [
      ['Tracking pixel for opens and clicks', 'Brevo (Sendinblue SAS)', 'Measure interaction with email communications (opens, clicks)', 'Variable'],
    ]},

    { type: 'h3', text: '4.4. Social media cookies (where applicable)' },
    { type: 'p',  text: 'If at any time buttons or embedded content from social networks (YouTube, Instagram, LinkedIn, X, Facebook, etc.) are integrated, those platforms may install their own cookies on the user browser, governed by their respective privacy policies. Currently, no social media integrations that install cookies without prior consent are used.' },

    { type: 'h2', text: '5. International data transfers' },
    { type: 'p',  text: 'Some cookie providers (in particular Google Analytics and, where applicable, Supabase Inc.) may involve an international transfer of personal data to the United States. Such transfers are made under the safeguards provided in Chapter V of the GDPR, including, where applicable, the EU–U.S. Data Privacy Framework and/or Standard Contractual Clauses approved by the European Commission.' },
    { type: 'p',  html: 'More information: see the corresponding section of the <a href="/en/privacy-policy">Privacy Policy</a>.' },

    { type: 'h2', text: '6. Consent' },
    { type: 'p',  text: 'The first time you access the site, a cookie banner is displayed through which you can:' },
    { type: 'ul', items: [
      { text: 'Accept all cookies.' },
      { text: 'Reject all non-strictly-necessary cookies (with the same ease and prominence as the accept option).' },
      { text: 'Configure your preference by category (technical, analytics, marketing, etc.).' },
    ]},
    { type: 'p',  text: 'Until you state your option, only strictly necessary technical cookies will be installed. The given consent expires 24 months after granting or renewal, in accordance with the AEPD Cookies Guide, at which time it will be requested again.' },
    { type: 'p',  text: 'You may modify or withdraw your consent at any time by accessing the cookie configuration panel available in the footer of the website (link "Configure cookies") or by deleting the cookies stored in your browser according to section 7.' },

    { type: 'h2', text: '7. How to manage and disable cookies in your browser' },
    { type: 'p',  text: 'In addition to the site configuration panel, you can manage, block or delete cookies directly from your browser settings. Below, the official links:' },
    { type: 'ul', items: [
      { strong: 'Google Chrome:', html: ' <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">support.google.com/chrome/answer/95647</a>' },
      { strong: 'Mozilla Firefox:', html: ' <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">support.mozilla.org</a>' },
      { strong: 'Microsoft Edge:', html: ' <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">support.microsoft.com</a>' },
      { strong: 'Safari (macOS / iOS):', html: ' <a href="https://support.apple.com/en-us/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">support.apple.com</a>' },
      { strong: 'Opera:', html: ' <a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">help.opera.com</a>' },
    ]},
    { type: 'p',  html: 'You can also use specific third-party tools to control cookie use, such as the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.' },
    { type: 'p',  html: '<strong>Important:</strong> disabling technical cookies may prevent the site or the temperament tests from working correctly (e.g., not remembering responses or not allowing login).' },

    { type: 'h2', text: '8. Cookies policy updates' },
    { type: 'p',  text: 'CSO Digital may modify this Cookies Policy based on legislative or regulatory requirements, or to adapt the policy to instructions issued by the Spanish Data Protection Agency, as well as when tools or cookies used are modified. For this reason, the user is recommended to review it every time they access the website.' },
    { type: 'p',  text: 'When significant changes occur, the user will be notified through a notice on the website itself and/or consent will be requested again.' },

    { type: 'h2', text: '9. More information' },
    { type: 'p',  html: 'For any question about the use of cookies on this website, you can contact CSO Digital at <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },
    { type: 'p',  html: 'For more information, you can consult the <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener noreferrer">Guide on the use of cookies</a> published by the Spanish Data Protection Agency.' },
  ],
};
