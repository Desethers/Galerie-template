/**
 * Exhibitions Live — Merge strategy
 * ─────────────────────────────────────────────────────────────────────────
 * Enrichit les listes statiques (déjà distribuées par buildLists()) avec
 * les données Gallery-OS/Sanity. Ne remplace JAMAIS une liste entière :
 *   • Exhibition Sanity reconnue (même titre) → image swapée si dispo, href mis à jour
 *   • Exhibition Sanity avec image, absente du statique → insérée en tête de liste
 *   • Exhibition Sanity sans image, absente du statique → ignorée (statique suffit)
 *   • API indisponible → fallback silencieux, buildLists() a déjà tout distribué
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

  // ── Fetch & merge ────────────────────────────────────────────────────────

  async function load() {
    let data
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      data = await res.json()
    } catch (err) {
      console.warn('[exhibitions-live] API indisponible, grille statique conservée :', err.message)
      return  // buildLists() a déjà distribué le statique — rien à faire
    }

    if (!Array.isArray(data) || data.length === 0) return

    // Current et Upcoming : le statique est la source de vérité — on n'y touche pas.
    // Seul Past est enrichi par Sanity (images mises à jour, nouvelles expos ajoutées).
    const listPast = document.getElementById('exhListPast')
    if (!listPast) return

    // Index des cartes Past statiques par titre normalisé
    const cardByTitle = {}
    listPast.querySelectorAll(':scope > li').forEach(function (li) {
      const titleEl = li.querySelector('.card-title, h3.card-title')
      if (titleEl) cardByTitle[normTitle(titleEl.textContent)] = li
    })

    data.forEach(function (exh) {
      if (exh.status !== 'past') return  // Current/Upcoming : on ignore complètement

      const img  = imgUrl(exh, 800)
      const href = PAGE_MAP[exh.slug] || (exh.slug ? 'exhibition.html?slug=' + exh.slug : null)
      const staticLi = cardByTitle[normTitle(exh.title || '')]

      if (staticLi) {
        // Carte Past statique trouvée : enrichir si Sanity a une image
        if (img) {
          const fig = staticLi.querySelector('figure')
          if (fig) fig.innerHTML = '<img src="' + img + '" alt="' + escHtml(exh.title || '') + '" loading="lazy" />'
        }
        if (href) {
          const anchor = staticLi.querySelector('a.card')
          if (anchor) anchor.setAttribute('href', href)
        }
      }
      // Nouvelle expo Past non présente dans le statique → ignorée pour l'instant
    })

    // Re-déclencher les filtres pour que applyFilters() prenne en compte les cartes ajoutées
    var activePill = document.querySelector('.exh-pill.active')
    if (activePill) activePill.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    document.dispatchEvent(new CustomEvent('exhibitions:loaded', { detail: data }))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }
})()
