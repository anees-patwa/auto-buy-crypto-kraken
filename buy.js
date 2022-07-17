const kraken = require('./index')
const { MIN_QUANTITIES } = require('./consts');

module.exports = async (req, res, kraken) => {
  /**
   * Set up orders to be executed.
   * Base - currency to be bought.
   * Quote - currency to be used for buying.
   * Volume - volume to be bought in quote currency i.e. 10 euros.
   */
  const orders = [
    { base: "BTC", quote: "USD", volume: 25 },
    { base: "ETH", quote: "USD", volume: 25 }
  ];

  for (const order of orders) {
    const { base, quote, volume } = order;
    const pair = `${base}${quote}`;
    const ticker = await kraken.api("Ticker", { pair });

    /*
     * Pair naming is inconsistent in Kraken and thus provided
     * pair name may differ from that shown in resulting object.
     */
    const tickerPair = Object.keys(ticker.result)[0];
    const price = ticker.result[tickerPair].c[0];

    /*
     * Volume to be bought must be at the minimum the
     * volume that Kraken allows to buy (differs based on currency).
     */
    let finalVolume = volume / price;
    if (finalVolume < MIN_QUANTITIES_BUY[base]) {
      throw new Error("Order volume below minimum quantity");
    }

    try {
      await kraken.api("AddOrder", {
        pair: tickerPair,
        type: "buy",
        ordertype: "market",
        volume: finalVolume
      });
    } catch (e) {
      console.error(e);
    }
  }

  res.status(200);
}
