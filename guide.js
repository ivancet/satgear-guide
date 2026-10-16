/* SatGear Guide engine: price stats from verified listings + MCX7000 licence checklist. No DOM. */
(function (root) {
  'use strict';
  var DATA = root.SATGEAR_DATA || (typeof require !== 'undefined' ? require('./data.js') : null);
  function toEur(price, cur, fx) { fx = fx || DATA.fx; var r = fx[cur]; return r == null || price == null ? null : Math.round(price * r); }
  function stats(model, fx) {
    var all = DATA.listings.filter(function (l) { return l.model === model; });
    var priced = all.filter(function (l) { return l.price != null; });
    var eur = priced.map(function (l) { return toEur(l.price, l.cur, fx); }).sort(function (a, b) { return a - b; });
    var m = DATA.models[model] || {};
    var out = { model: model, listings: all, priced: priced.length, quoteOnly: all.length - priced.length };
    if (eur.length) {
      out.kind = 'listings'; out.low = eur[0]; out.high = eur[eur.length - 1];
      var mid = Math.floor(eur.length / 2); out.median = eur.length % 2 ? eur[mid] : Math.round((eur[mid - 1] + eur[mid]) / 2);
    } else if (m.estimate) { out.kind = 'estimate'; out.low = m.estimate.low; out.high = m.estimate.high; out.basis = m.estimate.basis; }
    else out.kind = 'none';
    return out;
  }

  /* needs: { tx:bool, rx:bool, demods:1..3, input:'ip'|'asi'|'both', modRate:72|133, demodRate:72|133,
              modOrder:'32apsk'|'256apsk', demodOrder:'32apsk'|'256apsk', out:'L'|'IF'|'both',
              equalink, biss, mpe, dualPsu, refOut, hiStab } */
  function mcxChecklist(n) {
    n = n || {}; var codes = [], conflicts = [], notes = [];
    function add(c, why) { if (!codes.some(function (x) { return x.code === c; })) codes.push({ code: c, label: DATA.mcxCodes[c] || '', why: why }); }
    var tx = !!n.tx, rx = n.rx !== false;
    if (!tx && !rx) { conflicts.push('Choose at least transmit or receive.'); return { codes: codes, conflicts: conflicts, notes: notes }; }
    var demods = rx ? Math.min(3, Math.max(1, parseInt(n.demods, 10) || 1)) : 0;
    var input = n.input || 'ip', asi = input === 'asi' || input === 'both';
    add('CH-05', 'Base chassis'); 
    add(tx ? 'VP-01' : 'VP-02', tx ? 'Video package needed to transmit a TS (VP-02 is demod-only)' : 'Video package for receive-only use (VP-01 also works)');
    if (input === 'ip') add('VI-01', 'IP input/output over GbE: TS over UDP or RTP, SMPTE 2022 FEC');
    if (input === 'both') add('VI-02', 'GbE TSoIP plus 6 ASI ports');
    if (input === 'asi') add('AS-02', 'ASI only (6 connectors)');
    if (asi) add('HS-05', 'ASI board, fitted in slot 3');
    if (tx) {
      add('ML-01', 'One modulator licence');
      add(n.out === 'IF' ? 'OU-01' : n.out === 'both' ? 'OU-02' : 'OU-00', 'Modulator output interface');
      add(n.modOrder === '256apsk' ? 'SC-06' : 'SC-05', 'Modulator standard and coding');
      add(+n.modRate === 133 ? 'SR-06' : 'SR-05', 'Modulator maximum symbol rate');
    } else add('ML-00', 'No modulator needed');
    if (rx) {
      var slots = ['HS-02', 'HS-04', 'HS-07'];
      if (asi && demods > 2) conflicts.push('Slot 3 holds either the ASI board (HS-05) or a third demodulator (HS-07), not both. With ASI you get at most 2 demodulators; use VI-01 (IP only) for 3.');
      var maxD = asi ? 2 : 3, d = Math.min(demods, maxD);
      if (tx && d > 2) { conflicts.push('In R1.0 the modulator shares the platform: configurations are 3 demods, or 1 modulator + 2 demods. Reduce to 2 demodulators or drop transmit.'); d = 2; }
      for (var i = 0; i < d; i++) add(slots[i], 'Demodulator board ' + (i + 1));
      add('DL-0' + d, d + ' demodulator board licence' + (d > 1 ? 's' : ''));
      add(n.demodOrder === '256apsk' ? 'DC-02' : 'DC-01', 'Demodulator standard and coding');
      add(+n.demodRate === 133 ? 'DR-02' : 'DR-01', 'Demodulator maximum symbol rate');
    } else add('DL-00', 'No demodulator needed');
    if (n.equalink) { if (tx) add('AE-01', 'Equalink 3 pre-distortion on the modulator'); else notes.push('Equalink 3 (AE-01) is a transmit-side feature; not useful for receive-only.'); }
    if (n.biss) { add('CA-01', 'BISS scrambling/descrambling'); if (!tx) { add('VP-01', 'CA-01 requires VP-01'); codes = codes.filter(function (c) { return c.code !== 'VP-02'; }); } }
    if (n.mpe) { add('VM-01', 'MPE data insertion'); if (!tx) { add('VP-01', 'VM-01 requires VP-01'); codes = codes.filter(function (c) { return c.code !== 'VP-02'; }); } }
    add(n.dualPsu ? 'PS-01' : 'PS-00', n.dualPsu ? 'Redundant power' : 'Single PSU is enough');
    if (n.refOut) add('RO-01', '10 MHz reference output');
    if (n.hiStab) add('IR-02', 'Very high stability reference');
    notes.push('Licence keys are tied to the unit serial number: ask for a screenshot of the licence/feature page showing the serial.');
    notes.push('Codes are from the MCX7000 R1.0 datasheet. R2.x units can run more modulators and may show different option names; match by description.');
    return { codes: codes, conflicts: conflicts, notes: notes };
  }

  var SELLER_QUESTIONS = [
    'Screenshot of the licence / feature list page, with the serial number visible',
    'Exact software version (and whether it can be upgraded without a support contract)',
    'Power-on test or video: front panel, alarms clear, demod lock on a known carrier if possible',
    'Hardware fitted: board in each slot, PSU single or dual, internal reference, ASI board',
    'Reason for sale, hours in service, and whether it comes from a decommissioned teleport',
    'Is a support / Care Pack contract transferable, and will the vendor transfer licences to a new owner?',
    'Rack ears, power cords, and original packaging included? DOA / return terms?',
    'Export classification and shipping origin (some units need an export licence)'
  ];

  function requestText(f, cfg) {
    f = f || {}; cfg = cfg || {};
    var L = [];
    L.push((f.intent === 'sell' ? 'SELL REQUEST' : 'QUOTE REQUEST') + ' via ' + (cfg.contactName || 'SatGear Guide'));
    L.push('');
    [['Model', f.model], ['Quantity', f.qty], ['Configuration / licences', f.config], ['Condition', f.condition], ['Target price', f.price], ['Ship to / from (country)', f.country], ['Notes', f.notes]].forEach(function (p) { if (p[1] && String(p[1]).trim()) L.push(p[0] + ': ' + String(p[1]).trim()); });
    if (f.codes && f.codes.length) { L.push(''); L.push('Required MCX7000 licence codes: ' + f.codes.join(', ')); }
    L.push(''); L.push('Name: ' + (f.name || '')); if (f.company) L.push('Company: ' + f.company); if (f.email) L.push('Reply to: ' + f.email);
    var subject = (f.intent === 'sell' ? 'Sell: ' : 'Quote: ') + (f.model || 'satellite equipment') + (f.qty && +f.qty > 1 ? ' x' + f.qty : '');
    return { subject: subject, body: L.join('\n') };
  }
  function mailto(to, m) { return 'mailto:' + (to || '') + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body.replace(/\n/g, '\r\n')); }

  var api = { DATA: DATA, toEur: toEur, stats: stats, mcxChecklist: mcxChecklist, SELLER_QUESTIONS: SELLER_QUESTIONS, requestText: requestText, mailto: mailto };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SatGear = api;
})(this);
