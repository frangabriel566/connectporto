// ══════════════════════════════════════════════════════
//  admin-bridge.js — Integra o Painel Admin com o Site
//  Toda alteração salva no painel reflete aqui em tempo real
// ══════════════════════════════════════════════════════

(function () {
  'use strict';

  function ls(key) {
    try { return JSON.parse(localStorage.getItem('connect_admin_' + key)); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    localStorage.setItem('connect_admin_' + key, JSON.stringify(val));
  }

  // ── RESET: limpa planos antigos com "Consulte" ──────
  (function() {
    try {
      var p = JSON.parse(localStorage.getItem('connect_admin_planos'));
      if (p && p[0] && (p[0].preco === 'Consulte' || !p[0].preco)) {
        localStorage.removeItem('connect_admin_planos');
      }
    } catch(e) {}
  })();

  // ── DEFAULTS ────────────────────────────────────────
  var DEFAULT_PLANOS = [
    { nome: '600 Megas', velocidade: '600', preco: 'R$ 84,90', badge: '', features: ['Ideal para uso básico', 'Navegação e redes sociais', 'Vídeos em HD'] },
    { nome: '700 Megas', velocidade: '700', preco: 'R$ 89,90', badge: '', features: ['Internet estável e rápida', 'Streaming em HD sem travamentos', 'Perfeito para uso diário'] },
    { nome: '800 Megas', velocidade: '800', preco: 'R$ 99,90', badge: '', features: ['Conexão para vários dispositivos', 'Streaming Full HD sem interrupções', 'Jogos online sem lag', 'Excelente custo-benefício'] },
    { nome: '900 Megas', velocidade: '900', preco: 'R$ 109,90', badge: '📺 + HUB TOP', features: ['Streaming 4K com qualidade total', 'Home office', 'Downloads rápidos e estáveis'] },
    { nome: '1 GIGA',   velocidade: '1000', preco: 'R$ 119,90', badge: '🎬 + MAX ou TELECINE',    features: ['Ultra velocidade para toda a família', '4K simultâneo sem travar', 'Ultra-rápido'] },
    { nome: '1 GIGA',   velocidade: '1000', preco: 'R$ 129,90', badge: '⚽ + PREMIER ou COMBAT', features: ['Ultra velocidade para toda a família', '4K simultâneo sem travar', 'Esportes ao vivo'] }
  ];
  var DEFAULT_CIDADES = [
    { nome: 'Porto e Região', uf: 'PI' },
    { nome: 'Campo Largo do Piauí e Região', uf: 'PI' },
    { nome: 'Nossa Senhora dos Remédios e Região', uf: 'PI' },
    { nome: 'Miguel Alves e Região', uf: 'PI' },
    { nome: 'Barras e Região', uf: 'PI' },
    { nome: 'Zona Rural de União', uf: 'PI' },
    { nome: 'Zona Rural de Buriti', uf: 'MA' }
  ];
  var DEFAULT_DEPOIMENTOS = [
    { nome: 'Maria Rosa', inicial: 'MR', desde: 'Cliente há 2 anos', texto: 'Internet rápida e não cai. Assistir Netflix aqui em casa ficou bem melhor. Recomendo!', estrelas: 5 },
    { nome: 'João Silva',  inicial: 'JS', desde: 'Cliente há 1 ano',  texto: 'Jogo Free Fire sem lag nenhum. O ping ficou muito bom depois que mudei pra Connect. Vale a pena.', estrelas: 5 },
    { nome: 'Ana Costa',   inicial: 'AC', desde: 'Cliente há 3 anos', texto: 'Trabalho de casa com reuniões pelo Zoom. A internet nunca me deixou na mão. Suporte sempre atencioso.', estrelas: 5 }
  ];
  var DEFAULT_FAQ = [
    { pergunta: 'Como funciona a instalação?', resposta: 'Após você entrar em contato e escolher o plano, nossa equipe agenda a visita técnica. A instalação geralmente leva de 2 a 4 horas.' },
    { pergunta: 'Tem fidelidade?', resposta: 'Este plano possui fidelidade de 12 meses, garantindo benefícios exclusivos na instalação e mensalidade.' },
    { pergunta: 'A velocidade é garantida?', resposta: 'Sim! Como trabalhamos com fibra óptica de ponta a ponta, a velocidade contratada é entregue diretamente na sua casa.' },
    { pergunta: 'Como funciona o suporte técnico?', resposta: 'Nosso suporte funciona via WhatsApp com atendimento humano. Estamos disponíveis para resolver qualquer problema rapidamente.' },
    { pergunta: 'O roteador está incluso?', resposta: 'Sim! Fornecemos o roteador Wi-Fi adequado para o plano contratado sem custo adicional.' },
    { pergunta: 'Como faço para pagar a fatura?', resposta: 'A fatura é disponibilizada mensalmente para pagamento via boleto e Pix. Também oferecemos carnê com parcelas.' }
  ];

  var DEFAULT_ESCRITORIOS = [
    { cidade:'Porto-Pi',                      endereco:'Av. Presidente Vargas, 193', cep:'64145-000', uf:'PI', horario:'Seg–Sex: 08h–12h / 14h–17h | Sáb: 08h–12h | Dom: Fechado', maps:'https://maps.google.com/?q=Avenida+Presidente+Vargas+193,+Porto,+PI,+64145-000' },
    { cidade:'Nossa Senhora dos Remédios-Pi', endereco:'Rua Marcelino Rodrigues',   cep:'64149-000', uf:'PI', horario:'Seg–Sex: 08h–12h / 14h–17h | Sáb: 08h–12h | Dom: Fechado', maps:'https://maps.google.com/?q=Rua+Marcelino+Rodrigues,+Nossa+Senhora+dos+Remedios,+PI,+64149-000' },
    { cidade:'Miguel Alves-Pi',               endereco:'R. São José, 85',           cep:'64130-000', uf:'PI', horario:'Seg–Sex: 08h–12h / 14h–17h | Sáb: 08h–12h | Dom: Fechado', maps:'https://maps.google.com/?q=Rua+Sao+Jose+85,+Miguel+Alves,+PI,+64130-000' },
    { cidade:'Barras-Pi',                     endereco:'Av. Juscelino Kubitscheck', cep:'64100-000', uf:'PI', horario:'Seg–Sex: 08h–12h / 14h–17h | Sáb: 08h–12h | Dom: Fechado', maps:'https://maps.google.com/?q=Avenida+Juscelino+Kubitscheck,+Barras,+PI,+64100-000' }
  ];

  var STAR_SVG = '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
  var CHECK_SVG = '<svg class="w-5 h-5 text-connect-cyan mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';

  // ══════════════════════════════════════════════════
  //  1. APLICAR CORES
  // ══════════════════════════════════════════════════
  function aplicarCores() {
    var id = ls('identidade');
    if (!id) return;
    var style = document.createElement('style');
    style.id = 'admin-cores';
    var css = '';
    if (id['c-navy']) css += '--connect-navy:' + id['c-navy'] + ';';
    if (id['c-blue']) css += '--connect-blue:' + id['c-blue'] + ';--tw-connect-blue:' + id['c-blue'] + ';';
    if (id['c-cyan']) css += '--connect-cyan:' + id['c-cyan'] + ';';
    if (css) style.textContent = ':root{' + css + '}';
    var old = document.getElementById('admin-cores');
    if (old) old.remove();
    document.head.appendChild(style);
  }

  // ══════════════════════════════════════════════════
  //  2. APLICAR NÚMERO WHATSAPP
  // ══════════════════════════════════════════════════
  function aplicarWhatsApp() {
    var empresa = ls('empresa');
    if (!empresa || !empresa.whatsapp) return;
    var numero = empresa.whatsapp;
    // Sobrescreve a função abrirWhatsApp do script.js
    window.abrirWhatsApp = function (mensagem) {
      var texto = mensagem || 'Olá! Quero contratar internet da Connect!';
      var url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
      window.open(url, '_blank');
    };
    // Atualiza todos os links href de WhatsApp diretos
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      var href = a.getAttribute('href');
      a.setAttribute('href', href.replace(/wa\.me\/\d+/, 'wa.me/' + numero));
    });
  }

  // ══════════════════════════════════════════════════
  //  3. RENDERIZAR PLANOS
  // ══════════════════════════════════════════════════
  function renderizarPlanos() {
    var planos = ls('planos') || DEFAULT_PLANOS;
    var sec = document.getElementById('planos');
    var container = sec ? (sec.querySelector('.planos-grid') || sec.querySelector('.grid')) : null;
    if (!container) return;

    container.innerHTML = planos.map(function (p, i) {
      var delay = (i + 1) * 0.1;
      var features = p.features.map(function (f) {
        return '<li class="flex items-start text-sm">' + CHECK_SVG + '<span class="text-connect-dark">' + escHtml(f) + '</span></li>';
      }).join('');

      var badgeHtml = p.badge ? '<div class="mt-2"><span class="inline-flex items-center gap-1 bg-gradient-to-r from-connect-blue to-connect-cyan text-white text-xs font-bold px-2 py-1 rounded-full">' + escHtml(p.badge) + '</span></div>' : '';
      return '<div class="group card-modern fade-in" style="animation-delay:' + delay + 's">' +
        '<div class="p-6 h-full flex flex-col">' +
        '<div class="flex items-center gap-3 mb-4">' +
        '<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-connect-blue to-connect-cyan flex items-center justify-center shadow-lg">' +
        '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' +
        '</div>' +
        '<div><h3 class="text-2xl font-bold text-connect-navy">' + escHtml(p.nome) + '</h3>' +
        '<p class="text-xs text-connect-dark/70">velocidade máxima</p></div>' +
        '</div>' +
        '<div class="mb-4">' +
        '<div class="flex items-baseline gap-1">' +
        '<p class="text-3xl font-bold bg-gradient-to-r from-connect-blue to-connect-cyan bg-clip-text text-transparent">' + escHtml(p.preco) + '</p>' +
        '<span class="text-xs text-connect-dark/50">/mês</span>' +
        '</div>' + badgeHtml +
        '</div>' +
        '<ul class="space-y-3 mb-6 flex-grow">' + features + '</ul>' +
        '<a href="#whatsapp" class="btn-plan w-full text-sm py-3">Assinar agora</a>' +
        '</div></div>';
    }).join('');
  }

  // ══════════════════════════════════════════════════
  //  4. RENDERIZAR CIDADES (overlay + cobertura)
  // ══════════════════════════════════════════════════
  function renderizarCidades() {
    var cidades = ls('cidades') || DEFAULT_CIDADES;

    // — Overlay novo layout split (#cidade-lista com .cs-item) —
    var listaOverlay = document.getElementById('cidade-lista');
    if (listaOverlay) {
      var botoesOverlay = cidades.map(function (c) {
        return '<button class="ti-cidade cs-item" data-cidade="' + escAttr(c.nome) + '" data-atende="true">' +
          '<span class="cs-item-nome">' + escHtml(c.nome) + '</span>' +
          '<span class="cs-item-uf">' + escHtml(c.uf) + '</span>' +
          '</button>';
      }).join('');
      botoesOverlay += '<button class="ti-cidade cs-item cs-item-outra" data-cidade="outra" data-atende="false">' +
        '<span class="cs-item-nome">🔍 Minha cidade não está aqui</span>' +
        '<span class="cs-item-uf"></span>' +
        '</button>';
      listaOverlay.innerHTML = botoesOverlay;
    }

    // — Seção de Cobertura (.cob-cidades) —
    var cobCidades = document.querySelector('.cob-cidades');
    if (cobCidades) {
      var botoesCob = cidades.map(function (c) {
        return '<button class="cob-cidade-btn" data-cidade="' + escAttr(c.nome) + '" data-atende="true">' +
          '<div class="cob-cidade-icon">📍</div>' +
          '<span class="cob-cidade-nome">' + escHtml(c.nome) + '</span>' +
          '<span class="cob-cidade-uf">' + escHtml(c.uf) + '</span>' +
          '<div class="cob-cidade-check">✓</div>' +
          '</button>';
      }).join('');
      botoesCob += '<button class="cob-cidade-btn cob-cidade-outra" data-cidade="outra" data-atende="false">' +
        '<div class="cob-cidade-icon">🔍</div>' +
        '<span class="cob-cidade-nome">Minha cidade não está aqui</span>' +
        '<span class="cob-cidade-uf"></span>' +
        '<div class="cob-cidade-check">?</div>' +
        '</button>';
      cobCidades.innerHTML = botoesCob;
    }
  }

  // ══════════════════════════════════════════════════
  //  5. RENDERIZAR DEPOIMENTOS
  // ══════════════════════════════════════════════════
  function renderizarDepoimentos() {
    var deps = ls('depoimentos') || DEFAULT_DEPOIMENTOS;
    var container = document.querySelector('#depoimentos .grid.md\\:grid-cols-3');
    if (!container) {
      var sec = document.getElementById('depoimentos');
      if (sec) container = sec.querySelector('.grid');
    }
    if (!container) return;

    container.innerHTML = deps.map(function (d, i) {
      var stars = '';
      for (var s = 0; s < (d.estrelas || 5); s++) stars += STAR_SVG;
      var delay = (i + 1) * 0.1;
      return '<div class="card fade-in" style="animation-delay:' + delay + 's">' +
        '<div class="p-8">' +
        '<div class="flex items-center mb-4">' + stars + '</div>' +
        '<p class="text-connect-dark/80 mb-4 leading-relaxed">"' + escHtml(d.texto) + '"</p>' +
        '<div class="flex items-center">' +
        '<div class="w-10 h-10 bg-connect-cyan/20 rounded-full flex items-center justify-center mr-3">' +
        '<span class="text-connect-cyan font-bold text-sm">' + escHtml(d.inicial) + '</span>' +
        '</div>' +
        '<div>' +
        '<p class="font-semibold text-connect-navy text-sm">' + escHtml(d.nome) + '</p>' +
        '<p class="text-xs text-connect-dark/60">' + escHtml(d.desde) + '</p>' +
        '</div></div></div></div>';
    }).join('');
  }

  // ══════════════════════════════════════════════════
  //  6. RENDERIZAR FAQ
  // ══════════════════════════════════════════════════
  function renderizarFaq() {
    var faqs = ls('faq') || DEFAULT_FAQ;
    var container = document.querySelector('#faq .space-y-4');
    if (!container) {
      var sec = document.getElementById('faq');
      if (sec) container = sec.querySelector('.space-y-4, .space-y-3');
    }
    if (!container) return;

    container.innerHTML = faqs.map(function (f, i) {
      var delay = (i + 1) * 0.1;
      return '<div class="card fade-in" style="animation-delay:' + delay + 's">' +
        '<button class="faq-button w-full text-left p-6 flex items-center justify-between" aria-expanded="false">' +
        '<span class="font-semibold text-connect-navy pr-4">' + escHtml(f.pergunta) + '</span>' +
        '<svg class="faq-icon w-5 h-5 text-connect-primary transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' +
        '</button>' +
        '<div class="faq-content overflow-hidden transition-all duration-300" style="max-height:0;">' +
        '<div class="p-6 pt-0 text-connect-dark/80 leading-relaxed">' + escHtml(f.resposta) + '</div>' +
        '</div></div>';
    }).join('');

    // Reinicializa o accordion do FAQ
    container.querySelectorAll('.faq-button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var content = this.nextElementSibling;
        var expanded = this.getAttribute('aria-expanded') === 'true';
        container.querySelectorAll('.faq-button').forEach(function (other) {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            var oc = other.nextElementSibling;
            if (oc) oc.style.maxHeight = '0';
          }
        });
        this.setAttribute('aria-expanded', String(!expanded));
        if (content) content.style.maxHeight = expanded ? '0' : content.scrollHeight + 'px';
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  7. APLICAR DADOS DA EMPRESA
  // ══════════════════════════════════════════════════
  function aplicarEmpresa() {
    var e = ls('empresa');
    if (!e) return;

    // Nome no footer
    if (e.nome) {
      document.querySelectorAll('footer h3').forEach(function (el) {
        if (el.textContent.trim() === 'Connect') el.textContent = e.nome;
      });
      document.title = e.nome + ' - Internet Fibra Óptica';
    }

    // Endereço no footer
    if (e.cidade) {
      document.querySelectorAll('footer span').forEach(function (el) {
        if (el.textContent.includes('Porto-PI')) el.textContent = e.cidade;
      });
    }

    // Slogan / descrição curta no footer
    if (e.slogan) {
      var footerP = document.querySelector('footer p.text-sm.leading-relaxed');
      if (footerP) footerP.textContent = e.slogan;
    }

    // Horário de atendimento (se existir no HTML)
    if (e['horario-dias'] && e['horario-hrs']) {
      document.querySelectorAll('[data-horario]').forEach(function (el) {
        el.textContent = e['horario-dias'] + ' — ' + e['horario-hrs'];
      });
    }
  }

  // ══════════════════════════════════════════════════
  //  8. APLICAR IDENTIDADE VISUAL (textos)
  // ══════════════════════════════════════════════════
  function aplicarIdentidade() {
    var id = ls('identidade');
    if (!id) return;

    // Título do Hero
    if (id['hero-titulo']) {
      var heroH1 = document.querySelector('#hero h1');
      if (heroH1) {
        // preserva o span do gradiente
        var span = heroH1.querySelector('span');
        if (span) {
          heroH1.childNodes.forEach(function (n) {
            if (n.nodeType === 3) n.textContent = id['hero-titulo'].replace(span.textContent, '');
          });
        }
      }
    }

    // Descrição curta institucional
    if (id['desc-curta']) {
      var footerP = document.querySelector('footer p.text-sm.leading-relaxed');
      if (footerP) footerP.textContent = id['desc-curta'];
    }

    // Mensagem padrão WhatsApp
    if (id['msg-wa']) {
      window._adminMsgWa = id['msg-wa'];
    }

    // Logo (se URL foi alterada)
    if (id['logo']) {
      document.querySelectorAll('img[alt*="Connect"]').forEach(function (img) {
        if (img.closest('#cidade-overlay, header, footer')) {
          img.src = id['logo'];
        }
      });
    }

    // Mascote
    if (id['mascote']) {
      document.querySelectorAll('img[src*="masconte"]').forEach(function (img) {
        img.src = id['mascote'];
      });
    }
  }

  // ══════════════════════════════════════════════════
  //  9. RASTREAR LEADS
  // ══════════════════════════════════════════════════
  function rastrearLeads() {
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

      // Webhook
      var apiData = ls('api') || {};
      if (apiData.wh_lead && apiData.int_n8n) {
        fetch(apiData.wh_lead, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento: 'lead_capturado',
            timestamp: new Date().toISOString(),
            origem: 'site_connect',
            lead: { cidade: cidade, plano_interesse: plano, pagina: window.location.href }
          })
        }).catch(function () {});
      }
    });

    // Cidade não atendida
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#cidade-btn-avise, .cob-btn-avise');
      if (!btn) return;
      var leads = ls('leads') || [];
      leads.push({ acao: 'Cidade não atendida', cidade: '—', plano: '—', data: new Date().toLocaleString('pt-BR'), ts: Date.now() });
      lsSet('leads', leads);
    });
  }

  // ══════════════════════════════════════════════════
  //  10. CONTAR VISITAS
  // ══════════════════════════════════════════════════
  function contarVisitas() {
    var hoje = new Date().toDateString();
    if (ls('visita_data') !== hoje) {
      lsSet('visitas', 1);
      lsSet('visita_data', hoje);
    } else {
      lsSet('visitas', (ls('visitas') || 0) + 1);
    }
  }

  // ══════════════════════════════════════════════════
  //  11. INJETAR MARKETING / PIXELS
  // ══════════════════════════════════════════════════
  function injetarMarketing() {
    var mkt = ls('marketing');
    if (!mkt) return;

    // Google Tag Manager (extra, se diferente do hardcoded)
    if (mkt.gtm && mkt.gtm.trim() && mkt.gtm.trim() !== 'GTM-KZWSCQJ8' && !document.getElementById('gtm-bridge')) {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true; j.id = 'gtm-bridge';
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', mkt.gtm.trim());
    }

    // Meta Pixel
    if (mkt.fbpixel && mkt.fbpixel.trim() && !window._fbqLoaded) {
      window._fbqLoaded = true;
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', mkt.fbpixel.trim());
      window.fbq('track', 'PageView');
      document.addEventListener('click', function (e2) {
        if (e2.target.closest('a[href="#whatsapp"]') && window.fbq) {
          window.fbq('track', mkt['fb-event'] || 'Lead');
        }
      });
    }

    // GA4
    if (mkt.ga4 && mkt.ga4.trim() && !window._ga4Loaded) {
      window._ga4Loaded = true;
      var ga4Sc = document.createElement('script');
      ga4Sc.async = true;
      ga4Sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + mkt.ga4.trim();
      document.head.appendChild(ga4Sc);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', mkt.ga4.trim());
    }

    // TikTok Pixel
    if (mkt.tiktok && mkt.tiktok.trim() && !window._ttqLoaded) {
      window._ttqLoaded = true;
      !function (w, d, t) {
        w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
        ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
        ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.load = function (e) { var s = document.createElement('script'); s.type = 'text/javascript'; s.async = !0; s.src = '//analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + e; var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(s, a); };
        ttq.load(mkt.tiktok.trim()); ttq.page();
      }(window, document, 'ttq');
    }

    // Scripts personalizados
    if (mkt['script-head'] && mkt['script-head'].trim()) {
      var dh = document.createElement('div'); dh.innerHTML = mkt['script-head'];
      Array.from(dh.children).forEach(function (n) { document.head.appendChild(n); });
    }
    if (mkt['script-body'] && mkt['script-body'].trim()) {
      var db = document.createElement('div'); db.innerHTML = mkt['script-body'];
      Array.from(db.children).forEach(function (n) { document.body.appendChild(n); });
    }
  }

  // ── ESCAPE HELPERS ──────────────────────────────
  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  // ══════════════════════════════════════════════════
  //  8. RENDERIZAR ESCRITÓRIOS
  // ══════════════════════════════════════════════════
  function renderizarEscritorios() {
    var lista = ls('escritorios') || DEFAULT_ESCRITORIOS;
    var sec = document.getElementById('escritorios');
    var grid = sec ? sec.querySelector('.esc-grid') : null;
    if (!grid) return;

    var PIN_SVG = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
    var MAP_SVG = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>';

    grid.innerHTML = lista.map(function(e, i) {
      var horLines = (e.horario || '').split('|').map(function(h){ return h.trim(); }).join(' · ');
      var link = e.maps || ('https://maps.google.com/?q=' + encodeURIComponent((e.endereco||'') + ', ' + (e.cidade||'') + ', ' + (e.uf||'PI') + ', ' + (e.cep||'')));
      var fotoHtml = e.foto
        ? '<div style="height:160px;overflow:hidden;border-radius:12px 12px 0 0;"><img src="' + escHtml(e.foto) + '" alt="' + escHtml(e.cidade||'') + '" style="width:100%;height:100%;object-fit:cover;transition:transform .4s;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'" onerror="this.parentElement.style.display=\'none\'"></div>'
        : '<div style="height:100px;border-radius:12px 12px 0 0;background:linear-gradient(135deg,#2B5FDB,#00D4FF);display:flex;align-items:center;justify-content:center;">' + PIN_SVG.replace('class="w-6 h-6 text-white"','style="width:40px;height:40px;color:#fff;opacity:.6"') + '</div>';
      return '<a href="' + link + '" target="_blank" rel="noopener" class="group card-modern fade-in block hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style="animation-delay:' + (i * 0.1 + 0.1) + 's;text-decoration:none;overflow:hidden;padding:0;">' +
        fotoHtml +
        '<div class="p-5">' +
          '<h3 class="text-base font-bold text-connect-navy mb-1">' + escHtml(e.cidade || '') + '</h3>' +
          '<p class="text-xs text-connect-dark/70 mb-1">📍 ' + escHtml(e.endereco || '') + ' — CEP ' + escHtml(e.cep || '') + '</p>' +
          '<p class="text-xs text-connect-dark/50 mb-3">⏰ ' + escHtml(horLines) + '</p>' +
          '<span class="inline-flex items-center gap-1 text-xs font-semibold text-connect-blue group-hover:gap-2 transition-all">' + MAP_SVG + ' Ver rota no Maps</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  // ══════════════════════════════════════════════════
  //  SINCRONIZAÇÃO EM NUVEM (JSONBin.io)
  // ══════════════════════════════════════════════════

  // Tempo de cache: 5 minutos (evita muitas requisições)
  var CACHE_TTL = 5 * 60 * 1000;

  function carregarDaNuvem(callback) {
    var binId = ls('cloud_bin_id');
    if (!binId) { callback(false); return; }

    // Verifica cache
    var cached    = ls('cloud_cache');
    var cachedAt  = ls('cloud_cache_at') || 0;
    if (cached && (Date.now() - cachedAt) < CACHE_TTL) {
      aplicarDadosNuvem(cached);
      callback(true);
      return;
    }

    // Lê da nuvem (bin público — sem autenticação necessária)
    fetch('https://api.jsonbin.io/v3/b/' + binId + '/latest', {
      headers: { 'X-Bin-Meta': 'false' }
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var record = data.record || data;
      if (record && record._v) {
        // Só aplica se a versão da nuvem for mais nova que o localStorage
        var localV = ls('cloud_local_v') || 0;
        if (record._v >= localV) {
          // Salva no cache local
          lsSet('cloud_cache',    record);
          lsSet('cloud_cache_at', Date.now());
          lsSet('cloud_local_v',  record._v);
          // Atualiza todos os dados no localStorage
          if (record.planos)         lsSet('planos',         record.planos);
          if (record.cidades)        lsSet('cidades',        record.cidades);
          if (record.depoimentos)    lsSet('depoimentos',    record.depoimentos);
          if (record.faq)            lsSet('faq',            record.faq);
          if (record.empresa)        lsSet('empresa',        record.empresa);
          if (record.identidade)     lsSet('identidade',     record.identidade);
          if (record.marketing)      lsSet('marketing',      record.marketing);
          if (record.hero_carousel)  lsSet('hero_carousel',  record.hero_carousel);
          if (record.datas)          localStorage.setItem('connect_admin_datas', JSON.stringify(record.datas));
          if (record.escritorios)    lsSet('escritorios', record.escritorios);
          aplicarDadosNuvem(record);
        }
        callback(true);
      } else {
        callback(false);
      }
    })
    .catch(function () {
      // Falhou — usa localStorage normalmente
      callback(false);
    });
  }

  function aplicarDadosNuvem(record) {
    // Re-aplica tudo com os dados da nuvem
    aplicarCores();
    aplicarWhatsApp();
    renderizarPlanos();
    renderizarCidades();
    renderizarDepoimentos();
    renderizarFaq();
    renderizarBanners();
    renderizarHeroCarrossel();
    aplicarEmpresa();
    aplicarIdentidade();
    injetarMarketing();
  }

  // ══════════════════════════════════════════════════
  //  7. CARROSSEL HERO (imagens lado direito)
  // ══════════════════════════════════════════════════

  // ══════════════════════════════════════════════════
  //  CARREGAR DATAS COMEMORATIVAS DO GITHUB
  // ══════════════════════════════════════════════════
  function carregarDatasGitHub(callback) {
    fetch('https://raw.githubusercontent.com/frangabriel566/connectporto/main/data/datas.json?t=' + Date.now())
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(datas){
        if (datas && datas.length) {
          localStorage.setItem('connect_admin_datas', JSON.stringify(datas));
        }
        if (callback) callback();
      })
      .catch(function(){ if (callback) callback(); });
  }

  // Busca imagens do carrossel do GitHub (funciona para todos os visitantes)
  function carregarCarrosselGitHub() {
    fetch('https://raw.githubusercontent.com/frangabriel566/connectporto/main/data/carousel.json?t=' + Date.now())
      .then(function(r){ return r.json(); })
      .then(function(imgs){
        if (imgs && imgs.length) {
          lsSet('hero_carousel', imgs);
          renderizarHeroCarrossel();
        }
      })
      .catch(function(){});
  }

  function renderizarHeroCarrossel() {
    var slides = ls('hero_carousel');
    var track  = document.getElementById('hc2-track');
    var dotsEl = document.getElementById('hc2-dots');
    if (!track) return;

    // Sem dados: mantém fallback do HTML (mascote padrão)
    if (!slides || !slides.length) return;

    var ativos = slides.filter(function(s) { return s.ativo !== false && s.url; });
    if (!ativos.length) return;

    // Gera slides — sem hc2-launch-img para não depender da seleção de cidade
    track.innerHTML = ativos.map(function(s, i) {
      return '<div class="hc2-slide' + (i === 0 ? ' hc2-active' : '') + '" data-idx="' + i + '">'
        + '<img src="' + s.url + '" alt="' + (s.alt || 'Connect') + '" class="hc2-img hc2-launched" />'
        + '</div>';
    }).join('');

    // Gera dots
    if (dotsEl) {
      dotsEl.innerHTML = ativos.length > 1 ? ativos.map(function(_, i) {
        return '<button class="hc2-dot' + (i === 0 ? ' active' : '') + '" data-i="' + i + '"></button>';
      }).join('') : '';
    }

    if (ativos.length < 2) return; // só 1 imagem: sem autoplay

    // Inicializa carrossel (roda uma vez)
    if (track.dataset.hc2Ready === '1') return;
    track.dataset.hc2Ready = '1';

    var total = ativos.length;
    var atual = 0;
    var timer = null;

    function ir(n, dir) {
      var slides = track.querySelectorAll('.hc2-slide');
      var dots   = dotsEl ? dotsEl.querySelectorAll('.hc2-dot') : [];
      var prox   = (n + total) % total;
      if (prox === atual) return;

      var saindo   = slides[atual];
      var entrando = slides[prox];

      // define direção da entrada (pode expandir para esquerda também)
      saindo.classList.remove('hc2-active');
      saindo.classList.add('hc2-leaving');

      entrando.style.transform = 'translateX(90px) scale(.92)';
      entrando.style.opacity   = '0';
      entrando.classList.add('hc2-entering');

      saindo.addEventListener('animationend', function handler() {
        saindo.removeEventListener('animationend', handler);
        saindo.classList.remove('hc2-leaving');
        saindo.style.opacity   = '';
        saindo.style.transform = '';
      });

      entrando.addEventListener('animationend', function handler2() {
        entrando.removeEventListener('animationend', handler2);
        entrando.classList.remove('hc2-entering');
        entrando.style.transform = '';
        entrando.style.opacity   = '';
        entrando.classList.add('hc2-active');
      });

      atual = prox;
      dots.forEach(function(d, i) { d.classList.toggle('active', i === atual); });
    }

    function autoPlay() {
      stopAuto();
      timer = setInterval(function() { ir(atual + 1); }, 3000);
    }
    function stopAuto() { if (timer) clearInterval(timer); }

    if (dotsEl) {
      dotsEl.addEventListener('click', function(e) {
        var btn = e.target.closest('.hc2-dot');
        if (btn) { ir(parseInt(btn.dataset.i)); autoPlay(); }
      });
    }

    // Pause on hover
    var wrap = document.getElementById('hc2-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', stopAuto);
      wrap.addEventListener('mouseleave', autoPlay);
    }

    // Swipe
    var tx = 0;
    track.addEventListener('touchstart', function(e) { tx = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var d = tx - e.changedTouches[0].clientX;
      if (Math.abs(d) > 40) ir(atual + (d > 0 ? 1 : -1));
      autoPlay();
    });

    autoPlay();
  }

  // ══════════════════════════════════════════════════
  //  8. RENDERIZAR BANNERS (carrossel promocional)
  // ══════════════════════════════════════════════════
  function renderizarBanners() {
    var banners = ls('banners');
    // Se não há banners no storage, esconde a seção e sai
    if (!banners || !banners.length) {
      var sec = document.getElementById('banners-promo');
      if (sec) sec.style.display = 'none';
      return;
    }

    var ativos = banners.filter(function(b) { return b.ativo !== false && b.url; });
    var sec    = document.getElementById('banners-promo');
    var track  = document.getElementById('bp-track');
    var dotsEl = document.getElementById('bp-dots');

    if (!sec || !track) return;

    if (!ativos.length) {
      sec.style.display = 'none';
      return;
    }

    // Gera slides
    track.innerHTML = ativos.map(function(b) {
      var imgTag = '<img src="' + b.url + '" alt="' + (b.alt || 'Banner promocional') + '" loading="lazy" />';
      if (b.link) {
        return '<div class="bp-slide"><a href="' + b.link + '" target="_blank" rel="noopener">' + imgTag + '</a></div>';
      }
      return '<div class="bp-slide">' + imgTag + '</div>';
    }).join('');

    // Gera dots
    if (dotsEl) {
      dotsEl.innerHTML = ativos.map(function(_, i) {
        return '<button class="bp-dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '" aria-label="Banner ' + (i + 1) + '"></button>';
      }).join('');
    }

    sec.style.display = '';

    // Inicializa carrossel se ainda não foi inicializado
    if (track.dataset.bpReady === '1') return;
    track.dataset.bpReady = '1';

    var total = ativos.length;
    var atual = 0;
    var timer = null;
    var dots  = dotsEl ? dotsEl.querySelectorAll('.bp-dot') : [];
    var prev  = document.getElementById('bp-prev');
    var next  = document.getElementById('bp-next');

    function ir(n) {
      atual = (n + total) % total;
      track.style.transform = 'translateX(-' + (atual * 100) + '%)';
      if (dotsEl) {
        dotsEl.querySelectorAll('.bp-dot').forEach(function(d, i) {
          d.classList.toggle('active', i === atual);
        });
      }
    }

    function iniciarAuto() {
      pararAuto();
      if (total < 2) return;
      timer = setInterval(function() { ir(atual + 1); }, 5000);
    }

    function pararAuto() { if (timer) { clearInterval(timer); timer = null; } }

    if (prev) prev.addEventListener('click', function() { ir(atual - 1); iniciarAuto(); });
    if (next) next.addEventListener('click', function() { ir(atual + 1); iniciarAuto(); });

    if (dotsEl) {
      dotsEl.addEventListener('click', function(e) {
        var dot = e.target.closest('.bp-dot');
        if (dot) { ir(parseInt(dot.dataset.slide)); iniciarAuto(); }
      });
    }

    // Swipe touch
    var touchX = 0;
    track.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; pararAuto(); }, { passive: true });
    track.addEventListener('touchend', function(e) {
      var diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) ir(atual + (diff > 0 ? 1 : -1));
      iniciarAuto();
    });

    // Pausa no hover
    var outer = document.getElementById('bp-carousel');
    if (outer) {
      outer.addEventListener('mouseenter', pararAuto);
      outer.addEventListener('mouseleave', iniciarAuto);
    }

    ir(0);
    iniciarAuto();
  }

  // ══════════════════════════════════════════════════
  //  INICIALIZAÇÃO
  // ══════════════════════════════════════════════════

  // 1. Aplica cores do localStorage imediatamente (sem esperar a nuvem)
  aplicarCores();
  injetarMarketing();
  contarVisitas();

  // 2. Quando DOM estiver pronto: aplica localStorage primeiro (rápido)
  //    depois tenta nuvem e reaaplica se houver versão mais nova
  document.addEventListener('DOMContentLoaded', function () {

    // Aplica localStorage imediatamente para o usuário ver conteúdo na hora
    aplicarWhatsApp();
    renderizarPlanos();
    renderizarCidades();
    renderizarDepoimentos();
    renderizarFaq();
    renderizarBanners();
    renderizarHeroCarrossel();
    renderizarEscritorios();
    carregarCarrosselGitHub(); // busca versão mais recente do GitHub
    carregarDatasGitHub(function() {
      // Dispara confetti DEPOIS que as datas do GitHub chegaram
      if (window.lancarConfettiDatas) window.lancarConfettiDatas();
    });
    aplicarEmpresa();
    aplicarIdentidade();
    rastrearLeads();

    // Depois busca na nuvem em segundo plano
    var binId = ls('cloud_bin_id');
    if (binId) {
      carregarDaNuvem(function (sucesso) {
        if (sucesso) {
          console.log('✅ Connect: configurações carregadas da nuvem.');
        } else {
          console.log('ℹ️ Connect: usando configurações locais (nuvem indisponível).');
        }
      });
    }

    console.log('✅ Connect Admin Bridge ativo.');
  });

})();
