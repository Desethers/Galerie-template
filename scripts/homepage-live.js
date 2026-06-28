(function () {
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var apiBase = local
    ? 'http://localhost:3001'
    : (window.GALLERY_API || 'https://gallery-os.vercel.app');

  function artistName(exhibition) {
    return (exhibition.artists || []).map(function (artist) {
      return artist.displayName ||
        [artist.firstName, artist.lastName].filter(Boolean).join(' ');
    }).filter(Boolean).join(', ');
  }

  function dateLabel(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value + 'T12:00:00'));
  }

  function range(exhibition) {
    return [dateLabel(exhibition.startDate), dateLabel(exhibition.endDate)]
      .filter(Boolean).join(' — ');
  }

  function pageUrl(exhibition) {
    return './exhibition.html?slug=' + encodeURIComponent(exhibition.slug);
  }

  function updateHero(exhibition) {
    if (!exhibition) return;
    var hero = document.querySelector('.banner-slide');
    if (!hero) return;
    hero.href = pageUrl(exhibition);
    hero.setAttribute('aria-label', [artistName(exhibition), exhibition.title].filter(Boolean).join(' — '));
    var image = hero.querySelector('img');
    if (image && exhibition.mainImage && exhibition.mainImage.url) {
      image.src = exhibition.mainImage.url + '?w=1800&auto=format';
      image.alt = exhibition.mainImage.alt || exhibition.title;
    }
    var location = hero.querySelector('.banner-label');
    var artist = hero.querySelector('.banner-artist');
    var title = hero.querySelector('.banner-title');
    var date = hero.querySelector('.banner-date');
    if (location) location.textContent = (exhibition.venue && exhibition.venue.city) || '';
    if (artist) artist.textContent = artistName(exhibition);
    if (title) title.textContent = exhibition.title || '';
    if (date) date.textContent = range(exhibition);
  }

  function updateCards(exhibitions) {
    var cards = document.querySelectorAll('#exhibitions .card');
    exhibitions.forEach(function (exhibition, index) {
      var card = cards[index];
      if (!card) return;
      card.href = pageUrl(exhibition);
      var image = card.querySelector('img');
      if (image && exhibition.mainImage && exhibition.mainImage.url) {
        image.src = exhibition.mainImage.url + '?w=900&auto=format';
        image.alt = exhibition.mainImage.alt || exhibition.title;
      }
      var location = card.querySelector('.card-location');
      var artist = card.querySelector('.card-artist');
      var title = card.querySelector('.card-title');
      var date = card.querySelector('.card-date');
      if (location) location.textContent = (exhibition.venue && exhibition.venue.city) || '';
      if (artist) artist.textContent = artistName(exhibition);
      if (title) title.textContent = exhibition.title || '';
      if (date) date.textContent = range(exhibition);
    });
  }

  fetch(apiBase + '/api/public/homepage')
    .then(function (response) {
      if (!response.ok) throw new Error('Homepage API unavailable');
      return response.json();
    })
    .then(function (data) {
      updateHero(data.hero);
      updateCards(data.exhibitions || []);
    })
    .catch(function () {
      // Keep the static fallback when the dashboard API is unavailable.
    });
})();
