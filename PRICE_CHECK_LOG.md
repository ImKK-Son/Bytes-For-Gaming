# 🏷️ Price Check Log

A running record of the daily routine: products added to the catalog and the
results of spot-checking current street/list prices against the values stored
in `js/data.js`. Prices are researched from public US retailer/manufacturer
listings and are approximate (sale prices fluctuate); only clear, documented
moves are applied to the catalog.

---

## 2026-10-19

**Products added (3):**

| Product | Category | price (street) | msrp |
|---|---|---|---|
| Razer Viper V3 Pro | mouse | $149.99 | $159.99 |
| Keychron V1 Max (QMK/VIA) | keyboard | $94.00 | $104.00 |
| HyperX Cloud III Wireless | headset | $149.99 | $169.99 |

Catalog: 108 → 111 products.

**Price check — movements found & applied:**

| Product | Field | Old | New | Direction | Reason |
|---|---|---|---|---|---|
| Sony DualSense Wireless Controller | price | $69.99 | $74.99 | ⬆️ UP | Sony's standard DualSense list price rose to $74.99 (documented accessory price increase); catalog still held the old $69.99. |
| Logitech G Pro X Superlight 2 | msrp | $159.99 | $179.99 | ⬆️ UP | Current list price is $179.99 across major retailers; street still ~$129.99, so `price` left unchanged. |

**Price check — verified, no change needed:**

- Secretlab TITAN Evo ($549 street / $619 MSRP): sources ranged $549–$649 depending on size/material/sale; base standard price still consistent with catalog. Left as-is (noisy signal, no clear move).

_Checked a sample of flagship products; prices are estimates and move with
sales. See `js/data.js` for the live catalog values._
