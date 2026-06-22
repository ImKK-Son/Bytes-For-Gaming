/* =============================================================
   Bytes For Gaming — Deals
   Surfaces the products with the biggest gap between MSRP and
   the best available price, framed around not getting ripped off.
   ============================================================= */
(function () {
  'use strict';

  var BFG = window.BFG;
  var ui = BFG.ui;

  function dealRow(p) {
    var saved = (p.msrp - p.bestPrice);
    var pr = p.pricing;
    var row = ui.el(
      '<article class="deal-row card" data-id="' + p.id + '">' +
        ui.thumb(p) +
        '<div class="deal-info">' +
          '<h3>' + p.name + '</h3>' +
          '<p class="muted small">' + p.highlight + '</p>' +
          '<div class="card-meta">' + ui.stars(p.rating) +
            '<span class="muted small">' + p.rating.toFixed(1) + '</span>' +
            '<span class="cat-pill">' + p.brand + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="deal-price">' +
          '<div class="deal-save">Save ' + ui.money(saved) + '</div>' +
          '<div class="deal-now">' + ui.money(p.bestPrice) + '</div>' +
          '<div class="deal-msrp">MSRP ' + ui.money(p.msrp) + '</div>' +
          '<button class="btn btn-primary btn-sm js-compare">Compare &amp; Buy</button>' +
          '<div class="muted small deal-pick">Pick: ' + pr.pick.name + '</div>' +
        '</div>' +
      '</article>'
    );
    row.querySelector('.js-compare').addEventListener('click', function (e) {
      e.stopPropagation();
      ui.openCompare(p.id);
    });
    row.addEventListener('click', function () { ui.openCompare(p.id); });
    return row;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var list = document.getElementById('deals-list');
    if (!list) return;
    var deals = BFG.topDeals().filter(function (p) { return p.dealScore >= 10; });
    deals.forEach(function (p) { list.appendChild(dealRow(p)); });

    var n = document.getElementById('deals-count');
    if (n) n.textContent = deals.length;
  });
})();
