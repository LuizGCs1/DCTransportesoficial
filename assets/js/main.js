function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  function enviarCurriculo() {
    showToast('✅ Currículo enviado com sucesso! Entraremos em contato.');
  }

  function enviarAgregado() {
    showToast('✅ Cadastro enviado! Logo entraremos em contato para alinhar o frete.');
  }

  function enviarContato() {
    showToast('✅ Mensagem enviada! Responderemos em breve.');
  }

  (function(){
    const siteNav = document.getElementById('site-nav');
    const menuButton = document.querySelector('.mobile-menu-btn');
    const menuLinks = document.querySelectorAll('.nav-links a');

    if (siteNav && menuButton) {
      menuButton.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('menu-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
      });

      menuLinks.forEach((link) => {
        link.addEventListener('click', () => {
          siteNav.classList.remove('menu-open');
          menuButton.setAttribute('aria-expanded', 'false');
        });
      });
    }

    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const sectionLabels = {
      hero: 'Início',
      sobre: 'Sobre',
      servicos: 'Serviços',
      diferenciais: 'Diferenciais',
      cambio: 'Câmbio',
      curriculo: 'Trabalhe Conosco',
      contato: 'Fale Conosco'
    };
    const sections = Object.keys(sectionLabels)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!breadcrumbCurrent || !sections.length) return;

    function updateBreadcrumb() {
      const scrollPosition = window.scrollY + 150;
      let currentSection = sections[0];

      sections.forEach((section) => {
        if (section.offsetTop <= scrollPosition) currentSection = section;
      });

      breadcrumbCurrent.textContent = sectionLabels[currentSection.id] || 'Início';
      const breadcrumb = breadcrumbCurrent.closest('.breadcrumb');
      breadcrumb?.classList.toggle('is-hero', currentSection.id === 'hero');
      breadcrumb?.classList.toggle('is-sobre', currentSection.id === 'sobre');
      breadcrumb?.classList.toggle('is-contato', currentSection.id === 'contato');
    }

    updateBreadcrumb();
    window.addEventListener('scroll', updateBreadcrumb, { passive: true });
  })();

  (function(){
    const currencies = [
      { code: 'ARS', country: 'Argentina', name: 'Peso argentino' },
      { code: 'BOB', country: 'Bolívia', name: 'Boliviano' },
      { code: 'CLP', country: 'Chile', name: 'Peso chileno' },
      { code: 'COP', country: 'Colombia', name: 'Peso colombiano' },
      { code: 'USD', country: 'Equador', name: 'Dólar americano' },
      { code: 'GYD', country: 'Guiana', name: 'Dólar guianense' },
      { code: 'PYG', country: 'Paraguai', name: 'Guarani paraguaio' },
      { code: 'PEN', country: 'Peru', name: 'Sol peruano' },
      { code: 'SRD', country: 'Suriname', name: 'Dólar surinamês' },
      { code: 'UYU', country: 'Uruguai', name: 'Peso uruguaio' },
      { code: 'VES', country: 'Venezuela', name: 'Bolívar venezuelano' },
      { code: 'EUR', country: 'Guiana Francesa', name: 'Euro' }
    ];

    const fallbackRates = {
      ARS: 195, BOB: 1.25, CLP: 170, COP: 750, USD: 0.18, GYD: 38,
      PYG: 1350, PEN: 0.67, SRD: 6.5, UYU: 7.2, VES: 6.5, EUR: 0.17
    };

    const amountInput = document.getElementById('brl-amount');
    const targetSelect = document.getElementById('currency-target');
    const resultEl = document.getElementById('currency-result');
    const statusEl = document.getElementById('currency-status');
    const gridEl = document.getElementById('currency-grid');
    if (!amountInput || !targetSelect || !resultEl || !statusEl || !gridEl) return;

    let rates = fallbackRates;
    let ratesSource = 'offline';

    function getAmount() {
      const value = Number(String(amountInput.value).replace(',', '.'));
      return Number.isFinite(value) && value > 0 ? value : 0;
    }

    function formatCurrency(value, code) {
      try {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: code,
          maximumFractionDigits: code === 'CLP' || code === 'PYG' ? 0 : 2
        }).format(value);
      } catch (e) {
        return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' ' + code;
      }
    }

    function renderOptions() {
      targetSelect.innerHTML = currencies.map((currency) => (
        `<option value="${currency.code}">${currency.country} - ${currency.name} (${currency.code})</option>`
      )).join('');
    }

    function renderConversion() {
      const amount = getAmount();
      const code = targetSelect.value || currencies[0].code;
      const rate = rates[code] || 0;
      resultEl.textContent = formatCurrency(amount * rate, code);

      const featuredCodes = ['USD', 'ARS', 'CLP', 'COP', 'BOB', 'PYG'];
      const featuredCurrencies = featuredCodes
        .map((code) => currencies.find((currency) => currency.code === code))
        .filter(Boolean);

      gridEl.innerHTML = featuredCurrencies.map((currency) => {
        const converted = formatCurrency(amount * (rates[currency.code] || 0), currency.code);
        return `
          <div class="cambio-card">
            <div class="pais">${currency.country}</div>
            <strong>${currency.code}</strong>
            <span>${converted}</span>
          </div>
        `;
      }).join('');
    }

    function updateStatus(dateText) {
      if (ratesSource === 'online') {
        statusEl.textContent = `Cotações carregadas online${dateText ? ' em ' + dateText : ''}. Valores sujeitos a variação.`;
      } else {
        statusEl.textContent = 'Cotações online indisponíveis no momento. Exibindo valores de referência temporários.';
      }
    }

    async function loadRates() {
      renderOptions();
      renderConversion();
      updateStatus();

      try {
        const response = await fetch('https://open.er-api.com/v6/latest/BRL');
        if (!response.ok) throw new Error('Falha ao carregar cotações');
        const data = await response.json();
        const nextRates = {};
        currencies.forEach((currency) => {
          if (data.rates && typeof data.rates[currency.code] === 'number') {
            nextRates[currency.code] = data.rates[currency.code];
          }
        });
        if (Object.keys(nextRates).length < currencies.length - 1) throw new Error('Cotações incompletas');
        rates = { ...fallbackRates, ...nextRates };
        ratesSource = 'online';
        renderConversion();
        updateStatus(data.time_last_update_utc || '');
      } catch (e) {
        ratesSource = 'offline';
        renderConversion();
        updateStatus();
      }
    }

    amountInput.addEventListener('input', renderConversion);
    targetSelect.addEventListener('change', renderConversion);
    loadRates();
  })();

  // Accessibility widget behavior (enhanced)
  (function(){
    const aToggle = document.getElementById('a11y-toggle');
    const aPanel = document.getElementById('a11y-panel');
    const aClose = document.getElementById('a11y-close');
    const body = document.body;
    const cards = Array.from(document.querySelectorAll('.a11y-card'));
    let speaking = false;
    let ttsActive = false;
    let currentMode = null; // 'contrast-dark' | 'contrast-light' | 'highlight-links' | null

    function setMode(mode) {
      // toggle off if same mode clicked
      if (currentMode === mode) {
        body.classList.remove('a11y-contrast-dark','a11y-contrast-light','a11y-highlight-links');
        currentMode = null;
        showToast('Modo de acessibilidade desativado');
        return;
      }
      body.classList.remove('a11y-contrast-dark','a11y-contrast-light','a11y-highlight-links');
      if (mode === 'contrast-dark') body.classList.add('a11y-contrast-dark');
      if (mode === 'contrast-light') body.classList.add('a11y-contrast-light');
      if (mode === 'highlight-links') body.classList.add('a11y-highlight-links');
      currentMode = mode;
      if (mode === 'contrast-dark') showToast('Alto contraste escuro ativado');
      if (mode === 'contrast-light') showToast('Alto contraste claro ativado');
      if (mode === 'highlight-links') showToast('Links destacados');
    }

    function speakText(text) {
      if (!('speechSynthesis' in window)) { showToast('Leitor de tela não suportado neste navegador'); return; }
      window.speechSynthesis.cancel();
      const txt = (text||'').replace(/\s+/g,' ').trim().slice(0,600);
      if (!txt) return;
      const utter = new SpeechSynthesisUtterance(txt);
      utter.lang = 'pt-BR'; utter.rate = 1.0;
      window.speechSynthesis.speak(utter); speaking = true;
      utter.onend = () => { speaking = false; };
    }

    // hover-to-speak implementation
    let lastReadKey = null;
    function onDocMouseOver(e) {
      if (!ttsActive) return;
      const el = e.target;
      if (!el) return;
      // Skip form inputs to avoid interference
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
      // find nearest readable ancestor
      const closest = el.closest('p,h1,h2,h3,h4,li,a,label,button,span,div');
      if (!closest) return;
      // Don't read from inside form fields
      if (closest.querySelector('input') || closest.querySelector('textarea') || closest.querySelector('select')) return;
      const text = closest.innerText || closest.textContent || '';
      if (!text) return;
      const key = text.trim().slice(0,80);
      if (key === lastReadKey) return;
      lastReadKey = key;
      speakText(text);
    }

    function enableHoverTTS() {
      if (ttsActive) return; ttsActive = true;
      document.addEventListener('mouseover', onDocMouseOver);
      showToast('Leitor por movimento ativado: passe o mouse sobre o texto');
    }

    function disableHoverTTS() {
      if (!ttsActive) return; ttsActive = false;
      window.speechSynthesis.cancel(); lastReadKey = null;
      document.removeEventListener('mouseover', onDocMouseOver);
      showToast('Leitor desativado');
    }

    function openPanel() { aPanel.classList.add('show'); aPanel.setAttribute('aria-hidden','false'); aToggle.setAttribute('aria-expanded','true'); cards[0]?.focus(); }
    function closePanel() { aPanel.classList.remove('show'); aPanel.setAttribute('aria-hidden','true'); aToggle.setAttribute('aria-expanded','false'); aToggle.focus(); }

    aToggle.addEventListener('click', (e) => { e.stopPropagation(); if (aPanel.classList.contains('show')) closePanel(); else openPanel(); });
    aClose.addEventListener('click', closePanel);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
      if (e.key === 'Tab' && aPanel.classList.contains('show')) {
        const focusable = Array.from(aPanel.querySelectorAll('button'));
        if (!focusable.length) return;
        const idx = focusable.indexOf(document.activeElement);
        if (e.shiftKey && idx === 0) { focusable[focusable.length-1].focus(); e.preventDefault(); }
        else if (!e.shiftKey && idx === focusable.length-1) { focusable[0].focus(); e.preventDefault(); }
      }
    });

    document.addEventListener('click', (e) => { 
      // Don't close panel if clicking on form inputs
      const isFormElement = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
      if (!isFormElement && !aPanel.contains(e.target) && e.target !== aToggle) closePanel(); 
    });

    aPanel.addEventListener('click', (e) => {
      const btn = e.target.closest('.a11y-card');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (!action) return;
      if (action === 'tts') {
        if (ttsActive) disableHoverTTS(); else enableHoverTTS();
      } else {
        setMode(action);
      }
    });

    // keyboard activation on cards
    cards.forEach(c => { c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } }); });

    // Prevent event propagation on form inputs
    const allInputs = document.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
      input.addEventListener('click', (e) => { e.stopPropagation(); }, false);
      input.addEventListener('mousedown', (e) => { e.stopPropagation(); }, false);
      input.addEventListener('mouseup', (e) => { e.stopPropagation(); }, false);
    });
  })();


