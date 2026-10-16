/* Price data. Every priced entry was opened and read on CHECKED date; prices are sellers' asking
   prices, not sold prices. Entries with price:null are quote-only pages (no public price). */
(function (root) {
  var DATA = {
    checked: '2026-10-16',
    fx: { USD: 0.8887, EUR: 1, note: 'ECB reference rate 16 Oct 2026: 1 EUR = 1.1253 USD' },
    models: {
      MCX7000: { name: 'Newtec / iDirect MCX7000', type: 'Multi-carrier gateway (1RU): up to 3 demods or 1 mod + 2 demods (R1.0), DVB-S2X, up to 133 MBaud', status: 'Succeeded by the MCX8000; R2.x adds multi-modulator modes',
        datasheet: 'https://www.idirect.net/wp-content/uploads/2020/03/ProductSheet-MCX7000-MultiCarrierSatelliteGateway.pdf',
        estimate: { low: 4500, high: 11000, basis: 'No public asking price found. Estimate derived from used MCD6000 (multi-carrier demod, $2,750–4,200) and M6100 (133 MBaud modulator, $5,600–6,384) asks on the same hardware generation. GbE-only, single-demod units sit in the lower half; 3 × 133 MBaud demods + modulator + ASI + Equalink at the top.' } },
      MDM6100: { name: 'Newtec / iDirect MDM6100', type: 'Broadcast satellite modem (mod + demod), DVB-S/S2/S2X, up to 72 MBaud', status: 'Widely deployed; spares common',
        datasheet: 'https://www.idirect.net/wp-content/uploads/2020/03/ProductSheet-MDM6100-BroadcastSatelliteModem.pdf',
        estimate: { low: 3500, high: 7000, basis: 'No public asking price found (dealers quote only). Estimate bracketed by the M6100 modulator ($5,600–6,384) and MCD6000 demod ($2,750–4,200) asks. Demod-only or low symbol-rate licences: lower end.' } },
      M6100: { name: 'Newtec / iDirect M6100', type: 'Broadcast satellite modulator, DVB-S/S2/S2X, up to 133 MBaud', status: 'Several units on the used market' },
      MCD6000: { name: 'Newtec / iDirect MCD6000', type: 'Multi-carrier demodulator, DVB-S2/S2X', status: 'Many units on the used market; price mostly tracks software version and licences' },
      MCD7000: { name: 'Newtec / iDirect MCD7000', type: 'Multi-carrier demodulator, DVB-S2/S2X', status: 'Rare on the used market' },
      NTC2263: { name: 'Newtec NTC/2263 (Elevation / AZ series era)', type: 'DVB-S2 dual-flow demodulator, ASI + IP out', status: 'Older generation, budget option' }
    },
    listings: [
      { model: 'M6100', seller: 'BS Broadcast (UAE dealer)', price: 5600, cur: 'USD', ship: 156, cond: 'Not stated (used-equipment dealer)', note: 'Stock 4, ref BS21204', url: 'https://www.bsbroadcast.com/newtec-m6100-broadcast-satellite-modulator.html' },
      { model: 'M6100', seller: 'BS Broadcast (UAE dealer)', price: 5600, cur: 'USD', ship: 156, cond: 'Not stated (used-equipment dealer)', note: 'SW 1.3.2.33140, "full feature support", L-band out, ASI + IP in. Ref BS21331', url: 'https://www.bsbroadcast.com/newtec-m6100-broadcast-satellite-modulator-1.3.2.33140-full-feature-support-l-band-output-dvb-s2-asi-ip-1.html' },
      { model: 'M6100', seller: 'XG eqpt (Shenzhen)', price: 6384, cur: 'USD', cond: 'Used, DOA warranty', note: 'Lists MPN "BS21204", the same stock code as BS Broadcast: probably the same units relisted. EU VAT and duties extra.', url: 'https://xgeqpt.com/products/newtec-m6100-broadcast-satellite-modulator' },
      { model: 'M6100', seller: 'eBay: h.elsemann (Germany)', price: 5969.95, cur: 'EUR', cond: 'New (per listing)', note: 'NTC/2353.XD, "or best offer", free shipping; price as shown on ebay.be', url: 'https://www.befr.ebay.be/itm/126583874717' },
      { model: 'M6100', seller: 'AI-SAT', price: null, cond: 'Used', note: '133 MBaud, IF + L-band, 2 % roll-off, GbE TSoIP + 6 ASI. Quote only.', url: 'https://ai-sat.com/ai-sat/satellite-equipments/broadcasting-equipment/dvb-ss2-modulator/newtec-m6100-dvb-s2-s2x-satellite-modulator-used/' },
      { model: 'M6100', seller: 'Skybrokers (Netherlands)', price: null, cond: 'Used / refurbished', note: 'Quote only', url: 'https://sky-brokers.com/product/newtec-m6100-broadcast-satellite-modulator/' },
      { model: 'MCD6000', seller: 'BS Broadcast (UAE dealer)', price: 3850, cur: 'USD', ship: 156, cond: 'Not stated (used-equipment dealer)', note: 'SW 2.1.9.60681, "full feature support"', url: 'https://www.bsbroadcast.com/newtec-mcd6000-multicarrier-demodulator-software-version-2.1.9.60681-ful-feature-support.html' },
      { model: 'MCD6000', seller: 'BS Broadcast (UAE dealer)', price: 2750, cur: 'USD', ship: 156, cond: 'Not stated (used-equipment dealer)', note: 'SW 1.3.0.3, stock 2', url: 'https://www.bsbroadcast.com/newtec-mcd6000-multicarrier-demodulator-software-version-1.3.0.3.html' },
      { model: 'MCD6000', seller: 'BS Broadcast (UAE dealer)', price: 4200, cur: 'USD', cond: 'Not stated (used-equipment dealer)', note: 'SW 3.1.2.70245, DVB-S2X R2 (category page)', url: 'https://www.bsbroadcast.com/satellite-demodulator.html' },
      { model: 'MCD6000', seller: 'BS Broadcast (UAE dealer)', price: 2900, cur: 'USD', cond: 'Not stated (used-equipment dealer)', note: 'SW 2.1.10.82420, "many licence" (category page)', url: 'https://www.bsbroadcast.com/satellite-demodulator.html' },
      { model: 'MCD6000', seller: 'BS Broadcast (UAE dealer)', price: 2880, cur: 'USD', cond: 'Not stated (used-equipment dealer)', note: 'SW 1.2.0.38890 (category page)', url: 'https://www.bsbroadcast.com/satellite-demodulator.html' },
      { model: 'MCD6000', seller: 'BS Broadcast (UAE dealer)', price: 2750, cur: 'USD', cond: 'Not stated (used-equipment dealer)', note: 'SW 3.0.4.1 "full feature support"; also SW 1.0.0.20, 3.0.2.2 and 3.0.7.1 at the same price (category page)', url: 'https://www.bsbroadcast.com/satellite-demodulator.html' },
      { model: 'MCD7000', seller: 'BS Broadcast (UAE dealer)', price: 2770, cur: 'USD', ship: 156, cond: 'Not stated', note: 'MCD7000CPM; title says "need screen shots", so licences unknown', url: 'https://www.bsbroadcast.com/newtec-mcd7000cpm-multi-carrier-demodulator.html' },
      { model: 'NTC2263', seller: 'AI-SAT', price: 1500, cur: 'EUR', cond: 'Used', note: 'On sale, was €1,750. DVB-S2 dual-flow demod, ASI + IP out', url: 'https://ai-sat.com/ai-sat/satellite-equipments/vsat-equipments/demodulators/newtec-ntc2263-dvb-s2-dualflow-demodulator-asi-and-ip-out-used/' },
      { model: 'MCX7000', seller: 'Orbital Connect (US)', price: null, cond: 'New', note: 'Quote only, out of stock', url: 'https://store.orbitalconnect.com/idirect-mcx7000-multi-carrier-satellite-gateway/' },
      { model: 'MCX7000', seller: 'Skybrokers (Netherlands)', price: null, cond: 'Used / refurbished', note: 'Quote only; says it has supplied MCX7000s', url: 'https://sky-brokers.com/product/newtec-mcx7000-multi-carrier-satellite-gateway/' },
      { model: 'MCX7000', seller: 'Satcom Services', price: null, cond: 'New', note: 'Contact for price', url: 'https://satcom-services.com/mcx7000-multi-carrier-satellite-gateway' },
      { model: 'MCX7000', seller: 'JBD (Poland)', price: null, cond: 'New', note: 'Contact for price', url: 'https://jbd.com.pl/sklep/telewizja/newtec-mcx7000-multi-carrier-satellite-gateway/' },
      { model: 'MCX7000', seller: 'VSATplus', price: null, cond: 'New', note: 'Price shown only after login', url: 'https://www.vsatplus.com/products/newtec-mcx7000-multi-carrier-satellite-gateway' },
      { model: 'MDM6100', seller: 'Skybrokers (Netherlands)', price: null, cond: 'Used / refurbished', note: 'Quote only', url: 'https://sky-brokers.com/product/newtec-mdm6100-satellite-modem/' },
      { model: 'MDM6100', seller: 'Satcom Services', price: null, cond: 'New', note: 'Contact for price', url: 'https://satcom-services.com/newtec-broadcast-mdm6100-broadcast-satellite-modem' }
    ],
    /* MCX7000 R1.0 ordering codes, from the Newtec MCX7000 (R1.0) datasheet configuration table.
       (*) = activated by licence key. Other models/releases use different codes. */
    mcxCodes: {
      'CH-05': 'Chassis type 05 (7000)', 'MS-10': 'MCX7000 major software R1.0',
      'PS-00': 'Single AC PSU', 'PS-01': 'Dual redundant AC PSU',
      'VP-01': 'Video TS, Carrier-ID (NIT), TS analyser*', 'VP-02': 'Video TS, demod only*',
      'VI-01': 'GbE TSoIP, SMPTE-2022 FEC decoding (needs VP-01/VP-02)*', 'VI-02': 'GbE TSoIP + 6 ASI (needs VP-01/VP-02 and HS-05)', 'AS-02': 'ASI only, 6 connectors (needs VP-01/VP-02 and HS-05)',
      'HS-02': 'Slot 1: demodulator board Cl.3', 'HS-04': 'Slot 2: demodulator board Cl.3', 'HS-05': 'Slot 3: ASI board', 'HS-07': 'Slot 3: demodulator board Cl.3',
      'ML-00': 'No modulator licence', 'ML-01': 'One modulator licence',
      'DL-00': 'No demodulator board licence', 'DL-01': 'One demodulator board licence', 'DL-02': 'Two demodulator board licences', 'DL-03': 'Three demodulator board licences',
      'OU-00': 'L-band out with switchable 10 MHz*', 'OU-01': 'IF out (50–180 MHz)*', 'OU-02': 'IF + L-band out, switchable 10 MHz*',
      'SC-01': 'Mod: DVB-S QPSK/8PSK*', 'SC-02': 'Mod: DVB-S/S2 QPSK*', 'SC-03': 'Mod: DVB-S/S2/S2X QPSK/8PSK*', 'SC-04': 'Mod: DVB-S/S2/S2X up to 16QAM/16APSK*', 'SC-05': 'Mod: DVB-S/S2/S2X up to 16QAM/16/32APSK*', 'SC-06': 'Mod: DVB-S/S2/S2X up to 256APSK*',
      'SR-01': 'Mod symbol rate 5 MBaud*', 'SR-02': 'Mod symbol rate 15 MBaud*', 'SR-03': 'Mod symbol rate 36 MBaud*', 'SR-04': 'Mod symbol rate 54 MBaud*', 'SR-05': 'Mod symbol rate 72 MBaud*', 'SR-06': 'Mod symbol rate 133 MBaud*',
      'DC-01': 'Demod: DVB-S/S2/S2X up to 16QAM/16/32APSK*', 'DC-02': 'Demod: DVB-S/S2/S2X up to 256APSK*',
      'DR-01': 'Demod symbol rate 72 MBaud*', 'DR-02': 'Demod symbol rate 133 MBaud*',
      'AE-01': 'Equalink 3 pre-distortion (1 licence)*', 'VM-01': 'MPE data insertion in TS (needs VP-01)*', 'CA-01': 'BISS (0-1-E) single TS (needs VP-01)*',
      'RO-01': '10 MHz reference output (BNC)', 'IR-00': 'Standard 10 MHz internal reference', 'IR-02': 'Very high stability 10 MHz reference',
      'GA-08': 'Care Pack 3 Basic', 'GA-09': 'Care Pack 3 Enhanced'
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA; else root.SATGEAR_DATA = DATA;
})(this);
