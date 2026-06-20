/**
 * Artist Page Live — Slot hydration
 * ─────────────────────────────────────────────────────────────────────────────
 * Fills the static artist page (artist.html) with data from Gallery OS for the
 * artist identified by ?slug= (or window.ARTIST_SLUG). Mirrors the approach of
 * exhibition-page-live.js: it only updates text / src / innerHTML of existing
 * nodes and rebuilds the works grid with the exact same markup — never touches
 * CSS classes or layout structure.
 *
 *   • API reachable + artist found → hero, bio, portrait and works are filled
 *   • API unreachable / no slug    → silent exit, static skeleton preserved
 *
 * Setup — before </body> on artist.html:
 *   <script>window.GALLERY_API = 'https://gallery-os-ten.vercel.app';</script>
 *   <script src="scripts/artist-page-live.js" defer></script>
 */
(function () {
  'use strict'

  var API_BASE = (window.GALLERY_API || 'http://localhost:3000').replace(/\/$/, '')

  function getSlug() {
    if (window.ARTIST_SLUG) return window.ARTIST_SLUG
    try {
      return new URLSearchParams(window.location.search).get('slug') || ''
    } catch (e) {
      return ''
    }
  }

  var SLUG = getSlug()
  if (!SLUG) {
    console.warn('[artist-page-live] no slug (?slug= or window.ARTIST_SLUG) — skipping hydration')
    return
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return (str || '')
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function imgSrc(url, w) {
    if (!url) return ''
    var W = w || 1000
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'w=' + W + '&q=85&auto=format'
  }

  // ── Renderers (exact same markup as the static page) ──────────────────────────

  function workCardHTML(w) {
    var alt = esc(w.title + (w.year ? ', ' + w.year : ''))
    var detailLines = ''
    if (w.medium)     detailLines += '<span class="work-card-detail-line">' + esc(w.medium) + '</span>'
    if (w.dimensions) detailLines += '<span class="work-card-detail-line">' + esc(w.dimensions) + '</span>'
    return (
      '<a href="#" class="work-card">' +
        '<figure>' +
          (w.imageUrl
            ? '<img src="' + imgSrc(w.imageUrl, 1000) + '" alt="' + alt + '" width="800" height="1000" loading="lazy" decoding="async" />'
            : '<div style="width:100%;aspect-ratio:4/5;background:#f4f4f5"></div>') +
        '</figure>' +
        '<div class="work-card-body">' +
          '<p class="work-card-artist">' + esc(w.artist) + '</p>' +
          '<p class="work-card-title">' + esc(w.title) +
            (w.year ? ', <span class="work-card-date">' + esc(w.year) + '</span>' : '') +
          '</p>' +
          (detailLines ? '<p class="work-card-detail">' + detailLines + '</p>' : '') +
        '</div>' +
      '</a>'
    )
  }

  function newsCardHTML(n) {
    var meta = [n.category, n.date].filter(Boolean).join(' — ')
    var inner =
      '<figure>' +
        (n.imageUrl
          ? '<img src="' + imgSrc(n.imageUrl, 800) + '" alt="' + esc(n.title) + '" width="800" height="1000" loading="lazy" decoding="async" />'
          : '<div style="width:100%;aspect-ratio:4/5;background:#f4f4f5"></div>') +
      '</figure>' +
      '<div class="work-card-body">' +
        '<p class="work-card-title">' + esc(n.title) + '</p>' +
        (meta ? '<p class="work-card-detail">' + esc(meta) + '</p>' : '') +
      '</div>'
    return n.link
      ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener noreferrer" class="work-card">' + inner + '</a>'
      : '<a href="#" class="work-card">' + inner + '</a>'
  }

  function pressCardHTML(p) {
    var sub = [p.category, p.date].filter(Boolean).join(' · ')
    var inner =
      '<div class="press-card-inner">' +
        '<p class="press-card-hero">' + esc(p.title) + '</p>' +
        '<span class="press-card-spacer" aria-hidden="true"></span>' +
        (sub ? '<p class="press-card-subtitle">' + esc(sub) + '</p>' : '') +
        (p.excerpt ? '<p class="press-card-excerpt">' + esc(p.excerpt) + '</p>' : '') +
      '</div>'
    return p.link
      ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer" class="press-card">' + inner + '</a>'
      : '<a href="#" class="press-card">' + inner + '</a>'
  }

  function cvBlockHTML(heading, items) {
    if (!items.length) return ''
    var lis = items.map(function (c) {
      var tail = [c.title, c.venue, c.location].filter(Boolean).join(', ')
      return '<li><span class="cv-year">' + esc(c.year) + '</span> ' + esc(tail) + '</li>'
    }).join('')
    return '<div class="cv-block"><h3>' + esc(heading) + '</h3><ul>' + lis + '</ul></div>'
  }

  // ── Hydration ─────────────────────────────────────────────────────────────────

  function setText(sel, value) {
    var el = document.querySelector(sel)
    if (el && value != null) el.textContent = value
  }

  function fillHTML(sel, html) {
    var el = document.querySelector(sel)
    if (el) el.innerHTML = html
  }

  function hydrate(data) {
    // Hero
    setText('main .artist-info h1', data.name)
    setText('main .artist-info .artist-meta', data.meta)
    if (data.name) document.title = data.name + ' — Galerie'

    // Breadcrumb (last text node after the separator)
    var crumb = document.querySelector('.breadcrumb')
    if (crumb && data.name) {
      crumb.innerHTML = '<a href="artists.html">Artists</a><span>/</span>' + esc(data.name)
    }

    // Portrait — hide the element entirely when the artist has no portrait
    var portrait = document.querySelector('.artist-portrait')
    if (portrait) {
      if (data.portraitUrl) {
        portrait.src = imgSrc(data.portraitUrl, 1200)
        portrait.alt = 'Portrait of ' + (data.name || '')
        portrait.style.display = ''
      } else {
        portrait.style.display = 'none'
      }
    }

    // Bio (teaser visible + extended for the modal)
    fillHTML('#bio', data.bioHtml || '')
    fillHTML('#bioExtended', data.bioExtendedHtml || '')
    // Hide the "read full biography" CTA when there is no extended bio
    var cta = document.querySelector('.artist-cta-row')
    if (cta) cta.style.display = data.bioExtendedHtml ? '' : 'none'

    // Works
    if (Array.isArray(data.works) && data.works.length) {
      fillHTML('#panel-works .works-grid', data.works.map(workCardHTML).join('\n'))
    }

    // News
    var newsGrid = document.querySelector('#panel-news .works-grid')
    if (newsGrid) {
      if (data.news && data.news.length) newsGrid.innerHTML = data.news.map(newsCardHTML).join('\n')
      else hidePill('news')
    }

    // Press
    var pressGrid = document.querySelector('#panel-press .press-grid')
    if (pressGrid) {
      if (data.press && data.press.length) pressGrid.innerHTML = data.press.map(pressCardHTML).join('\n')
      else hidePill('press')
    }

    // CV / Biography (grouped: Solo, Group, then the rest)
    var cvCols = document.querySelector('#panel-biography .cv-columns')
    if (cvCols) {
      if (data.cv && data.cv.length) {
        var solo = data.cv.filter(function (c) { return c.type === 'Solo' })
        var group = data.cv.filter(function (c) { return c.type === 'Groupe' || c.type === 'Group' })
        var other = data.cv.filter(function (c) { return c.type !== 'Solo' && c.type !== 'Groupe' && c.type !== 'Group' })
        cvCols.innerHTML =
          cvBlockHTML('Solo Exhibitions', solo) +
          cvBlockHTML('Group Exhibitions', group) +
          cvBlockHTML('Other', other)
      } else {
        hidePill('biography')
      }
    }

    // Exhibitions panel has no dashboard source yet → drop the pill to avoid stale demo data
    hidePill('exhibitions')

    document.dispatchEvent(new CustomEvent('artist:loaded', { detail: data }))
  }

  function hidePill(section) {
    // Use inline display:none — the [hidden] attribute is overridden by the
    // pill's own display rule in the stylesheet.
    var pill = document.querySelector('.exh-pill[data-section="' + section + '"]')
    if (pill) pill.style.display = 'none'
    var panel = document.querySelector('.artist-tab-panel[data-panel="' + section + '"]')
    if (panel) panel.setAttribute('hidden', '')
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────────

  fetch(API_BASE + '/api/public/artists/' + encodeURIComponent(SLUG), { cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.json()
    })
    .then(function (data) {
      if (!data || data.error) throw new Error(data && data.error ? data.error : 'empty')
      hydrate(data)
    })
    .catch(function (err) {
      console.warn('[artist-page-live] API indisponible, contenu statique conservé :', err.message)
    })
})()
