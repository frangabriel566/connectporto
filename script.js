// ============================================
// CONFIGURAÇÃO WHATSAPP
// ============================================
// IMPORTANTE: Altere o número abaixo para o WhatsApp da Connect Provedor
const WHATSAPP_NUMBER = '5586999999999'; // Formato: código país + DDD + número (sem espaços ou caracteres especiais)

// ============================================
// SMOOTH SCROLL COM OFFSET
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        // Se for link para WhatsApp, abre o WhatsApp
        if (targetId === '#whatsapp') {
            openWhatsApp();
            return;
        }
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    
    // Fecha o menu ao clicar em um link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// FAQ ACCORDION
// ============================================
const faqButtons = document.querySelectorAll('.faq-button');

faqButtons.forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // Fecha todos os outros itens
        faqButtons.forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.setAttribute('aria-expanded', 'false');
                const otherContent = otherButton.nextElementSibling;
                otherContent.style.maxHeight = '0';
            }
        });
        
        // Toggle do item clicado
        if (isExpanded) {
            button.setAttribute('aria-expanded', 'false');
            content.style.maxHeight = '0';
        } else {
            button.setAttribute('aria-expanded', 'true');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
    
    // Suporte para navegação por teclado
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
        }
    });
});

// ============================================
// COVERAGE FORM (Verificar Cobertura)
// ============================================
const coverageForm = document.getElementById('coverage-form');

if (coverageForm) {
    coverageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const addressInput = document.getElementById('address');
        const address = addressInput.value.trim();
        
        if (address) {
            openWhatsApp(`Olá! Quero verificar a cobertura da Connect no seguinte endereço: ${address}`);
            addressInput.value = '';
        }
    });
}

// ============================================
// WHATSAPP FUNCTION
// ============================================
function openWhatsApp(customMessage = null) {
    const defaultMessage = 'Olá! Quero assinar a internet fibra da Connect. Pode me informar os planos e verificar cobertura em Porto-PI?';
    const message = customMessage || defaultMessage;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// ============================================
// INTERSECTION OBSERVER (Animações de entrada)
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observa todos os elementos com a classe fade-in
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        observer.observe(el);
    });
});

// ============================================
// PLAN CARD BUTTONS (Botões dos cards de planos)
// ============================================
// Adiciona funcionalidade aos botões "Assinar no WhatsApp" dos planos
document.addEventListener('DOMContentLoaded', () => {
    // Botões de planos
    const planButtons = document.querySelectorAll('.card a[href="#whatsapp"]');
    planButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Tenta pegar o nome do plano do card pai
            const card = button.closest('.card');
            let planName = 'um plano';
            
            if (card) {
                const planTitle = card.querySelector('h3');
                if (planTitle) {
                    planName = planTitle.textContent.trim();
                }
            }
            
            openWhatsApp(`Olá! Tenho interesse no plano ${planName} da Connect. Pode me passar mais informações e verificar a disponibilidade em Porto-PI?`);
        });
    });
});

// ============================================
// KEYBOARD NAVIGATION IMPROVEMENTS
// ============================================
// Melhora a navegação por teclado em elementos interativos
document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('a, button');
    
    interactiveElements.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                element.click();
            }
        });
    });
});

// ============================================
// PREVENT DEFAULT FORM SUBMISSIONS
// ============================================
// Previne o comportamento padrão de formulários não tratados
document.querySelectorAll('form').forEach(form => {
    if (!form.hasAttribute('data-processed')) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
});

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log('%c🌐 Connect Provedor', 'font-size: 20px; font-weight: bold; color: #0EA8E2;');
console.log('%cInternet fibra óptica de qualidade em Porto-PI', 'font-size: 12px; color: #16214B;');
console.log('%c⚠️ Para alterar o número do WhatsApp, edite a constante WHATSAPP_NUMBER no arquivo script.js', 'font-size: 11px; color: #1237BD; background: #D9E0E1; padding: 4px 8px; border-radius: 4px; margin-top: 8px;');