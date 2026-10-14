/* Fresh-capture metadata and an optional prior-period overlay for expanded charts. */
(function () {
  'use strict';
  var model = window.__DASH__;
  if (!model || !model.windows || !model.windows.length) return;
  var compare = false;
  var primary = document.getElementById('dash');
  if (!primary) return;
  var button = document.createElement('button');
  button.type = 'button';
  button.id = 'hannah-analytics-compare';
  button.className = 'hannah-analytics-compare';
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', 'Compare the prior period in expanded dimension charts');
  button.textContent = 'Compare prior period';
  var range = document.createElement('p');
  range.className = 'hannah-analytics-range';
  range.id = 'hannah-analytics-range';
  range.setAttribute('aria-live', 'polite');
  var right = primary.querySelector('.dash-right');
  if (right) right.appendChild(button);
  var top = primary.querySelector('.dash-top');
  if (top) top.insertAdjacentElement('afterend', range);
  function selected() {
    var current = primary.querySelector('.dw[aria-pressed="true"]');
    var days = current ? Number(current.dataset.days) : model.defaultDays;
    return model.windows.find(function (w) { return w.days === days; }) || model.windows[0];
  }
  function within(first, last) {
    return (model.daily || []).filter(function (r) { return r.d >= first && r.d <= last; });
  }
  function text(value) { return value == null ? 'not captured' : String(value); }
  function dateNumber(stamp) { return Date.parse(stamp + 'T00:00:00Z') / 86400000; }
  function fmt(key, value) {
    if (value == null || !Number.isFinite(value)) return 'not captured';
    if (key === 'c' || key === 'p') return (value * 100).toFixed(1) + '%';
    if (key === 'a') {
      var rounded = Math.round(value);
      return Math.floor(rounded / 60) + ':' + String(rounded % 60).padStart(2, '0');
    }
    if (key === 'h') return value.toLocaleString('en-US', {maximumFractionDigits: 1}) + ' h';
    return Math.round(value).toLocaleString('en-US');
  }
  function safe(value) { return String(value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function paint(svg, key, win, previous) {
    var keys = key === 'rn' ? ['r', 'n'] : [key];
    var current = within(win.from, win.to);
    var prior = within(previous.from, previous.to);
    var values = [];
    [current, prior].forEach(function (rows) { rows.forEach(function (row) { keys.forEach(function (k) {
      if (row[k] != null && Number.isFinite(row[k])) values.push(row[k]);
    }); }); });
    if (values.length < 2 || !prior.some(function (row) { return keys.some(function (k) { return row[k] != null; }); })) return false;
    var width = 600, height = 170, left = 66, right = 12, top = 12, bottom = 30;
    var lo = Math.min(0, Math.min.apply(null, values));
    var hi = Math.max.apply(null, values);
    if (hi === lo) hi = lo + 1;
    hi += (hi - lo) * 0.06;
    function x(index) { return left + (index / Math.max(1, win.rangeDays - 1)) * (width - left - right); }
    function y(value) { return top + (1 - (value - lo) / (hi - lo)) * (height - top - bottom); }
    var parts = [];
    for (var j = 0; j <= 3; j++) {
      var value = lo + (hi - lo) * j / 3;
      parts.push('<line class="grid" x1="' + left + '" x2="' + (width-right) + '" y1="' + y(value).toFixed(1) + '" y2="' + y(value).toFixed(1) + '"/>');
      parts.push('<text class="tick" x="' + (left-8) + '" y="' + (y(value)+4).toFixed(1) + '" text-anchor="end">' + safe(fmt(keys[0], value)) + '</text>');
    }
    [current, prior].forEach(function (rows, period) {
      keys.forEach(function (field, series) {
        var line = '', pen = false, previousIndex = null;
        rows.forEach(function (row) {
          var index = dateNumber(row.d) - dateNumber(period ? previous.from : win.from);
          var value = row[field];
          if (value == null || !Number.isFinite(value)) { pen = false; return; }
          if (previousIndex != null && index !== previousIndex + 1) pen = false;
          line += (pen ? 'L' : 'M') + x(index).toFixed(1) + ' ' + y(value).toFixed(1) + ' ';
          pen = true;
          previousIndex = index;
        });
        if (!line) return;
        parts.push('<path class="line' + (series ? ' b' : '') + (period ? ' hannah-analytics-prior-line' : '') + '" d="' + line + '"><title>' + (period ? 'Prior' : 'Current') + ' ' + (series ? 'new viewers' : key === 'rn' ? 'returning viewers' : safe(field)) + '</title></path>');
      });
    });
    [0, Math.floor((win.rangeDays-1)/2), win.rangeDays-1].forEach(function (index, i) {
      parts.push('<text class="tick" x="' + x(index).toFixed(1) + '" y="' + (height-8) + '" text-anchor="' + (i===0?'start':i===1?'middle':'end') + '">Day ' + (index+1) + '</text>');
    });
    svg.innerHTML = parts.join('');
    svg.setAttribute('aria-label', 'Current period and prior period aligned by day for ' + key);
    svg.setAttribute('role', 'img');
    return true;
  }
  function update() {
    var w = selected();
    var prior = w.prior || {};
    range.textContent = 'Selected: ' + w.from + ' to ' + w.to + '. Prior: ' + text(prior.from) + ' to ' + text(prior.to) + '. ' + w.scope + '.';
    var relevant = within(w.from, w.to);
    var previous = prior.from && prior.to ? within(prior.from, prior.to) : [];
    var canCompare = previous.length >= 2 && relevant.length >= 2;
    button.disabled = !canCompare;
    button.title = canCompare ? 'Solid: selected period. Dashed: prior period. Applies to expanded dimension charts.' : 'The captured export does not include enough prior-period daily rows for this window.';
    if (!canCompare) compare = false;
    button.setAttribute('aria-pressed', String(compare));
    var panel = document.getElementById('dept-panel');
    if (!panel || panel.hidden) return;
    var header = panel.querySelector('.dwin thead th:last-child');
    if (header && header.textContent === 'Retention score') {
      header.textContent = 'Average viewed';
      panel.querySelectorAll('.dwin tbody tr').forEach(function (row, i) {
        var last = row.querySelector('td:last-child');
        if (last) last.textContent = model.windows[i].watch.averageViewPercentage || 'not captured';
      });
    }
    var cap = panel.querySelector('.dwin-cap');
    if (cap) cap.textContent = 'These are captured Studio windows with exact dates shown above. Longer windows contain shorter ones; do not add their totals.';
    panel.querySelectorAll('svg[data-c="q"]').forEach(function (svg) {
      var card = svg.closest('.dchart');
      if (card) card.remove();
    });
    var existing = panel.querySelector('.hannah-analytics-compare-note');
    if (existing) existing.remove();
    if (compare) {
      var count = 0;
      panel.querySelectorAll('svg[data-c]').forEach(function (svg) { if (paint(svg, svg.dataset.c, w, prior)) count++; });
      var note = document.createElement('p');
      note.className = 'dept-note hannah-analytics-compare-note';
      note.textContent = count ? 'Solid lines show the selected dates; dashed lines show the immediately prior dates, aligned by day of each window. Missing data remains a gap. This comparison applies to the expanded charts.' : 'The prior daily export does not contain these dimensions. No comparison line is inferred.';
      panel.appendChild(note);
    }
  }
  function schedule() { queueMicrotask(update); }
  function rerenderOpenPanel() {
    var open = primary.querySelector('.dept[aria-expanded="true"]');
    if (open) { open.click(); open.click(); }
    schedule();
  }
  button.addEventListener('click', function () { compare = !compare; rerenderOpenPanel(); });
  primary.querySelectorAll('.dw,.dept').forEach(function (control) {
    control.addEventListener('click', schedule);
    control.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') schedule(); });
  });
  primary.addEventListener('click', function (event) { if (event.target.closest('.dept-close')) schedule(); });
  update();
})();
