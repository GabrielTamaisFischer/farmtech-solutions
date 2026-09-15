(function () {
  const data = window.FARMTECH_DATA;
  const page = document.body.dataset.page || 'dashboard';
  const records = data.records;
  let selectedCulture = 'Todas';
  let selectedIndicator = 'Todos';
  let toastTimer;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const fmt = (number, digits = 0) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(number);
  const sum = (values) => values.reduce((acc, value) => acc + value, 0);
  const mean = (values) => values.length ? sum(values) / values.length : 0;
  const median = (values) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };
  const std = (values) => values.length > 1 ? Math.sqrt(sum(values.map(v => (v - mean(values)) ** 2)) / (values.length - 1)) : 0;
  const metric = (record) => selectedIndicator === 'Área' ? record.areaHa : selectedIndicator === 'Insumos' ? record.volumeTotalL : record.areaHa;
  const metricLabel = () => selectedIndicator === 'Área' ? 'Área (ha)' : selectedIndicator === 'Insumos' ? 'Volume total (L)' : 'Área (ha)';
  const filtered = () => records.filter(record => selectedCulture === 'Todas' || record.culturaShort === selectedCulture);

  function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function setupShell() {
    const nav = $('#side-nav');
    if (nav) nav.innerHTML = [
      ['dashboard.html', '⌂', 'Dashboard', 'dashboard'],
      ['analysis.html', '◌', 'Análises', 'analysis'],
      ['analysis.html#estatisticas', '∿', 'Estatísticas', 'stats'],
      ['data.html', '▤', 'Dados', 'data'],
      ['about.html', 'i', 'Sobre o projeto', 'about']
    ].map(([href, icon, label, key]) => `<a class="nav-link ${page === key ? 'active' : ''}" href="${href}" ${page === key ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</a>`).join('');
    $$('.mobile-menu').forEach(button => button.addEventListener('click', () => document.body.classList.toggle('menu-open')));
    $$('.sidebar a').forEach(link => link.addEventListener('click', () => document.body.classList.remove('menu-open')));
    const status = $('.data-status');
    if (status) status.innerHTML = `<span class="status-dot" aria-hidden="true"></span>${data.meta.isMock ? 'Demonstração conectada' : 'Dados atualizados'}`;
    const updated = $('.last-update');
    if (updated) updated.textContent = `Última atualização · ${data.meta.updatedAt}`;
  }

  function selectOptions(selector, options, initial = '') {
    const element = $(selector);
    if (!element) return;
    element.innerHTML = options.map(value => `<option value="${value}">${value}</option>`).join('');
    element.value = initial;
  }

  function wireFilters() {
    const culture = $('#culture-filter');
    const indicator = $('#indicator-filter');
    if (!culture) return;
    selectOptions('#culture-filter', ['Todas', ...new Set(records.map(record => record.culturaShort))], selectedCulture);
    selectOptions('#indicator-filter', ['Todos', 'Área', 'Insumos'], selectedIndicator);
    culture.addEventListener('change', event => { selectedCulture = event.target.value; renderDashboard(); showToast('Filtros aplicados aos indicadores.'); });
    indicator.addEventListener('change', event => { selectedIndicator = event.target.value; renderDashboard(); showToast('Indicador atualizado.'); });
    const refresh = $('#refresh-data');
    if (refresh) refresh.addEventListener('click', () => { refresh.classList.add('is-refreshing'); setTimeout(() => { refresh.classList.remove('is-refreshing'); showToast('Dados atualizados.'); }, 500); });
  }

  function renderKpis() {
    const target = $('#kpi-grid');
    if (!target) return;
    const rows = filtered();
    if (!rows.length) { target.innerHTML = `<div class="card empty-state" style="grid-column:1/-1"><strong>Nenhum dado encontrado</strong>Escolha outra cultura para visualizar os indicadores.</div>`; return; }
    const area = sum(rows.map(row => row.areaHa));
    const volume = sum(rows.map(row => row.volumeTotalL));
    const values = rows.map(metric);
    const cards = [
      ['Registros', fmt(rows.length), 'no recorte selecionado', 'neutral'],
      ['Área monitorada', `${fmt(area)} ha`, `${fmt(mean(rows.map(row => row.areaHa)), 1)} ha em média`, ''],
      ['Insumos estimados', `${fmt(volume)} L`, `${fmt(mean(rows.map(row => row.volumeTotalL)))} L em média`, ''],
      [metricLabel(), `${fmt(mean(values), selectedIndicator === 'Insumos' ? 0 : 1)} ${selectedIndicator === 'Insumos' ? 'L' : 'ha'}`, `desvio de ${fmt(std(values), selectedIndicator === 'Insumos' ? 0 : 2)}`, 'neutral']
    ];
    target.innerHTML = cards.map(([label, value, meta, kind]) => `<article class="card kpi"><span class="kpi-accent"></span><span class="kpi-label">${label}</span><strong class="kpi-value">${value}</strong><span class="kpi-meta ${kind}">${kind ? '—' : '↗'} ${meta}</span></article>`).join('');
  }

  function svgLineChart(rows) {
    if (!rows.length) return `<div class="chart-empty"><div><strong>Sem dados para este recorte</strong>Altere os filtros para continuar.</div></div>`;
    const width = 700, height = 245, pad = { top: 16, right: 18, bottom: 35, left: 42 };
    const values = rows.map(metric), max = Math.max(...values, 1), min = Math.min(...values, 0), range = max - min || 1;
    const points = rows.map((row, index) => {
      const x = pad.left + (index * (width - pad.left - pad.right)) / Math.max(rows.length - 1, 1);
      const y = height - pad.bottom - ((metric(row) - min) / range) * (height - pad.top - pad.bottom);
      return { x, y, value: metric(row), label: row.culturaShort };
    });
    const line = points.map(point => `${point.x},${point.y}`).join(' ');
    const area = `${pad.left},${height - pad.bottom} ${line} ${points[points.length - 1].x},${height - pad.bottom}`;
    const grid = [0, .5, 1].map(step => {
      const y = pad.top + step * (height - pad.top - pad.bottom);
      const value = max - step * range;
      return `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e4e7e3"/><text x="4" y="${y + 4}" fill="#8c938e" font-size="10">${fmt(value, selectedIndicator === 'Insumos' ? 0 : 1)}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de ${metricLabel()} por cultura">${grid}<polygon points="${area}" fill="#e8efe8" opacity=".7"/><polyline points="${line}" fill="none" stroke="#2f5d3a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff" stroke="#2f5d3a" stroke-width="3"><title>${p.label}: ${fmt(p.value)} </title></circle><text x="${p.x}" y="${height - 10}" text-anchor="middle" fill="#6b716d" font-size="11">${p.label}</text>`).join('')}</svg>`;
  }

  function svgBarChart(rows) {
    if (!rows.length) return `<div class="chart-empty"><div><strong>Nenhum dado encontrado</strong>Não há valores neste recorte.</div></div>`;
    const width = 500, height = 245, max = Math.max(...rows.map(row => row.volumeTotalL), 1), barWidth = Math.min(100, (width - 100) / rows.length - 22);
    const bars = rows.map((row, index) => {
      const x = 55 + index * ((width - 90) / rows.length) + 18;
      const barHeight = row.volumeTotalL / max * 165;
      const y = 190 - barHeight;
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="${index ? '#6f8f72' : '#2f5d3a'}"><title>${row.cultura}: ${fmt(row.volumeTotalL)} L</title></rect><text x="${x + barWidth / 2}" y="210" text-anchor="middle" fill="#6b716d" font-size="11">${row.culturaShort}</text><text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#1f2421" font-size="11" font-weight="700">${fmt(row.volumeTotalL)}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Volume total de insumos comparado por cultura"><line x1="35" y1="190" x2="480" y2="190" stroke="#e4e7e3"/>${bars}</svg>`;
  }

  function renderDashboard() {
    renderKpis();
    const rows = filtered();
    const line = $('#line-chart'); if (line) line.innerHTML = svgLineChart(rows);
    const bars = $('#bar-chart'); if (bars) bars.innerHTML = svgBarChart(rows);
    const insights = $('#insights-grid');
    if (insights) insights.innerHTML = rows.length ? [
      ['01', 'Cobertura', `${fmt(sum(rows.map(row => row.areaHa)))} hectares aparecem no recorte selecionado.`],
      ['02', 'Variabilidade', `A dispersão do indicador selecionado é de ${fmt(std(rows.map(metric)), selectedIndicator === 'Insumos' ? 0 : 2)} ${selectedIndicator === 'Insumos' ? 'L' : 'ha'}.`],
      ['03', 'Leitura', selectedIndicator === 'Insumos' ? 'O volume é uma estimativa de manejo baseada nas ruas registradas.' : 'A área é um cálculo geométrico baseado nas dimensões informadas.']
    ].map(([index, title, text]) => `<article class="card insight-card"><div class="insight-index">${index} · ${title}</div><p>${text}</p></article>`).join('') : `<div class="card empty-state" style="grid-column:1/-1"><strong>Nenhum dado encontrado para os filtros selecionados.</strong>Tente selecionar “Todas”.</div>`;
  }

  function renderStats() {
    const container = $('#analysis-list');
    if (!container) return;
    container.innerHTML = data.analyses.map(analysis => {
      const values = records.map(record => analysis.id === 'area' ? record.areaHa : record.volumeTotalL);
      const unit = analysis.id === 'area' ? ' ha' : ' L';
      return `<article class="card analysis-card ${analysis.id === 'area' ? 'open' : ''}"><div class="analysis-top"><div><span class="tag">R · ${analysis.method}</span><h2 style="margin-top:14px">${analysis.title}</h2><p>${analysis.description}</p></div><button class="button button-small analysis-toggle" aria-expanded="${analysis.id === 'area'}">${analysis.id === 'area' ? 'Recolher' : 'Ver análise'}</button></div><div class="analysis-detail"><div class="stat-row"><div class="stat-box"><span>Média</span><strong>${fmt(mean(values), analysis.id === 'area' ? 1 : 0)}${unit}</strong></div><div class="stat-box"><span>Mediana</span><strong>${fmt(median(values), analysis.id === 'area' ? 1 : 0)}${unit}</strong></div><div class="stat-box"><span>Desvio padrão</span><strong>${fmt(std(values), analysis.id === 'area' ? 2 : 0)}${unit}</strong></div><div class="stat-box"><span>Mínimo</span><strong>${fmt(Math.min(...values))}${unit}</strong></div><div class="stat-box"><span>Máximo</span><strong>${fmt(Math.max(...values))}${unit}</strong></div></div><div class="analysis-copy"><div><h3>Interpretação</h3><p>${analysis.interpretation}</p></div><div><h3>Metodologia e fonte</h3><p>${analysis.method}. O front-end exibe o resultado preparado pelo R/Python e não altera a metodologia. <a class="source-link" target="_blank" rel="noreferrer" href="${data.meta.sourceUrl}">Ver código no GitHub ↗</a></p></div></div></div></article>`;
    }).join('');
    $$('.analysis-toggle').forEach(button => button.addEventListener('click', () => {
      const card = button.closest('.analysis-card'); const open = card.classList.toggle('open'); button.textContent = open ? 'Recolher' : 'Ver análise'; button.setAttribute('aria-expanded', open);
    }));
  }

  function renderDataTable() {
    const body = $('#data-rows'), search = $('#data-search'), count = $('#record-count');
    if (!body) return;
    const draw = () => {
      const query = (search?.value || '').toLowerCase();
      const rows = records.filter(row => Object.values(row).join(' ').toLowerCase().includes(query));
      if (count) count.textContent = `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'} · demonstração`;
      body.innerHTML = rows.length ? rows.map(row => `<tr><td><span class="culture-pill">${row.culturaShort}</span></td><td>${fmt(row.areaHa, 1)} ha</td><td>${fmt(row.areaM2)} m²</td><td>${fmt(row.qtdRuas)}</td><td>${fmt(row.comprimentoRuaM)} m</td><td>${row.produto}</td><td>${fmt(row.volumeTotalL)} L</td></tr>`).join('') : `<tr><td colspan="7"><div class="empty-state"><strong>Nenhum dado encontrado para esta busca.</strong>Ajuste o termo e tente novamente.</div></td></tr>`;
    };
    search?.addEventListener('input', draw); draw();
  }

  function renderAbout() {
    const sources = $('#source-list');
    if (!sources) return;
    sources.innerHTML = data.sources.map(source => source.available ? `<a class="source-row" target="_blank" rel="noreferrer" href="${source.url}"><span>${source.label}</span><small>Ver código ↗</small></a>` : `<div class="source-row unavailable"><span>${source.label}</span><small>Link não informado</small></div>`).join('');
  }

  function init() {
    setupShell();
    document.documentElement.dataset.mock = String(data.meta.isMock);
    if (page === 'dashboard') { wireFilters(); renderDashboard(); }
    if (page === 'analysis' || page === 'stats') renderStats();
    if (page === 'data') renderDataTable();
    if (page === 'about') renderAbout();
    const mark = $('#mock-mark'); if (mark && data.meta.isMock) mark.textContent = 'DADOS DE DEMONSTRAÇÃO';
  }
  init();
})();
