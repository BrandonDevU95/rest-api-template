(() => {
  const NAV_ID = 'docs-topbar-nav';

  const ensureNav = () => {
    if (document.getElementById(NAV_ID)) {
      return;
    }

    const topbar = document.querySelector('.swagger-ui .topbar');
    if (!topbar) {
      return;
    }

    const wrapper = topbar.querySelector('.topbar-wrapper');
    if (!wrapper) {
      return;
    }

    const nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.className = 'docs-nav';
    nav.setAttribute('aria-label', 'Navegacion de documentacion');

    const apiDocsLink = document.createElement('a');
    apiDocsLink.href = '/api-docs';
    apiDocsLink.className = 'docs-nav-link is-active';
    apiDocsLink.textContent = 'Swagger API Docs';
    apiDocsLink.setAttribute('aria-current', 'page');

    const docsHubLink = document.createElement('a');
    docsHubLink.href = '/documentation';
    docsHubLink.className = 'docs-nav-link';
    docsHubLink.textContent = 'Centro de Documentacion';
    docsHubLink.setAttribute('aria-label', 'Ir al centro de documentacion');

    nav.appendChild(apiDocsLink);
    nav.appendChild(docsHubLink);
    wrapper.appendChild(nav);
  };

  // Swagger UI renders asynchronously; poll briefly and stop once attached.
  let attempts = 0;
  const maxAttempts = 80;
  const interval = setInterval(() => {
    ensureNav();
    attempts += 1;

    if (document.getElementById(NAV_ID) || attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 100);
})();
