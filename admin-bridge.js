// ══════════════════════════════════════════════════════
//  admin-bridge.js — Integra o Painel Admin com o Site
//  Inclua este script no index.html (antes do </body>)
// ══════════════════════════════════════════════════════

(function () {
  'use strict';

  function ls(key) {
    try { return JSON.parse(localStorage.getItem('connect_admin_' + key)); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    localStorage.setItem('connect_admin_' + key, JSON.stringify(val));
  }

  // ── 1. RASTREAR LEAD (clique no WhatsApp) ──────────
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a[href="#whatsapp"]');
    if (!el) return;

    var cidade = sessionStorage.getItem('cidadeEscolhida') || '—';
    var plano = (function () {
      var card = el.closest('.card-modern, .card-featured-modern, .card');
      if (card) {
        var t = card.querySelector('h3');
        if (t) return (t.innerText || t.textContent).trim();
      }
      return '—';
    })();

    var leads = ls('leads') || [];
    leads.push({
      acao: 'Clique WhatsApp',
      cidade: cidade,
      plano: plano,
      data: new Date().toLocaleString('pt-BR'),
      ts: Date.now()
    });
    lsSet('leads', leads);

    // Dispara webhook se configurado
    var apiData = ls('api') || {};
    if (apiData.wh_lead && apiData.int_n8n) {
      var payload = {
        evento: 'lead_capturado',
        timestamp: new Date().toISOString(),
        origem: 'site_connect',
        lead: {
          cidade: cidade,
          plano_interesse: plano,
          pagina: window.location.href
        }
      };
      fetch(apiData.wh_lead, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(function () { /* silencioso */ });
    }
  });

  // ── 2. RASTREAR CIDADE NÃO ATENDIDA ───────────────
  var btnAvise = document.getElementById('cidade-btn-avise');
  if (btnAvise) {
    btnAvise.addEventListener('click', function () {
      var leads = ls('leads') || [];
      leads.push({
        acao: 'Cidade não atendida',
        cidade: '—',
        plano: '—',
        data: new Date().toLocaleString('pt-BR'),
        ts: Date.now()
      });
      lsSet('leads', leads);

      // Webhook cidade não atendida
      var apiData = ls('api') || {};
      if (apiData.wh_naoatende && apiData.int_n8n) {
        fetch(apiData.wh_naoatende, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ evento: 'cidade_nao_atendida', timestamp: new Date().toISOString() })
        }).catch(function () { });
      }
    });
  }

  // ── 3. CONTAR VISITAS ─────────────────────────────
  (function () {
    var hoje = new Date().toDateString();
    var visitaData = ls('visita_data');
    if (visitaData !== hoje) {
      lsSet('visitas', 1);
      lsSet('visita_data', hoje);
    } else {
      var v = ls('visitas') || 0;
      lsSet('visitas', v + 1);
    }
  })();

  // ── 4. APLICAR NÚMERO DE WHATSAPP DO PAINEL ───────
  (function () {
    var empresa = ls('empresa');
    if (empresa && empresa.whatsapp) {
      // Sobrescreve o WHATSAPP_NUMBER do script.js se existir
      if (typeof window.WHATSAPP_NUMBER !== 'undefined') {
        window.WHATSAPP_NUMBER = empresa.whatsapp;
      }
    }
  })();

  // ── 5. INJETAR MARKETING / TRACKING DO PAINEL ────
  (function () {
    var mkt = ls('marketing');
    if (!mkt) return;

    // Google Tag Manager
    if (mkt.gtm && mkt.gtm.trim() && !document.getElementById('gtm-bridge')) {
      var gtmId = mkt.gtm.trim();
      // Só injeta se diferente do que já está no HTML
      if (gtmId !== 'GTM-KZWSCQJ8') {
        (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
          j.async = true; j.id = 'gtm-bridge';
          j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', gtmId);
      }
    }

    // Meta Pixel
    if (mkt.fbpixel && mkt.fbpixel.trim() && !window.fbqLoaded) {
      window.fbqLoaded = true;
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', mkt.fbpixel.trim());
      window.fbq('track', 'PageView');

      // Evento de lead no clique do WhatsApp
      document.addEventListener('click', function (e2) {
        if (e2.target.closest('a[href="#whatsapp"]')) {
          window.fbq('track', mkt['fb-event'] || 'Lead');
        }
      });
    }

    // GA4
    if (mkt.ga4 && mkt.ga4.trim() && !window.ga4Loaded) {
      window.ga4Loaded = true;
      var ga4Script = document.createElement('script');
      ga4Script.async = true;
      ga4Script.src = 'https://www.googletagmanager.com/gtag/js?id=' + mkt.ga4.trim();
      document.head.appendChild(ga4Script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', mkt.ga4.trim());
    }

    // TikTok Pixel
    if (mkt.tiktok && mkt.tiktok.trim() && !window.ttqLoaded) {
      window.ttqLoaded = true;
      !function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = w[t] = w[t] || [];
        ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
        ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e };
        ttq.load = function (e, n) { var i = '//analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {}; var o = document.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = i + '?sdkid=' + e + '&lib=' + t; var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a) };
        ttq.load(mkt.tiktok.trim()); ttq.page();
      }(window, document, 'ttq');
    }

    // Scripts personalizados
    if (mkt['script-head'] && mkt['script-head'].trim()) {
      var div = document.createElement('div');
      div.innerHTML = mkt['script-head'];
      document.head.appendChild(div.firstChild);
    }
    if (mkt['script-body'] && mkt['script-body'].trim()) {
      var divB = document.createElement('div');
      divB.innerHTML = mkt['script-body'];
      document.body.appendChild(divB.firstChild);
    }
  })();

  console.log('✅ Connect Admin Bridge carregado');
})();
