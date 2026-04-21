/**
 * Exhibition Page Live — Slot hydration
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches page content from Gallery OS and fills predefined slots in the
 * static HTML — without changing any layout classes or structure.
 *
 * CRITICAL CONSTRAINT: This script NEVER modifies CSS classes or HTML
 * structure. It only updates text nodes, src/alt attributes, and
 * rebuilds the works section using the exact same markup patterns.
 *
 * Setup — add to each exhibition page before </body>:
 *   <script>window.EXHIBITION_SLUG = 'your-friends';</script>
 *   <script>window.GALLERY_API = 'https://your-dashboard.vercel.app';</script>
 *   <script src="scripts/exhibition-page-live.js" defer></script>
 *
 * If pageBlocks is null/empty → script exits, static content preserved.
 * If API is unreachable → script exits, static content preserved.
 */
(function () {
  'use strict'

  var SLUG     = window.EXHIBITION_SLUG
  var API_BASE = (window.GALLERY_API || 'http://localhost:3000').replace(/\/$/, '')

  if (!SLUG) {
    console.warn('[exhibition-page-live] window.EXHIBITION_SLUG is not set — skipping hydration')
    return
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str) {
    return (str || '')
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function imgTag(url, alt, w, h) {
    if (!url) return ''
    var src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'w=' + (w || 1200) + '&auto=format'
    return '<img src="' + src + '" alt="' + esc(alt) + '" width="' + (w || 1200) + '" height="' + (h || 1600) + '" loading="lazy" decoding="async" />'
  }

  function captionHtml(aw) {
    if (!aw) return ''
    return (
      '<p class="exh-work__artist">' + esc(aw.artist) + '</p>' +
      '<p class="exh-work__title-line">' +
        '<span class="exh-work__title">' + esc(aw.title) + '</span>' +
        (aw.year ? '<span class="exh-work__title-sep">, </span><span class="exh-work__date">' + esc(aw.year) + '</span>' : '') +
      '</p>' +
      (aw.medium     ? '<p class="exh-work__medium">'     + esc(aw.medium)     + '</p>' : '') +
      (aw.dimensions ? '<p class="exh-work__dimensions">' + esc(aw.dimensions) + '</p>' : '')
    )
  }

  function inquireBtn(aw, exhibitionTitle) {
    if (!aw || !aw.showInquiry) return ''
    return (
      '<a class="btn-outline exh-work__inquiry" href="#inquire" role="button"' +
      ' data-inquiry-artist="' + esc(aw.artist) + '"' +
      ' data-inquiry-work="'   + esc(aw.title)  + '"' +
      ' data-inquiry-exhibition="' + esc(exhibitionTitle) + '">Inquire</a>'
    )
  }

  // ── Block renderers (exact same HTML patterns as static page) ────────────────

  function renderWorkFull(block, exhTitle) {
    var aw = block.artwork
    if (!aw || !aw.imageUrl) return ''
    return (
      '<article class="exh-work exh-work--full">' +
        '<div class="exh-page__column">' +
          '<figure class="exh-work__figure">' +
            imgTag(aw.imageUrl, aw.artist + ', ' + aw.title) +
            '<figcaption>' + captionHtml(aw) + '</figcaption>' +
          '</figure>' +
        '</div>' +
      '</article>'
    )
  }

  function renderWorkPair(block, exhTitle) {
    var aw = block.left
    if (!aw || !aw.imageUrl) return ''
    var rightHtml = ''
    if (block.rightType === 'artwork' && block.right && block.right.imageUrl) {
      var raw = block.right
      var figcaptionCls = raw.showInquiry ? 'exh-work__figcaption--inquiry' : ''
      rightHtml = (
        '<article class="exh-work">' +
          '<figure class="exh-work__figure">' +
            imgTag(raw.imageUrl, raw.artist + ', ' + raw.title) +
            '<figcaption' + (figcaptionCls ? ' class="' + figcaptionCls + '"' : '') + '>' +
              captionHtml(raw) +
              inquireBtn(raw, exhTitle) +
            '</figcaption>' +
          '</figure>' +
        '</article>'
      )
    } else if (block.right) {
      var q = block.right
      rightHtml = (
        '<article class="exh-work exh-work--pair-with-quote">' +
          '<blockquote class="exh-pair-quote" cite="' + esc(q.author) + '">' +
            '<p>' + esc(q.text) + '</p>' +
            (q.author ? '<cite>' + esc(q.author) + '</cite>' : '') +
          '</blockquote>' +
        '</article>'
      )
    }
    var figcaptionLeftCls = aw.showInquiry ? 'exh-work__figcaption--inquiry' : ''
    return (
      '<div class="exh-page__column exh-works-grid--pair">' +
        '<article class="exh-work">' +
          '<figure class="exh-work__figure">' +
            imgTag(aw.imageUrl, aw.artist + ', ' + aw.title) +
            '<figcaption' + (figcaptionLeftCls ? ' class="' + figcaptionLeftCls + '"' : '') + '>' +
              captionHtml(aw) +
              inquireBtn(aw, exhTitle) +
            '</figcaption>' +
          '</figure>' +
        '</article>' +
        rightHtml +
      '</div>'
    )
  }

  function renderQuoteFull(block) {
    if (!block.text) return ''
    return (
      '<div class="exh-work-full-quote">' +
        '<div class="exh-page__column">' +
          '<blockquote class="exh-work-full-quote__inner" cite="' + esc(block.author) + '">' +
            '<p>' + esc(block.text) + '</p>' +
            (block.author ? '<cite>' + esc(block.author) + '</cite>' : '') +
          '</blockquote>' +
        '</div>' +
      '</div>'
    )
  }

  function renderWorkStack(block, exhTitle) {
    var inst = block.install
    var aw   = block.artwork
    if (!aw || !aw.imageUrl) return ''
    return (
      '<article class="exh-work exh-work--full">' +
        '<div class="exh-page__column">' +
          '<figure class="exh-work__figure exh-work__figure--stack">' +
            (inst && inst.imageUrl ? imgTag(inst.imageUrl, inst.caption || '', 1600, 1067) : '') +
            (inst && inst.caption ? '<p class="exh-work__install-caption">' + esc(inst.caption) + '</p>' : '') +
            imgTag(aw.imageUrl, aw.artist + ', ' + aw.title) +
            '<figcaption>' + captionHtml(aw) + '</figcaption>' +
          '</figure>' +
        '</div>' +
      '</article>'
    )
  }

  function renderBlock(block, exhTitle) {
    switch (block.type) {
      case 'work_full':  return renderWorkFull(block, exhTitle)
      case 'work_pair':  return renderWorkPair(block, exhTitle)
      case 'quote_full': return renderQuoteFull(block)
      case 'work_stack': return renderWorkStack(block, exhTitle)
      default:           return ''
    }
  }

  // ── Wire inquiry modal buttons ────────────────────────────────────────────────

  function wireInquiryButtons() {
    var overlay  = document.getElementById('artworkInquiryModalOverlay')
    var closeBtn = document.getElementById('artworkInquiryModalClose')
    var titleEl  = document.getElementById('inquiryModalTitle')
    var submitBtn = document.getElementById('inquiryModalSubmit')
    var textarea  = document.getElementById('inquiryComments')
    var counter   = document.getElementById('inquiryCharCount')
    if (!overlay || !closeBtn) return

    var maxChars = 300

    function openModal(ctx) {
      if (titleEl) titleEl.textContent = ctx.artist ? 'Interested in ' + ctx.artist + '?' : 'Interested in this work?'
      var form = document.getElementById('artworkInquiryForm')
      if (form) form.reset()
      if (counter) counter.textContent = maxChars + ' characters remaining'
      if (submitBtn) submitBtn.disabled = true
      overlay.classList.add('open')
      overlay.setAttribute('aria-hidden', 'false')
      document.body.style.overflow = 'hidden'
      setTimeout(function () { closeBtn.focus() }, 50)
    }

    function closeModal() {
      overlay.classList.remove('open')
      overlay.setAttribute('aria-hidden', 'true')
      document.body.style.overflow = ''
      if (window.location.hash === '#inquire') {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }

    // Re-bind all inquiry links (static + newly injected)
    document.querySelectorAll('a.exh-work__inquiry[href="#inquire"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        openModal({
          artist: link.getAttribute('data-inquiry-artist') || '',
          work:   link.getAttribute('data-inquiry-work')   || '',
        })
        history.replaceState(null, '', window.location.pathname + window.location.search + '#inquire')
      })
    })

    closeBtn.addEventListener('click', closeModal)
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal() })
  }

  // ── Main load ─────────────────────────────────────────────────────────────────

  async function load() {
    var data
    try {
      var res = await fetch(API_BASE + '/api/public/exhibitions/' + SLUG + '/page', { cache: 'no-store' })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      data = await res.json()
    } catch (err) {
      console.warn('[exhibition-page-live] API unavailable — static content preserved:', err.message)
      return
    }

    // No blocks configured → leave everything as-is
    if (!data || !Array.isArray(data.blocks) || data.blocks.length === 0) return

    // ── Slot: lede ─────────────────────────────────────────────────────────────
    if (data.lede) {
      var ledeEl = document.querySelector('.exh-page-lede')
      if (ledeEl) ledeEl.textContent = data.lede
    }

    // ── Slot: body ─────────────────────────────────────────────────────────────
    if (data.bodyText) {
      var bodyEl = document.querySelector('.exh-page-body')
      if (bodyEl) {
        bodyEl.innerHTML = data.bodyText.split(/\n\n+/)
          .map(function (p) { return '<p>' + esc(p) + '</p>' })
          .join('')
      }
    }

    // ── Slot: statement lead ────────────────────────────────────────────────────
    if (data.statementLead) {
      var statEl = document.querySelector('.exh-exhibition-statement__lead')
      if (statEl) statEl.textContent = data.statementLead
    }

    // ── Slot: full statement text (modal source) ────────────────────────────────
    if (data.statementText) {
      var srcEl = document.getElementById('exhibitionTextSource')
      if (srcEl) {
        srcEl.innerHTML = data.statementText.split(/\n\n+/)
          .map(function (p) { return '<p>' + esc(p) + '</p>' })
          .join('')
      }
    }

    // ── Slot: statement CTA visibility ──────────────────────────────────────────
    var ctaEl = document.querySelector('.exh-exhibition-statement__cta')
    if (ctaEl) ctaEl.style.display = data.showStatementCta === false ? 'none' : ''

    // ── Slot: works sequence ────────────────────────────────────────────────────
    var section = document.querySelector('.exh-exhibition-works')
    if (!section) return

    // Get exhibition title for inquiry context
    var exhTitleEl = document.getElementById('exh-title')
    var exhTitle   = exhTitleEl ? exhTitleEl.textContent.trim() : ''

    // Remove existing work blocks (keep the statement header)
    section.querySelectorAll(
      '.exh-work, .exh-work-full-quote, .exh-works-grid--pair'
    ).forEach(function (el) { el.remove() })

    // Inject resolved blocks
    var blocksHtml = data.blocks.map(function (block) {
      return renderBlock(block, exhTitle)
    }).join('')

    section.insertAdjacentHTML('beforeend', blocksHtml)

    // Re-wire inquiry buttons after new content is injected
    wireInquiryButtons()

    document.dispatchEvent(new CustomEvent('exhibition-page:loaded', { detail: data }))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load)
  } else {
    load()
  }
})()
