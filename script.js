// ============================================
//  Connect Provedor — script.js (corrigido)
// ============================================

// ── CONFIGURAÇÃO ─────────────────────────────
const WHATSAPP_NUMBER = '5586988665182'; // ← altere aqui se precisar

// ── UTILITÁRIOS ──────────────────────────────
function abrirWhatsApp(mensagem) {
    var texto = mensagem || 'Olá! Quero contratar internet da Connect!';
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texto);
    window.open(url, '_blank');
}

function nomeDoPlanoPeloElemento(el) {
    var card = el.closest('.card-modern, .card-featured-modern, .card');
    if (card) {
        var titulo = card.querySelector('h3');
        if (titulo) return (titulo.innerText || titulo.textContent).trim();
    }
    return null;
}

// ── INICIALIZAÇÃO (aguarda DOM pronto) ────────
document.addEventListener('DOMContentLoaded', function () {

    // ── 0. TELA INICIAL — Seleção de cidade ──
    var overlay      = document.getElementById('cidade-overlay');
    var cidadeItens  = document.querySelectorAll('.ti-cidade');
    var naoAtendeDiv = document.getElementById('cidade-nao-atende');
    var cidadeLista  = document.getElementById('cidade-lista');
    var cidadeHeader = document.getElementById('cidade-header');
    var btnAvise     = document.getElementById('cidade-btn-avise');
    var btnVoltar    = document.getElementById('cidade-voltar');

    function fecharOverlay() {
        if (!overlay) return;
        overlay.classList.add('saindo');
        document.body.classList.remove('cidade-bloqueada');
        setTimeout(function() {
            overlay.style.display = 'none';
            // rolar para a seção de planos
            var planos = document.getElementById('planos');
            if (planos) planos.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 420);
    }

    if (overlay) {
        document.body.classList.add('cidade-bloqueada');

        cidadeItens.forEach(function(item) {
            item.addEventListener('click', function() {
                var cidade = this.dataset.cidade;
                var atende = this.dataset.atende === 'true';

                if (atende) {
                    // Mensagem personalizada no WhatsApp ao clicar em "Assinar" mais tarde
                    // Guarda cidade escolhida para uso no site
                    sessionStorage.setItem('cidadeEscolhida', cidade);
                    fecharOverlay();
                } else {
                    // Mostrar tela "não atendemos"
                    if (cidadeLista)  cidadeLista.style.display  = 'none';
                    if (cidadeHeader) cidadeHeader.style.display = 'none';
                    if (naoAtendeDiv) naoAtendeDiv.style.display = 'block';

                    if (btnAvise) {
                        btnAvise.onclick = function(e) {
                            e.preventDefault();
                            abrirWhatsApp('Olá! Ainda não tenho Connect na minha cidade. Gostaria de ser avisado quando chegarem!');
                        };
                    }
                }
            });
        });

        if (btnVoltar) {
            btnVoltar.addEventListener('click', function() {
                if (naoAtendeDiv) naoAtendeDiv.style.display = 'none';
                if (cidadeLista)  cidadeLista.style.display  = 'flex';
                if (cidadeHeader) cidadeHeader.style.display = 'block';
            });
        }
    }

    // ── 1. BOTÕES "#whatsapp" ─────────────────
    // Event delegation no document — funciona mesmo com elementos criados dinamicamente
    document.addEventListener('click', function (e) {
        var el = e.target.closest('a[href="#whatsapp"]');
        if (!el) return;

        e.preventDefault();
        e.stopPropagation();

        var cidade = sessionStorage.getItem('cidadeEscolhida') || '';
        var plano  = nomeDoPlanoPeloElemento(el);
        var msg;

        if (plano && cidade) {
            msg = 'Olá! Moro em ' + cidade + ' e tenho interesse no plano ' + plano + ' da Connect. Pode me passar mais informações?';
        } else if (plano) {
            msg = 'Olá! Tenho interesse no plano ' + plano + ' da Connect. Pode me passar mais informações?';
        } else if (cidade) {
            msg = 'Olá! Moro em ' + cidade + ' e quero contratar internet da Connect!';
        } else {
            msg = 'Olá! Quero contratar internet da Connect!';
        }

        abrirWhatsApp(msg);
    });

    // ── 2. FORMULÁRIO DE COBERTURA (CIDADES) ─
    var cidadeBtns = document.querySelectorAll('.cob-cidade-btn');
    var step1 = document.getElementById('cob-step1');
    var step2 = document.getElementById('cob-step2');
    var step3 = document.getElementById('cob-step3');
    var cobCidadeNome = document.getElementById('cob-cidade-nome');
    var cobBtnCidade  = document.getElementById('cob-btn-cidade');
    var cobVoltar1    = document.getElementById('cob-voltar1');
    var cobVoltar2    = document.getElementById('cob-voltar2');

    function cobMostrar(el) {
        [step1, step2, step3].forEach(function(s) { if (s) s.style.display = 'none'; });
        if (el) el.style.display = 'block';
        // scroll suave para o topo da seção
        var sec = document.getElementById('cobertura');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (cidadeBtns.length) {
        cidadeBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var cidade  = this.dataset.cidade;
                var atende  = this.dataset.atende === 'true';

                if (atende) {
                    if (cobCidadeNome) cobCidadeNome.textContent = cidade;
                    if (cobBtnCidade) {
                        var msg = 'Olá! Moro em ' + cidade + ' e quero contratar a internet da Connect!';
                        cobBtnCidade.onclick = function(e) {
                            e.preventDefault();
                            abrirWhatsApp(msg);
                        };
                    }
                    cobMostrar(step2);
                } else {
                    // "minha cidade não está aqui"
                    var aviseBtn = document.querySelector('.cob-btn-avise');
                    if (aviseBtn) {
                        aviseBtn.onclick = function(e) {
                            e.preventDefault();
                            abrirWhatsApp('Olá! Ainda não tenho Connect na minha cidade. Gostaria de ser avisado quando chegarem!');
                        };
                    }
                    cobMostrar(step3);
                }
            });
        });
    }

    if (cobVoltar1) cobVoltar1.addEventListener('click', function() { cobMostrar(step1); });
    if (cobVoltar2) cobVoltar2.addEventListener('click', function() { cobMostrar(step1); });

    // ── 3. FORMULÁRIO LEGADO (se ainda existir) ──
    var form = document.getElementById('coverage-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var endereco = (document.getElementById('address').value || '').trim();
            var msg = endereco
                ? 'Olá! Gostaria de verificar a disponibilidade da Connect no endereço: ' + endereco
                : 'Olá! Gostaria de verificar a disponibilidade da Connect na minha região.';
            abrirWhatsApp(msg);
        });
    }

    // ── 3. MENU MOBILE ────────────────────────
    var header = document.getElementById('header');
    var menuBtn  = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        var setMenuOpenState = function (aberto) {
            mobileMenu.classList.toggle('hidden', !aberto);
            menuBtn.setAttribute('aria-expanded', String(aberto));
            document.body.classList.toggle('menu-aberto', aberto);
            if (header) {
                header.classList.toggle('menu-open', aberto);
            }
        };

        setMenuOpenState(false);

        menuBtn.addEventListener('click', function () {
            var menuAberto = menuBtn.getAttribute('aria-expanded') === 'true';
            setMenuOpenState(!menuAberto);
        });

        // Fechar menu ao clicar em link interno
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuOpenState(false);
            });
        });

        // Fecha no ESC para melhorar acessibilidade
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setMenuOpenState(false);
            }
        });

        // Evita manter menu aberto ao retornar ao desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) {
                setMenuOpenState(false);
            }
        });
    }

    // ── 4. HEADER SCROLL ─────────────────────
    if (header) {
        var onScroll = function () {
            header.classList.toggle('scrolled', window.scrollY > 20);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // estado inicial
    }

    // ── 5. BOTÃO VOLTAR AO TOPO ───────────────
    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── 6. FAQ ACCORDION ─────────────────────
    document.querySelectorAll('.faq-button').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var content  = this.nextElementSibling;
            var expanded = this.getAttribute('aria-expanded') === 'true';

            // Fechar todos os outros
            document.querySelectorAll('.faq-button').forEach(function (other) {
                if (other !== btn) {
                    other.setAttribute('aria-expanded', 'false');
                    var otherContent = other.nextElementSibling;
                    if (otherContent) otherContent.style.maxHeight = '0';
                }
            });

            // Alternar o atual
            this.setAttribute('aria-expanded', String(!expanded));
            if (content) {
                content.style.maxHeight = expanded ? '0' : content.scrollHeight + 'px';
            }
        });
    });

    // ── 7. ANIMAÇÕES FADE-IN (IntersectionObserver) ──
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(function (el) {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    // ── 8. HERO CARROSSEL ────────────────────
    var hTrack   = document.getElementById('heroCarrosselTrack');
    var hDots    = document.querySelectorAll('.hc-dot');
    var hPrev    = document.getElementById('heroCarrosselPrev');
    var hNext    = document.getElementById('heroCarrosselNext');

    if (hTrack && hDots.length) {
        var hTotal   = hTrack.children.length;
        var hAtual   = 0;
        var hTimer   = null;

        function hIr(n) {
            hAtual = (n + hTotal) % hTotal;
            hTrack.style.transform = 'translateX(-' + (hAtual * 100) + '%)';
            hDots.forEach(function(d, i) { d.classList.toggle('active', i === hAtual); });
        }

        function hAuto() { hStop(); hTimer = setInterval(function(){ hIr(hAtual + 1); }, 5000); }
        function hStop() { if (hTimer) clearInterval(hTimer); }

        if (hPrev) hPrev.addEventListener('click', function(){ hIr(hAtual - 1); hAuto(); });
        if (hNext) hNext.addEventListener('click', function(){ hIr(hAtual + 1); hAuto(); });

        hDots.forEach(function(dot) {
            dot.addEventListener('click', function(){ hIr(parseInt(this.dataset.slide)); hAuto(); });
        });

        // Swipe touch
        var hTouchX = 0;
        hTrack.addEventListener('touchstart', function(e){ hTouchX = e.touches[0].clientX; hStop(); }, { passive:true });
        hTrack.addEventListener('touchend',   function(e){
            var diff = hTouchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) hIr(hAtual + (diff > 0 ? 1 : -1));
            hAuto();
        });

        var hOuter = document.getElementById('heroCarrosselOuter');
        if (hOuter) {
            hOuter.addEventListener('mouseenter', hStop);
            hOuter.addEventListener('mouseleave', hAuto);
        }

        hAuto();
    }

    console.log('✓ Connect script carregado com sucesso!');
});
