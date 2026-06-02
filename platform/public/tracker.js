/**
 * Connect Platform Tracker
 * Inclua este script no site público para rastrear visitantes e eventos.
 * <script src="https://SEU_DOMINIO/tracker.js" data-api="https://SEU_DOMINIO"></script>
 */
;(function () {
  var apiBase = (document.currentScript && document.currentScript.getAttribute('data-api')) || ''

  function uid() {
    return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  var sid = sessionStorage.getItem('_csid')
  if (!sid) { sid = uid(); sessionStorage.setItem('_csid', sid) }

  // Registra visita
  fetch(apiBase + '/api/visitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page:       location.pathname,
      referrer:   document.referrer || null,
      session_id: sid,
    }),
    keepalive: true,
  }).catch(function () {})

  // Registra eventos — expõe função global
  window.connectTrack = function (type, metadata) {
    fetch(apiBase + '/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:       type,
        page:       location.pathname,
        session_id: sid,
        metadata:   metadata || null,
      }),
      keepalive: true,
    }).catch(function () {})
  }

  // Detecta cliques em links do WhatsApp automaticamente
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]')
    if (el) window.connectTrack('whatsapp_click')
  })

  // Carrega campanha ativa e exibe banner
  fetch(apiBase + '/api/campaigns/active')
    .then(function (r) { return r.ok ? r.json() : null })
    .then(function (camp) {
      var banner = document.getElementById('campanha-banner')
      if (!banner || !camp) return
      var emoji = document.getElementById('camp-b-emoji')
      var nome  = document.getElementById('camp-b-nome')
      if (emoji) emoji.textContent = camp.emoji
      if (nome)  nome.textContent  = camp.name
      banner.style.background = camp.bg_color
      banner.style.color      = camp.text_color
      banner.classList.add('camp-visible')
    })
    .catch(function () {})
})()
