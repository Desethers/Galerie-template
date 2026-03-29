# Prompt — Barre de filtres expositions (design à reproduire)

Copier-coller le bloc ci-dessous pour faire reproduire le design de la barre de filtres et de ses boutons (HTML, CSS, JS).

**Référence DOM :** `main#main > div#exhFilters > div#exhFiltersCard > div.exh-filters-inner`  
**Dimensions typiques :** env. 1200×51px pour `.exh-filters-inner`.

---

```
Reproduis une barre de filtres pour une page « Expositions », avec les effets suivants.

Structure HTML :
- Conteneur : `<div class="exh-filters exh-filters--fixed" id="exhFilters">` contenant une carte `<div class="exh-filters-card" id="exhFiltersCard" aria-label="Filter exhibitions">`, elle-même contenant `<div class="exh-filters-inner">`.
- Dans `.exh-filters-inner`, dans l’ordre :
  1. Segmented control (onglets) : `<div class="exh-segment" role="tablist">` avec deux boutons : « Dates » et « Location » (classe `exh-segment-btn`, celui actif a `active` et `aria-selected="true"`).
  2. Séparateur vertical : `<span class="exh-filters-divider"></span>`.
  3. Panneau Dates (visible par défaut) : `<div class="exh-filters-panel exh-filters-panel--dates" id="exhPanelDates">` contenant un groupe `<div class="exh-filters-group exh-filters-group--status">` avec :
     - Boutons pill : « Current », « Upcoming » (classe `exh-pill`, data-filter="status", data-value="current" / "upcoming"). Un avec `active`.
     - Bloc « Past » extensible : `<div class="exh-past-expand" id="exhPastExpand">` contenant un bouton « Past » (classe `exh-pill exh-pill--inner`) et un conteneur années `<div class="year-roulette year-roulette--inline">` avec `<div class="year-roulette-track">` et des boutons `<button class="year-item">` : « All », « 2026 », « 2025 », … jusqu’à « 2016 » (data-year="all" / "2026" / etc.). Un year-item a la classe `active`.
  4. Panneau Location (masqué par défaut avec `hidden`) : `<div class="exh-filters-panel exh-filters-panel--location" id="exhPanelLocation" hidden>` avec des boutons `exh-chip` : « All locations », « Paris », « New York », etc. (data-filter="location", data-value="all" / "paris" / …).

Comportement et design :

1. Barre globale :
   - `.exh-filters--fixed` : position relative, width 100%, max-width 1280px, margin auto, transform translateY(-4rem), margin-bottom -4rem pour remonter sous le contenu. Fond blanc, pas de bordure.
   - `.exh-filters-inner` : flex, align-items center, padding 5px 0 15px, gap 0.5rem, min-height ~3rem (ou variable --exh-control-height : 31px), overflow-x auto, scrollbar masquée. Fond transparent.

2. Segmented control (Dates / Location) :
   - `.exh-segment` : inline-flex, height 31px, background off-white, border 1px solid #e5e5e5, border-radius 999px, padding 1px, box-shadow 0 0 0 1px rgba(0,0,0,.03). En mode .exh-filters--fixed : border 1px, pas de box-shadow sur le segment.
   - `.exh-segment-btn` : height 100%, padding 0 1rem, font-size .78rem, font-weight 500, letter-spacing .02em, border-radius 999px, transparent par défaut. Hover (non actif) : color muted. `.exh-segment-btn.active` : background white, color text, box-shadow 0 1px 2px rgba(0,0,0,.06), border 1px solid #e5e5e5.

3. Divider :
   - `.exh-filters-divider` : width 1px, height 24px, background border color, margin 0 1rem. En fixed : height 1rem, margin 0 0.5rem, opacity 0.5.

4. Pills (Current, Upcoming, Past) :
   - `.exh-pill` : height 31px, padding 0 1.05rem, font-size .78rem, font-weight 500, letter-spacing .01em, border 1.5px solid #e5e5e5, border-radius 999px, background white, color text. Hover : border-color black. `.exh-pill.active` : background black, color white, border black. Transition all .15s ease. En fixed : border-width 1px.

5. Bloc Past extensible :
   - `.exh-past-expand` : inline-flex, height 31px, max-width 6.5rem, overflow hidden, border 1.5px solid #e5e5e5, border-radius 999px, background white. Transition max-width .5s cubic-bezier(0.22, 0.61, 0.36, 1). Quand classe `expanded` : max-width 320px.
   - À l’intérieur : bouton « Past » (`.exh-pill--inner`) : pas de bordure, border-radius 999px 0 0 999px, transparent. Quand `.exh-past-expand.active` : ce bouton en black/white comme un pill actif.
   - `.year-roulette--inline` : à côté du bouton Past, width 0 puis en expanded width 160px (min-width 160px), overflow hidden, scroll horizontal. Transition width/min-width .42s cubic-bezier. En expanded : opacity 1.
   - `.year-roulette-track` : flex, overflow-x auto, scroll-snap-type x mandatory, scrollbar none, padding 0 .5rem dans le cas inline.

6. Boutons année (year-item) :
   - `.year-item` : flex-shrink 0, width 40px, height 100%, font-size .72rem, font-weight 400, color muted, background none, border none, cursor pointer, scroll-snap-align center. Hover : color text. `.year-item.active` : color black, font-weight 500, font-size .82rem, transform scale(1.08). En fixed : même style, .active en white avec font-weight 500 quand le bloc Past est actif (contexte .exh-past-expand.active .year-item.active).

7. Chips (Location) :
   - `.exh-chip` : height 31px, padding 0 .85rem, font-size .74rem, font-weight 400, letter-spacing .02em, border 1px solid #e5e5e5, border-radius 999px, background white, color muted. Hover : color text, border #bbb. `.exh-chip.active` : background off-white, color text, border-color text, font-weight 500. En fixed : border-width 1px.

8. Panneaux et groupes :
   - `.exh-filters-panel` : flex, align-items center, flex 1, min-width 0. Panneau masqué : display none avec [hidden].
   - `.exh-filters-group` : flex, align-items center, gap .4rem.

9. Variable CSS : `--exh-control-height: 1.9375rem` (31px) pour aligner segment, pills, chips et year-roulette.

10. JS à prévoir : bascule entre panneau Dates et Location au clic sur les segment-btn ; toggle classe `expanded` sur .exh-past-expand au clic sur « Past » ; gestion active sur pills, year-item et chips ; filtrage de la liste d’expositions selon les data-* (optionnel). Accessibilité : aria-selected sur les segment buttons, aria-label sur le card.
```
