// WHATSAPP NUMBER
const WHATSAPP_NUMBER = '5586999999999';

// Função abrir WhatsApp
function abrirWhatsApp(mensagem) {
    var texto = mensagem || 'Olá! Quero contratar internet da Connect!';
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texto);
    window.open(url, '_blank');
}

// Esperar página carregar COMPLETAMENTE
window.onload = function() {
    
    // Pegar TODOS os botões com href="#whatsapp"
    var todosBotoes = document.querySelectorAll('a[href="#whatsapp"]');
    
    console.log('Total de botões encontrados:', todosBotoes.length);
    
    // Para cada botão
    for (var i = 0; i < todosBotoes.length; i++) {
        var botao = todosBotoes[i];
        
        // Adicionar evento de click
        botao.onclick = function(evento) {
            // BLOQUEAR comportamento padrão
            evento.preventDefault();
            evento.stopPropagation();
            
            console.log('BOTÃO CLICADO!');
            
            // Pegar nome do plano
            var cardPai = this.closest('.card-modern') || this.closest('.card-featured-modern') || this.closest('.card');
            var nomePlano = 'um plano';
            
            if (cardPai) {
                var titulo = cardPai.querySelector('h3');
                if (titulo) {
                    nomePlano = titulo.innerText || titulo.textContent;
                }
            }
            
            // Mensagem personalizada
            var msg = 'Olá! Tenho interesse no plano ' + nomePlano + ' da Connect. Pode me passar mais informações?';
            
            // ABRIR WHATSAPP
            abrirWhatsApp(msg);
            
            return false;
        };
    }
    
    console.log('✓ Botões configurados com sucesso!');
};