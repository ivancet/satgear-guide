(function () {
  'use strict';
  var G = window.SatGear, D = G.DATA, CFG = window.SATGEAR_CONFIG || {}, KEY = 'satgear.v1';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var st; try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  st.cur = st.cur || 'EUR'; st.needs = st.needs || { rx: true, demods: '1', input: 'ip', modRate: '133', demodRate: '133' }; st.req = st.req || { intent: 'buy', qty: 1 };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function toast(m) { var t = $('#toast'); t.textContent = m; t.className = 'on'; clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = ''; }, 1600); }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { toast('Copied'); });
    var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copied'); } catch (e) {} document.body.removeChild(ta);
  }
  function money(eur) { if (eur == null) return '–'; var v = st.cur === 'USD' ? Math.round(eur / D.fx.USD) : eur; return (st.cur === 'USD' ? '$' : '€') + v.toLocaleString('en-GB'); }
  function nat(l) { return l.price == null ? 'Quote only' : (l.cur === 'USD' ? '$' : '€') + l.price.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + (l.ship ? ' + ' + (l.cur === 'USD' ? '$' : '€') + l.ship + ' ship' : ''); }
  var d = new Date(D.checked + 'T12:00:00');
  var checkedTxt = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  $('#checkedNote').textContent = 'Listings last checked ' + checkedTxt + '.';
  $('#fxNote').textContent = 'Converted with ' + D.fx.note + '. Prices exclude VAT, duties and shipping unless stated.';
  $('#dsLink').href = D.models.MCX7000.datasheet;

  /* ---- prices ---- */
  var order = ['MCX7000', 'MDM6100', 'M6100', 'MCD6000', 'MCD7000', 'NTC2263'];
  $('#flt').innerHTML += order.map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');
  $('#modelList').innerHTML = order.map(function (m) { return '<option value="' + m + '">'; }).join('');
  function renderModels() {
    $('#models').innerHTML = order.map(function (m) {
      var md = D.models[m], s = G.stats(m), badge, range;
      if (s.kind === 'listings') { badge = '<span class="tag ok">' + s.priced + ' priced listing' + (s.priced > 1 ? 's' : '') + '</span>'; range = s.low === s.high ? money(s.low) : money(s.low) + ' – ' + money(s.high); }
      else if (s.kind === 'estimate') { badge = '<span class="tag warn">Estimate: no public price</span>'; range = money(s.low) + ' – ' + money(s.high); }
      else { badge = '<span class="tag">No data</span>'; range = '–'; }
      return '<article class="card model" id="m-' + m + '"><div class="row between"><h3 class="m0">' + esc(md.name) + '</h3>' + badge + '</div>' +
        '<p class="small muted">' + esc(md.type) + '</p><p class="range' + (s.kind === 'estimate' ? ' range-est' : '') + '">' + (s.kind === 'estimate' ? '~' : '') + range + '</p>' +
        (s.kind === 'listings' && s.priced > 1 ? '<p class="small">Median ask ' + money(s.median) + '</p>' : '') +
        (s.kind === 'estimate' ? '<p class="small est">' + esc(s.basis) + '</p>' : '') +
        (s.quoteOnly ? '<p class="small muted">' + s.quoteOnly + (s.priced ? ' more' : '') + ' dealer page' + (s.quoteOnly > 1 ? 's' : '') + ' with quote-only pricing.</p>' : '') +
        '<p class="small muted">' + esc(md.status || '') + '</p>' +
        '<div class="row gap"><button class="btn ghost sm" data-show="' + m + '">See sources</button>' + (m === 'MCX7000' ? '<a class="btn ghost sm" href="#licences">Licence checklist</a>' : '') + '</div></article>';
    }).join('');
  }
  function renderListings() {
    var f = $('#flt').value, po = $('#pricedOnly').checked;
    var rows = D.listings.filter(function (l) { return (!f || l.model === f) && (!po || l.price != null); })
      .sort(function (a, b) { return order.indexOf(a.model) - order.indexOf(b.model) || ((b.price != null) - (a.price != null)) || (G.toEur(a.price, a.cur) - G.toEur(b.price, b.cur)); });
    $('#lst tbody').innerHTML = rows.map(function (l) {
      var host = l.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      return '<tr class="' + (l.price == null ? 'qo' : '') + '"><td><b>' + l.model + '</b></td><td>' + esc(l.seller) + '</td><td>' + nat(l) + '</td><td>' + money(G.toEur(l.price, l.cur)) + '</td><td>' + esc(l.cond) + '</td><td class="small">' + esc(l.note) + '</td><td><a href="' + esc(l.url) + '" target="_blank" rel="noopener nofollow">' + esc(host) + ' ↗</a></td></tr>';
    }).join('');
    $$('.curLbl').forEach(function (e) { e.textContent = st.cur; });
  }
  $('#models').addEventListener('click', function (e) { var m = e.target.dataset.show; if (!m) return; $('#flt').value = m; renderListings(); $('#lst').scrollIntoView({ block: 'start' }); });
  $('#flt').onchange = renderListings; $('#pricedOnly').onchange = renderListings;
  $('#curSeg').onclick = function (e) { var c = e.target.dataset.c; if (!c) return; st.cur = c; save(); $$('#curSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === c); }); renderModels(); renderListings(); };
  $$('#curSeg button').forEach(function (b) { b.classList.toggle('on', b.dataset.c === st.cur); });

  /* ---- licences ---- */
  function needsFromForm() { var n = {}; $$('#needs [name]').forEach(function (el) { n[el.name] = el.type === 'checkbox' ? el.checked : el.value; }); return n; }
  function fillNeeds() { $$('#needs [name]').forEach(function (el) { var v = st.needs[el.name]; if (el.type === 'checkbox') el.checked = !!v; else if (v != null) el.value = v; }); }
  var lastChk;
  function renderChecklist() {
    var n = needsFromForm(); st.needs = n; save();
    var r = lastChk = G.mcxChecklist(n);
    $('#conflicts').innerHTML = r.conflicts.map(function (c) { return '<p class="conflict">⚠ ' + esc(c) + '</p>'; }).join('');
    $('#codeRows').innerHTML = r.codes.map(function (c) { return '<tr><td class="code">' + c.code + '</td><td>' + esc(c.label) + '<br><span class="small muted">' + esc(c.why) + '</span></td></tr>'; }).join('');
    $('#chkNotes').innerHTML = r.notes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    $$('#needs fieldset')[1].classList.toggle('dim', !n.tx); $$('#needs fieldset')[2].classList.toggle('dim', !n.rx);
  }
  function checklistText() { return 'MCX7000 licence checklist (R1.0 codes)\n' + lastChk.codes.map(function (c) { return '[ ] ' + c.code + '  ' + c.label; }).join('\n') + (lastChk.conflicts.length ? '\n\nConflicts:\n- ' + lastChk.conflicts.join('\n- ') : '') + '\n\nAsk the seller:\n- ' + G.SELLER_QUESTIONS.join('\n- '); }
  $('#needs').addEventListener('input', renderChecklist); $('#needs').addEventListener('change', renderChecklist);
  $('#copyChk').onclick = function () { copy(checklistText()); };
  $('#useInQuote').onclick = function () {
    st.req.model = 'MCX7000'; st.req.config = lastChk.codes.filter(function (c) { return !/^(CH|PS|ML-00|DL-00)/.test(c.code); }).map(function (c) { return c.code; }).join(', ');
    save(); fillReq(); renderReq();
  };
  $('#refTbl tbody').innerHTML = Object.keys(D.mcxCodes).map(function (k) { return '<tr><td class="code">' + k + '</td><td>' + esc(D.mcxCodes[k]) + '</td></tr>'; }).join('');
  $('#qs').innerHTML = G.SELLER_QUESTIONS.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('');

  /* ---- contact ---- */
  var to = (CFG.contactEmail || '').trim();
  $('#contactState').innerHTML = to ? 'Requests go to <b>' + esc(to) + '</b> from your own email app.' : 'Fill in the form and the message is written for you. <b>No contact address has been set up yet</b>, so copy the text or open it in your email app and add a recipient yourself.';
  function fillReq() { $$('#req [name]').forEach(function (el) { var v = st.req[el.name]; if (v != null) el.value = v; }); }
  function renderReq() {
    $$('#req [name]').forEach(function (el) { st.req[el.name] = el.value; }); save();
    var m = G.requestText(st.req, CFG);
    $('#rqSubj').value = m.subject; $('#rqBody').value = m.body; $('#rqMail').href = G.mailto(to, m);
  }
  $('#req').addEventListener('input', renderReq); $('#req').addEventListener('change', renderReq);
  $('#rqCopy').onclick = function () { copy($('#rqSubj').value + '\n\n' + $('#rqBody').value); };

  window.__sg = { state: function () { return st; } };
  renderModels(); renderListings(); fillNeeds(); renderChecklist(); fillReq(); renderReq();
})();
