const assert = require('assert'); global.SATGEAR_DATA = require('../data.js'); const G = require('../guide.js'); let n = 0;
function t(name, fn) { fn(); n++; console.log('ok', n, name); }
t('every listing has https url, model and either price+cur or null price', () => {
  for (const l of G.DATA.listings) {
    assert.ok(/^https:\/\//.test(l.url), l.url); assert.ok(G.DATA.models[l.model], l.model);
    if (l.price != null) assert.ok(['USD', 'EUR'].includes(l.cur) && l.price > 0, JSON.stringify(l));
  }
});
t('stats from listings: M6100 range and median in EUR', () => {
  const s = G.stats('M6100'); assert.strictEqual(s.kind, 'listings'); assert.strictEqual(s.priced, 4);
  assert.strictEqual(s.low, Math.round(5600 * 0.8887)); assert.strictEqual(s.high, 5970); assert.ok(s.median > s.low && s.median < s.high);
});
t('models without public prices are labelled estimate, never listings', () => {
  for (const m of ['MCX7000', 'MDM6100']) { const s = G.stats(m); assert.strictEqual(s.kind, 'estimate'); assert.strictEqual(s.priced, 0); assert.ok(s.basis.length > 40); }
});
t('IP-only receive: VP-02 + VI-01, no ASI board', () => {
  const c = G.mcxChecklist({ rx: true, demods: 3, input: 'ip', demodRate: 133 }).codes.map(x => x.code);
  for (const k of ['VP-02', 'VI-01', 'HS-02', 'HS-04', 'HS-07', 'DL-03', 'DR-02', 'ML-00']) assert.ok(c.includes(k), k);
  assert.ok(!c.includes('HS-05'));
});
t('transmit needs VP-01, ML-01, SR-06 at 133 MBaud, Equalink AE-01', () => {
  const c = G.mcxChecklist({ tx: true, rx: false, input: 'ip', modRate: 133, modOrder: '256apsk', equalink: true }).codes.map(x => x.code);
  for (const k of ['VP-01', 'ML-01', 'SR-06', 'SC-06', 'OU-00', 'AE-01', 'DL-00']) assert.ok(c.includes(k), k); assert.ok(!c.includes('VP-02'));
});
t('ASI + 3 demods is a conflict and caps at 2 boards', () => {
  const r = G.mcxChecklist({ rx: true, demods: 3, input: 'both' }); const c = r.codes.map(x => x.code);
  assert.ok(r.conflicts.length); assert.ok(c.includes('HS-05') && c.includes('VI-02') && c.includes('DL-02') && !c.includes('HS-07'));
});
t('tx + 3 demods conflicts in R1.0', () => { const r = G.mcxChecklist({ tx: true, rx: true, demods: 3 }); assert.ok(r.conflicts.some(x => /1 modulator \+ 2 demods/.test(x))); assert.ok(r.codes.some(x => x.code === 'DL-02')); });
t('BISS on receive-only upgrades VP-02 to VP-01', () => { const c = G.mcxChecklist({ rx: true, biss: true }).codes.map(x => x.code); assert.ok(c.includes('VP-01') && c.includes('CA-01') && !c.includes('VP-02')); });
t('neither tx nor rx → conflict', () => { assert.ok(G.mcxChecklist({ tx: false, rx: false }).conflicts.length); });
t('every code the checklist can emit exists in the datasheet table', () => {
  const combos = [{ rx: true, demods: 3 }, { tx: true, rx: true, demods: 2, input: 'both', out: 'both', equalink: true, biss: true, mpe: true, dualPsu: true, refOut: true, hiStab: true }, { tx: true, rx: false, input: 'asi', out: 'IF' }];
  for (const n of combos) for (const c of G.mcxChecklist(n).codes) assert.ok(G.DATA.mcxCodes[c.code], c.code);
});
t('request text + mailto with no configured address', () => {
  const m = G.requestText({ intent: 'sell', model: 'MDM6100', qty: 2, config: 'DR-01', name: 'A' }, { contactName: 'X' });
  assert.match(m.subject, /^Sell: MDM6100 x2/); assert.match(m.body, /Configuration \/ licences: DR-01/);
  assert.ok(G.mailto('', m).startsWith('mailto:?subject=Sell'));
});
t('config ships with empty contact placeholder', () => {
  const src = require('fs').readFileSync(__dirname + '/../config.js', 'utf8'); assert.match(src, /contactEmail:\s*''/);
});
console.log(n + ' tests passed');
