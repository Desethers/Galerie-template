/**
 * Artists Live — Merge strategy
 * ─────────────────────────────────────────────────────────────────────────
 * Enrichit la grille statique avec les données Gallery-OS/Sanity.
 * Ne remplace JAMAIS tout le grid : le HTML statique reste la source de
 * vérité pour le roster et les images locales. Sanity peut mettre à jour :
 *   • L'image portrait si elle existe dans le studio
 *   • Le lien href si la page artiste existe (voir PAGE_MAP)
 *
 * Inclure dans artists.html :
 *   <script>window.GALLERY_API = 'https://ton-dashboard.vercel.app';</script>
 *   <script src="scripts/artists-live.js" defer></script>
 */
(function () {
  'use strict'

  const API_BASE = (window.GALLERY_API || 'http://localhost:3000').replace(/\/$/, '')
  const API_URL  = API_BASE + '/api/public/artists'

  /**
   * Mapping slug Sanity → page HTML existante.
   * Ajouter une entrée ici quand une nouvelle page artiste est créée.
   */
  const PAGE_MAP = {
    'sacha-elron': 'artist-a1.html',
    // 'sun-dog':     'artist-sun-dog.html',
    // 'ethan-kwan':  'artist-ethan-kwan.html',
  }

  function imgUrl(artist, w) {
    if (!artist.portrait || !artist.portrait.url) return ''
    const url = artist.portrait.url
    const sep = url.indexOf('?') === -1 ? '?' : '&'
    return url + sep + 'w=' + (w || 800) + '&h=' + (w || 800) + '&fit=crop&auto=format'
  }

  function artistName(a) {
    return a.displayName || ((a.firstName || '') + ' ' + (a.lastName || '')).trim()
  }

  function normName(str) {
    return (str || '').toLowerCase().replace(/\s+/g, ' ').trim()
  }

  async function load() {
    let data
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      data = await res.json()
    } catch (err) {
      console.warn('[artists-live] API indisponible, grille statique conservée :', err.message)
      return  // ← on garde le HTML statique intact
    }

    if (!Array.isArray(data) || data.length === 0) return

    const grid = document.querySelector('.artists-grid')
    if (!grid) return

    // Index des cartes statiques par nom normalisé
    const cardByName = {}
    grid.querySelectorAll('.artist-card').forEach(function (card) {
      const h2 = card.querySelector('h2')
      if (h2) cardByName[normName(h2.textContent)] = card
    })

    data.forEach(function (artist) {
      const name = artistName(artist)
      const card = cardByName[normName(name)]
      if (!card) return  // artiste Sanity absent du roster statique → on ne touche rien

      // 1. Portrait Sanity disponible → on swape l'image locale
      const img = imgUrl(artist, 800)
      if (img) {
        const fig = card.querySelector('figure')
        if (fig) {
          fig.innerHTML =
            '<img src="' + img + '" alt="' + name +
            '" width="800" height="800" loading="lazy" decoding="async" />'
        }
      }

      // 2. Page artiste connue → on met à jour le lien
      const href = PAGE_MAP[artist.slug]
      if (href) card.setAttribute('href', href)

      // 3. Slug pour usage futur (filtres, analytics…)
      if (artist.slug) card.dataset.artistSlug = artist.slug
    })

    document.dispatchEvent(new CustomEvent('artists:loaded', { detail: data }))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }
})()
