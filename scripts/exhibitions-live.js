/**
 * Exhibitions Live — API-driven rendering
 * ─────────────────────────────────────────────────────────────────────────
 * Remplace les listes statiques par les données Gallery-OS/Sanity.
 * L'API est la source de vérité pour les trois statuts (Current, Upcoming, Past).
 *
 *   • API disponible → les 3 listes sont vidées et reconstruites depuis Sanity
 *   • API indisponible → fallback silencieux, le statique buildLists() reste affiché
 *
 * Inclure dans exhibitions.html :
 *   <script>window.GALLERY_API = 'https://ton-dashboard.vercel.app';</script>
 *   <script src="scripts/exhibitions-live.js" defer></script>
 */
(function () {
  'use strict'

  const API_BASE = (window.GALLERY_API || 'http://localhost:3000').replace(/\/$/, '')
  const API_URL  = API_BASE + '/api/public/exhibitions'

  /**
   * Mapping slug Sanity → page HTML existante.
   * Ajouter une entrée ici quand une page expo est créée.
   */
  const PAGE_MAP = {
    'your-friends': 'exhibition-your-friends.html',
    // 'still-life-living-form': 'exhibition-still-life.html',
  }

  // ── Utilitaires ─────────────────────────────────────────────────────────

  function normTitle(str) {
    return (str || '').toLowerCase().replace(/\s+/g, ' ').trim()
  }

  function escHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function formatDateRange(start, end) {
    if (!start || !end) return ''
    const s = new Date(start)
    const e = new Date(end)
    const opt = { day: 'numeric', month: 'short', year: 'numeric' }
    return s.toLocaleDateString('en-US', opt) + ' → ' + e.toLocaleDateString('en-US', opt)
  }

  function artistNames(artists) {
    if (!artists || !artists.length) return ''
    return artists
      .map(function (a) { return a.displayName || ((a.firstName || '') + ' ' + (a.lastName || '')).trim() })
      .join(', ')
  }

  function imgUrl(exh, w) {
    if (!exh.mainImage || !exh.mainImage.url) return ''
    const params = 'w=' + (w || 800) + '&auto=format&fit=crop'
    const sep = exh.mainImage.url.indexOf('?') === -1 ? '?' : '&'
    return exh.mainImage.url + sep + params
  }

  function cardInnerHTML(exh) {
    const name  = artistNames(exh.artists)
    const img   = imgUrl(exh, 800)
    const city  = (exh.venue && exh.venue.city) ? exh.venue.city : ''
    const href  = PAGE_MAP[exh.slug] || (exh.slug ? 'exhibition.html?slug=' + exh.slug : '#')
    const title = escHtml(exh.title || '')

    return (
      '<a href="' + href + '" class="card">' +
        '<figure class="card-img">' +
          (img
            ? '<img src="' + img + '" alt="' + title + '" loading="lazy" />'
            : '<div style="width:100%;aspect-ratio:4/3;background:#f4f4f5"></div>') +
        '</figure>' +
        '<div class="card-body">' +
          (city ? '<p class="card-location">' + escHtml(city) + '</p>' : '') +
          (name ? '<p class="card-artist">' + escHtml(name) + '</p>' : '') +
          '<p class="card-title">' + title + '</p>' +
          '<p class="card-dates" style="font-size:.75rem;color:#767676;margin-top:.25em">' +
            escHtml(formatDateRange(exh.startDate, exh.endDate)) +
          '</p>' +
        '</div>' +
      '</a>'
    )
  }

  // ── Fetch & render ───────────────────────────────────────────────────────

  async function load() {
    let data
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      data = await res.json()
    } catch (err) {
      console.warn('[exhibitions-live] API indisponible, grille statique conservée :', err.message)
      return
    }

    if (!Array.isArray(data) || data.length === 0) return

    const listCurrent  = document.getElementById('exhListCurrent')
    const listUpcoming = document.getElementById('exhListUpcoming')
    const listPast     = document.getElementById('exhListPast')

    if (!listCurrent || !listUpcoming || !listPast) return

    // API disponible → elle est source de vérité pour les 3 listes
    listCurrent.innerHTML  = ''
    listUpcoming.innerHTML = ''
    listPast.innerHTML     = ''

    data.forEach(function (exh) {
      const li       = document.createElement('li')
      const year     = exh.startDate ? new Date(exh.startDate).getFullYear().toString() : ''
      const location = (exh.venue && exh.venue.city) ? exh.venue.city.toLowerCase() : ''

      li.dataset.status = exh.status || 'past'
      if (year)     li.dataset.year     = year
      if (location) li.dataset.location = location
      li.innerHTML = cardInnerHTML(exh)

      if (exh.status === 'current')       listCurrent.appendChild(li)
      else if (exh.status === 'upcoming') listUpcoming.appendChild(li)
      else                                listPast.appendChild(li)
    })

    // Re-déclencher le filtre actif pour que applyFilters() prenne en compte les nouvelles cartes
    const activePill = document.querySelector('.exh-pill.active')
    if (activePill) activePill.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    document.dispatchEvent(new CustomEvent('exhibitions:loaded', { detail: data }))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }
})()
