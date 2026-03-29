# Prompt — Navbar (design à reproduire)

Copier-coller le bloc ci-dessous pour faire reproduire le design de la navbar (HTML, CSS, JS).

---

```
Reproduis une barre de navigation (header) avec les effets suivants.

Structure HTML :
- `<header class="site-header">` contenant `<div class="header-inner">`.
- Dans `.header-inner`, dans l’ordre :
  1. Lien logo : `<a href="./index.html" class="site-logo">[LOGO]</a>` (remplacer [LOGO] par le nom du site).
  2. `<nav class="main-nav" aria-label="Main navigation">` avec des liens : Exhibitions, Artists, Fairs, Features, News, Shop (avec une petite icône SVG flèche), Locations.
  3. `<form class="header-search" role="search">` avec `<input type="search" placeholder="Search" aria-label="Search">`.
  4. `<button class="menu-toggle" aria-label="Open menu" aria-expanded="false">` avec deux `<span>` pour le hamburger.
- Optionnel : bloc `.mobile-nav` avec les mêmes liens, masqué par défaut.

Comportement et effets :

1. Header : position sticky, top 0, z-index 200. Padding-top ~1.25rem pour laisser le hero dépasser sous la barre. Fond transparent, bordure transparente.

2. État initial : `.header-inner` en flex centré, max-width 1280px, margin 0 auto, padding ~0.9rem 2.5rem, gap 1.25rem. Logo : ~0.78rem, uppercase, letter-spacing 0.15em. Liens nav : ~0.82rem, gap 1.75rem. Recherche : bordure fine, border-radius 2px.

3. État scrolled (classe `scrolled` sur `.site-header` quand window.scrollY > 24) :
   - Header : padding-top 0.5rem, padding horizontal 1.5rem.
   - `.header-inner` : max-width min(800px, calc(100vw - 6rem)), gap 0.75rem, padding 0.65rem 1.25rem, border-radius 18px, fond en linear-gradient blanc/crème semi-transparent (rgba ~0.65–0.72), backdrop-filter blur(40px) saturate(2) brightness(1.05) contrast(0.98), box-shadow : 0 8px 48px rgba(0,0,0,.08), 0 2px 16px rgba(0,0,0,.04), 0 0 0 0.5px rgba(255,255,255,.85) inset.
   - Nav : gap 1rem.
   - Recherche : border-radius 999px, fond rgba(255,255,255,.35), bordure 0.5px, backdrop-filter blur(12px).

4. Transitions (0.3–0.4s) sur background, border-radius, box-shadow, padding, max-width, gap, backdrop-filter ; courbe cubic-bezier(0.22, 0.61, 0.36, 1) pour dimensions.

5. Liens nav au hover : text-decoration underline, text-underline-offset 3px. Formulaire recherche sans soumission (preventDefault ou onsubmit return false).

6. JS : window scroll listener (passive), header.classList.toggle('scrolled', window.scrollY > 24), appeler la mise à jour au chargement.

7. Responsive : sous 1025px, masquer nav et recherche, afficher menu-toggle et .mobile-nav (toggle au clic).
```
