/* =============================================================
   Bytes For Gaming — Browse / Compare
   Filter by category + brand, search, and sort. Renders cards
   that open the price-compare modal.
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;
  var ui = BFG.ui;

  var state = { cat: 'all', brand: 'all', sort: 'rating', q: '' };
  var grid, countEl;

  function chip(label, value, key, active) {
    return '<button class="chip js-filter' + (active ? ' active' : '') +
      '" data-key="' + key + '" data-value="' + value + '">' + label + '</button>';
  }

  function renderFilters() {
    var catWrap = document.getElementById('filter-cats');
    var brandWrap = document.getElementById('filter-brands');

    var cats = '<div class="chip-row">' +
      chip('All categories', 'all', 'cat', state.cat === 'all') +
      Object.keys(BFG.CATEGORIES).map(function (c) {
        return chip(BFG.CATEGORIES[c].icon + ' ' + BFG.CATEGORIES[c].label, c, 'cat', state.cat === c);
      }).join('') + '</div>';
    catWrap.innerHTML = cats;

    var brands = '<div class="chip-row">' +
      chip('All brands', 'all', 'brand', state.brand === 'all') +
      BFG.brands().map(function (b) {
        return chip(b, b, 'brand', state.brand === b);
      }).join('') + '</div>';
    brandWrap.innerHTML = brands;

    bindFilters();
  }

  function bindFilters() {
    Array.prototype.forEach.call(document.querySelectorAll('.js-filter'), function (b) {
      b.addEventListener('click', function () {
        state[b.getAttribute('data-key')] = b.getAttribute('data-value');
        renderFilters();
        render();
      });
    });
  }

  function apply() {
    var list = BFG.PRODUCTS.slice();
    if (state.cat !== 'all') list = list.filter(function (p) { return p.category === state.cat; });
    if (state.brand !== 'all') list = list.filter(function (p) { return p.brand === state.brand; });
    if (state.q) {
      var q = state.q.toLowerCase();
      list = list.filter(function (p) {
        return (p.name + ' ' + p.brand + ' ' + p.highlight + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) !== -1;
      });
    }
    list.sort(function (a, b) {
      switch (state.sort) {
        case 'price-asc': return a.bestPrice - b.bestPrice;
        case 'price-desc': return b.bestPrice - a.bestPrice;
        case 'deal': return b.dealScore - a.dealScore;
        case 'rating':
        default: return b.rating - a.rating;
      }
    });
    return list;
  }

  function render() {
    var list = apply();
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = '<p class="empty muted">No gear matches those filters. Try clearing the search or picking a different brand.</p>';
    } else {
      list.forEach(function (p) { grid.appendChild(ui.productCard(p)); });
    }
    countEl.textContent = list.length + (list.length === 1 ? ' product' : ' products');
  }

  document.addEventListener('DOMContentLoaded', function () {
    grid = document.getElementById('browse-grid');
    countEl = document.getElementById('result-count');
    if (!grid) return;

    // deep-link: browse.html?cat=mouse
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat');
    if (cat && BFG.CATEGORIES[cat]) state.cat = cat;

    renderFilters();

    var search = document.getElementById('search-input');
    search.addEventListener('input', function () { state.q = search.value.trim(); render(); });

    var sortSel = document.getElementById('sort-select');
    sortSel.addEventListener('change', function () { state.sort = sortSel.value; render(); });

    render();
  });
})();
