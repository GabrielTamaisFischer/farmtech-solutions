(function () {
  const source = window.FARMTECH_DATA;
  const page = document.body.dataset.page || 'dashboard';
  const climateApiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-19.9678&longitude=-44.1983&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=America%2FSao_Paulo';
  const storageKey = 'farmtech-session-records-v2';
  const initialRecords = source.records.map(record => ({ ...record }));
  let records = loadRecords();
  let cultureFilter = 'Todas';
  let chartMetric = 'area';
  let wizardStep = 1;
  let editingId = null;
  let toastTimer;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const number = value => Number(value);
  const fmt = (value, digits = 0) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value) || 0);
  const sum = values => values.reduce((total, value) => total + value, 0);
  const mean = values => values.length ? sum(values) / values.length : 0;
  const std = values => values.length > 1 ? Math.sqrt(sum(values.map(value => (value - mean(values)) ** 2)) / (values.length - 1)) : 0;
  const median = values => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  function loadRecords() {
    try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); return Array.isArray(saved) ? saved : initialRecords; } catch { return initialRecords; }
  }

  function saveRecords() { localStorage.setItem(storageKey, JSON.stringify(records)); }

  function showToast(message) {
    const toast = $('#toast'); if (!toast) return;
    toast.textContent = message; toast.classList.add('is-visible'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function setState(selector, message, state = 'success') {
    const banner = $(selector); if (!banner) return;
    banner.textContent = message; banner.className = `state-banner is-visible state-${state}`;
    clearTimeout(banner._timer); banner._timer = setTimeout(() => { banner.className = 'state-banner'; }, 4000);
  }

  function setupShell() {
    const update = $('#sidebar-update');
    if (update) update.textContent = `Última atualização · ${source.meta.updatedAt}`;
    const sidebar = $('#sidebar');
    $$('.menu-toggle').forEach(button => button.addEventListener('click', () => sidebar?.classList.add('is-open')));
    $$('.sidebar-close').forEach(button => button.addEventListener('click', () => sidebar?.classList.remove('is-open')));
    $$('.nav-link').forEach(link => link.addEventListener('click', () => sidebar?.classList.remove('is-open')));
  }

  function loadClimate() {
    const badge = $('#clima-badge');
    const temperature = $('#clima-temp');
    const precipitation = $('#clima-precip');
    const meta = $('#clima-meta');
    if (!badge || !temperature || !precipitation || !meta) return;
    fetch(climateApiUrl, { headers: { Accept: 'application/json' } })
      .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then(payload => {
        const current = payload.current || {};
        temperature.textContent = `${fmt(current.temperature_2m, 1)} °C`;
        precipitation.textContent = `${fmt(current.precipitation, 1)} mm`;
        badge.className = 'badge badge-real';
        badge.textContent = 'API ao vivo';
        meta.textContent = `Open-Meteo · Betim, MG · ${current.time || 'atualizado agora'}`;
      })
      .catch(() => {
        badge.className = 'badge badge-mock';
        badge.textContent = 'Indisponível';
        meta.textContent = 'A API não respondeu. Execute meteorologia.R para consultar no terminal.';
      });
  }

  function filteredRecords() { return records.filter(record => cultureFilter === 'Todas' || record.culturaShort === cultureFilter); }

  function cultureOptions() {
    return ['Todas', ...new Set(records.map(record => record.culturaShort))];
  }

  function renderKpis() {
    const target = $('#kpi-grid'); if (!target) return;
    const rows = filteredRecords();
    if (!rows.length) { target.innerHTML = '<div class="state-banner is-visible state-empty" style="grid-column:1/-1">Nenhum registro encontrado para este filtro.</div>'; return; }
    const area = sum(rows.map(row => row.areaHa));
    const volume = sum(rows.map(row => row.volumeTotalL));
    const dosage = mean(rows.map(row => row.dosagemMlM));
    target.innerHTML = [
      ['Área total plantada', `${fmt(area, 1)} ha`, `${fmt(sum(rows.map(row => row.areaM2)))} m² calculados`, 'up'],
      ['Volume total de insumo', `${fmt(volume)} L`, `${fmt(rows.length)} ${rows.length === 1 ? 'registro' : 'registros'} no plano`, 'up'],
      ['Culturas no plano', fmt(new Set(rows.map(row => row.cultura)).size), 'vetores cadastrados', 'flat'],
      ['Dosagem média aplicada', `${fmt(dosage)} mL/m`, 'por metro de rua', 'flat']
    ].map(([label, value, meta, type]) => `<article class="card kpi-card"><span class="kpi-label">${label}</span><strong class="kpi-value">${value}</strong><span class="kpi-delta is-${type}">${type === 'up' ? '↗' : '—'} ${meta}</span></article>`).join('');
  }

  function svgBarChart(rows) {
    if (!rows.length) return '<div class="state-banner is-visible state-empty">Sem dados para comparar.</div>';
    const values = rows.map(row => chartMetric === 'area' ? row.areaHa : row.volumeTotalL);
    const max = Math.max(...values, 1); const width = 700; const height = 250; const base = 206; const plotHeight = 164;
    const grid = [0, .5, 1].map(step => { const y = base - step * plotHeight; return `<line x1="46" y1="${y}" x2="680" y2="${y}" stroke="#E4E7E3"/><text x="4" y="${y + 4}" fill="#6B716D" font-size="11">${fmt(max * step, chartMetric === 'area' ? 1 : 0)}</text>`; }).join('');
    const slot = 620 / rows.length; const barWidth = Math.min(112, slot * .5);
    const bars = rows.map((row, index) => { const value = values[index]; const heightValue = Math.max(4, value / max * plotHeight); const x = 54 + index * slot + (slot - barWidth) / 2; const y = base - heightValue; const color = index % 2 ? '#6F8F72' : '#2F5D3A'; return `<rect x="${x}" y="${y}" width="${barWidth}" height="${heightValue}" rx="5" fill="${color}"><title>${esc(row.cultura)}: ${fmt(value, chartMetric === 'area' ? 1 : 0)} ${chartMetric === 'area' ? 'ha' : 'L'}</title></rect><text x="${x + barWidth / 2}" y="${y - 9}" text-anchor="middle" fill="#1F2421" font-size="12" font-weight="700">${fmt(value, chartMetric === 'area' ? 1 : 0)}</text><text x="${x + barWidth / 2}" y="${base + 23}" text-anchor="middle" fill="#6B716D" font-size="12">${esc(row.culturaShort)}</text>`; }).join('');
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Comparação de ${chartMetric === 'area' ? 'área em hectares' : 'volume em litros'} entre culturas">${grid}${bars}</svg>`;
  }

  function svgEvolution() {
    const width = 700, height = 300; const points = [[42, 220], [170, 184], [300, 198], [432, 126], [560, 144], [668, 78]];
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']; const grid = [50, 110, 170, 230].map(y => `<line x1="42" y1="${y}" x2="680" y2="${y}" stroke="#E4E7E3"/>`).join(''); const line = points.map(point => point.join(',')).join(' '); const area = `42,230 ${line} 668,230`;
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução demonstrativa dos indicadores">${grid}<polygon points="${area}" fill="#2F5D3A" opacity=".08"/><polyline points="${line}" fill="none" stroke="#2F5D3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${points.map((point, index) => `<circle cx="${point[0]}" cy="${point[1]}" r="5" fill="#fff" stroke="#2F5D3A" stroke-width="3"/><text x="${point[0]}" y="258" text-anchor="middle" fill="#6B716D" font-size="11">${labels[index]}</text>`).join('')}</svg>`;
  }

  function renderRange(rows) {
    const target = $('#range-area'); const note = $('#range-note'); if (!target) return;
    if (!rows.length) { target.innerHTML = '<div class="state-banner is-visible state-empty">Sem dados para este recorte.</div>'; if (note) note.textContent = ''; return; }
    const values = rows.map(row => row.areaHa); const min = Math.min(...values); const max = Math.max(...values); const avg = mean(values); const span = Math.max(max - min, 1); const meanPosition = ((avg - min) / span) * 100;
    target.innerHTML = `<div class="range-plot"><div class="range-track"><span class="range-fill" style="left:0%;width:100%"></span><span class="range-marker range-marker--mean" style="left:${meanPosition}%" title="Média: ${fmt(avg, 1)} ha"></span></div><div class="range-labels"><span>${fmt(min, 1)}<em>Mínimo</em></span><span class="range-labels-mean">${fmt(avg, 1)}<em>Média</em></span><span>${fmt(max, 1)}<em>Máximo</em></span></div></div>`;
    if (note) note.textContent = `Desvio padrão amostral: ${fmt(std(values), 2)} ha.`;
  }

  function renderInsights(rows) {
    const target = $('#insight-grid'); if (!target) return;
    if (!rows.length) { target.innerHTML = '<div class="state-banner is-visible state-empty">Nenhum insight disponível para este recorte.</div>'; return; }
    const largest = rows.reduce((a, b) => a.volumeTotalL > b.volumeTotalL ? a : b);
    target.innerHTML = [
      ['01', 'Comparação de área', `${fmt(sum(rows.map(row => row.areaHa)), 1)} ha plantados aparecem no recorte selecionado.`],
      ['02', 'Dosagem x volume total', `${esc(largest.cultura)} concentra ${fmt(largest.volumeTotalL)} L estimados no manejo.`],
      ['03', 'Variabilidade', `O desvio padrão das áreas observadas é ${fmt(std(rows.map(row => row.areaHa)), 2)} ha.`]
    ].map(([index, kind, text]) => `<article class="card insight-card"><div class="insight-index">${index}</div><div class="insight-kind">${kind}</div><p class="insight-text">${text}</p></article>`).join('');
  }

  function renderDashboard() {
    const select = $('#filter-cultura');
    if (select && !select.dataset.ready) { select.innerHTML = cultureOptions().map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join(''); select.value = cultureFilter; select.dataset.ready = 'true'; }
    const rows = filteredRecords(); renderKpis();
    const chart = $('#chart-compare'); if (chart) chart.innerHTML = svgBarChart(rows);
    const evolution = $('#chart-evolution'); if (evolution) evolution.innerHTML = svgEvolution();
    renderRange(rows); renderInsights(rows);
    $$('.metric-btn').forEach(button => { const active = button.dataset.metric === chartMetric; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  }

  function wireDashboard() {
    const select = $('#filter-cultura');
    select?.addEventListener('change', event => { cultureFilter = event.target.value; renderDashboard(); showToast('Filtro aplicado aos indicadores.'); });
    $$('.metric-btn').forEach(button => button.addEventListener('click', () => { chartMetric = button.dataset.metric; renderDashboard(); }));
    $('#refresh-data')?.addEventListener('click', event => { const button = event.currentTarget; button.classList.add('is-loading'); setState('#dashboard-state', 'Indicadores recalculados a partir dos registros da sessão.', 'success'); setTimeout(() => button.classList.remove('is-loading'), 500); renderDashboard(); });
    renderDashboard();
    loadClimate();
  }

  function readWizard() {
    const get = id => number($(id)?.value); return { cultura: $('#f-cultura')?.value.trim(), comprimento: get('#f-comprimento'), largura: get('#f-largura'), ruas: get('#f-qtd-ruas'), compRua: get('#f-comp-rua'), produto: $('#f-produto')?.value.trim(), dosagem: get('#f-dosagem'), metodo: $('#f-metodo')?.value.trim() };
  }

  function wizardValues() { const values = readWizard(); return { ...values, areaM2: values.comprimento * values.largura, areaHa: values.comprimento * values.largura / 10000, volume: values.dosagem * values.compRua * values.ruas / 1000 }; }

  function updateWizardPreview() {
    const values = wizardValues(); const area = Number.isFinite(values.areaM2) && values.areaM2 > 0 ? `${fmt(values.areaM2)} m²` : '—'; const ha = Number.isFinite(values.areaHa) && values.areaHa > 0 ? `${fmt(values.areaHa, 2)} ha` : '—'; const volume = Number.isFinite(values.volume) && values.volume > 0 ? `${fmt(values.volume, 1)} L` : '—';
    ['#preview-area', '#preview-area-step2'].forEach(selector => { const element = $(selector); if (element) element.textContent = selector === '#preview-area-step2' ? ha : area; }); const previewHa = $('#preview-ha'); if (previewHa) previewHa.textContent = ha; const previewVolume = $('#preview-volume'); if (previewVolume) previewVolume.textContent = volume;
  }

  function validateStep(step) {
    const values = readWizard(); const valid = step === 1 ? Boolean(values.cultura && values.comprimento > 0 && values.largura > 0) : Boolean(values.ruas > 0 && values.compRua > 0 && values.produto && values.dosagem > 0); const error = $(`#wizard-error-${step}`); if (error) error.textContent = valid ? '' : (step === 1 ? 'Informe a cultura e duas dimensões positivas para calcular a área.' : 'Informe ruas, comprimento da rua, produto e dosagem com valores positivos.'); return valid;
  }

  function renderWizardStep() {
    $$('[data-wizard-step]').forEach(element => { element.hidden = Number(element.dataset.wizardStep) !== wizardStep; });
    $$('[data-step-indicator]').forEach(element => { const value = Number(element.dataset.stepIndicator); element.classList.toggle('is-active', value === wizardStep); element.classList.toggle('is-done', value < wizardStep); });
    const back = $('#wizard-back'); const next = $('#wizard-next'); if (back) back.hidden = wizardStep === 1; if (next) next.textContent = wizardStep === 3 ? 'Adicionar ao plano' : 'Continuar'; updateWizardPreview();
    if (wizardStep === 3) { const values = wizardValues(); const summary = $('#wizard-summary'); if (summary) summary.innerHTML = [['Cultura', values.cultura], ['Terreno', `${fmt(values.comprimento, 2)} × ${fmt(values.largura, 2)} m`], ['Área calculada', `${fmt(values.areaM2, 2)} m² · ${fmt(values.areaHa, 2)} ha`], ['Ruas', `${fmt(values.ruas)} de ${fmt(values.compRua, 2)} m`], ['Produto / dosagem', `${esc(values.produto)} · ${fmt(values.dosagem)} mL/m`], ['Volume total estimado', `${fmt(values.volume, 2)} L`]].map(([label, value]) => `<div class="row"><span>${label}</span><span>${value}</span></div>`).join(''); } }

  function resetWizard() { wizardStep = 1; editingId = null; ['#f-cultura', '#f-comprimento', '#f-largura', '#f-qtd-ruas', '#f-comp-rua', '#f-produto', '#f-dosagem', '#f-metodo'].forEach(selector => { const element = $(selector); if (element) element.value = ''; }); renderWizardStep(); }

  function openWizard(record = null) { resetWizard(); if (record) { editingId = record.id; $('#f-cultura').value = record.cultura; $('#f-comprimento').value = record.comprimentoTerrenoM; $('#f-largura').value = record.larguraTerrenoM; $('#f-qtd-ruas').value = record.qtdRuas; $('#f-comp-rua').value = record.comprimentoRuaM; $('#f-produto').value = record.produto; $('#f-dosagem').value = record.dosagemMlM; $('#f-metodo').value = record.metodo || ''; } const modal = $('#wizard-modal'); if (modal) { modal.hidden = false; document.body.style.overflow = 'hidden'; $('#f-cultura')?.focus(); } renderWizardStep(); }

  function closeWizard() { const modal = $('#wizard-modal'); if (modal) modal.hidden = true; document.body.style.overflow = ''; }

  function commitWizard() { const values = wizardValues(); const id = editingId || `${values.cultura.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${Date.now()}`; const record = { id, cultura: values.cultura, culturaShort: values.cultura.length > 12 ? values.cultura.slice(0, 12) : values.cultura, areaHa: values.areaHa, areaM2: values.areaM2, comprimentoTerrenoM: values.comprimento, larguraTerrenoM: values.largura, qtdRuas: values.ruas, comprimentoRuaM: values.compRua, produto: values.produto, volumeTotalL: values.volume, dosagemMlM: values.dosagem, metodo: values.metodo || null, regiao: null, periodo: 'Registro atual' }; const index = records.findIndex(item => item.id === id); if (index >= 0) records[index] = record; else records.push(record); saveRecords(); closeWizard(); renderDataTable(); showToast(index >= 0 ? 'Registro atualizado com sucesso.' : 'Cultura adicionada ao plano.'); }

  function renderDataTable() {
    const body = $('#data-rows'); if (!body) return; const query = ($('#table-search')?.value || '').trim().toLowerCase(); const visible = records.filter(record => Object.values(record).join(' ').toLowerCase().includes(query));
    const count = $('#record-count'); if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'registro' : 'registros'} · sessão atual`;
    body.innerHTML = visible.length ? visible.map(row => `<tr><td><strong>${esc(row.culturaShort)}</strong><br><span class="badge badge-session">${row.id.startsWith('cana-') || row.id.startsWith('cafe-') ? 'base' : 'sessão'}</span></td><td data-column="area"><strong>${fmt(row.areaHa, 2)} ha</strong><br><span class="section-desc">${fmt(row.areaM2)} m²</span></td><td data-column="area">${fmt(row.comprimentoTerrenoM, 1)} × ${fmt(row.larguraTerrenoM, 1)} m</td><td data-column="streets">${fmt(row.qtdRuas)}</td><td data-column="streets">${fmt(row.comprimentoRuaM, 1)}</td><td data-column="product">${esc(row.produto)}</td><td data-column="product">${fmt(row.dosagemMlM)} mL/m</td><td data-column="volume"><strong>${fmt(row.volumeTotalL, 1)} L</strong></td><td><div class="table-actions"><button class="btn btn-ghost btn-icon" type="button" data-edit="${esc(row.id)}" aria-label="Editar ${esc(row.cultura)}">Editar</button><button class="btn btn-danger-ghost btn-icon" type="button" data-delete="${esc(row.id)}" aria-label="Excluir ${esc(row.cultura)}">Excluir</button></div></td></tr>`).join('') : '<tr><td colspan="9"><div class="state-banner is-visible state-empty">Nenhum registro encontrado para esta busca.</div></td></tr>';
    $$('[data-edit]', body).forEach(button => button.addEventListener('click', () => { const record = records.find(item => item.id === button.dataset.edit); if (record) openWizard(record); }));
    $$('[data-delete]', body).forEach(button => button.addEventListener('click', () => { const index = records.findIndex(item => item.id === button.dataset.delete); if (index < 0) return; const removed = records.splice(index, 1)[0]; saveRecords(); renderDataTable(); showToast(`${removed.culturaShort} excluída da sessão.`); }));
    $$('.col-toggle input').forEach(input => { const name = input.dataset.col; $$(`[data-column="${name}"]`).forEach(cell => { cell.hidden = !input.checked; }); });
  }

  function wireData() {
    const open = () => openWizard(); $('#new-cultura-btn')?.addEventListener('click', open); $('#open-wizard-secondary')?.addEventListener('click', open); $('#table-search')?.addEventListener('input', renderDataTable); $('#wizard-close')?.addEventListener('click', closeWizard); $('#wizard-modal')?.addEventListener('click', event => { if (event.target.id === 'wizard-modal') closeWizard(); });
    $$('.col-toggle input').forEach(input => input.addEventListener('change', renderDataTable));
    $('#restore-btn')?.addEventListener('click', () => { records = initialRecords.map(record => ({ ...record })); saveRecords(); renderDataTable(); setState('#data-state', 'Dados base restaurados para esta sessão.', 'success'); });
    $('#export-csv')?.addEventListener('click', exportCsv);
    $('#wizard-back')?.addEventListener('click', () => { wizardStep = Math.max(1, wizardStep - 1); renderWizardStep(); });
    $('#wizard-next')?.addEventListener('click', () => { if (wizardStep < 3) { if (!validateStep(wizardStep)) return; wizardStep += 1; renderWizardStep(); } else commitWizard(); });
    ['#f-comprimento', '#f-largura', '#f-qtd-ruas', '#f-comp-rua', '#f-dosagem'].forEach(selector => $(selector)?.addEventListener('input', updateWizardPreview));
    renderDataTable(); if (location.hash === '#nova-cultura') openWizard();
  }

  function exportCsv() { const headers = ['cultura', 'area_m2', 'area_ha', 'comprimento_terreno_m', 'largura_terreno_m', 'qtd_ruas', 'comprimento_rua_m', 'produto', 'dosagem_ml_por_metro', 'volume_total_l']; const lines = records.map(row => [row.cultura, row.areaM2, row.areaHa, row.comprimentoTerrenoM, row.larguraTerrenoM, row.qtdRuas, row.comprimentoRuaM, row.produto, row.dosagemMlM, row.volumeTotalL].map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')); const blob = new Blob(['\ufeff' + [headers.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'farmtech_registros.csv'; link.click(); URL.revokeObjectURL(url); showToast('CSV exportado com sucesso.'); }

  function renderStats() {
    const target = $('#analysis-list'); if (!target) return;
    target.innerHTML = source.analyses.map((analysis, index) => { const values = records.map(record => analysis.id === 'area' ? record.areaHa : record.volumeTotalL); const digits = analysis.id === 'area' ? 2 : 0; const unit = analysis.id === 'area' ? 'ha' : 'L'; return `<article class="card analysis-card"><div class="section-head"><div><span class="badge badge-real">R · resultado calculado</span><h2 style="margin-top:10px">${esc(analysis.title)}</h2><p class="section-desc">${esc(analysis.description)}</p></div><span class="badge badge-${index ? 'mock' : 'real'}">${index ? 'Insumos' : 'Área'}</span></div><div class="stat-grid"><div class="stat-mini"><span class="stat-label">Média</span><strong class="stat-value">${fmt(mean(values), digits)} ${unit}</strong></div><div class="stat-mini"><span class="stat-label">Mediana</span><strong class="stat-value">${fmt(median(values), digits)} ${unit}</strong></div><div class="stat-mini"><span class="stat-label">Desvio padrão</span><strong class="stat-value">${fmt(std(values), digits)} ${unit}</strong></div><div class="stat-mini"><span class="stat-label">Mínimo</span><strong class="stat-value">${fmt(Math.min(...values), digits)} ${unit}</strong></div><div class="stat-mini"><span class="stat-label">Máximo</span><strong class="stat-value">${fmt(Math.max(...values), digits)} ${unit}</strong></div></div><div class="analysis-block"><div><h4>Interpretação</h4><p>${esc(analysis.interpretation)}</p></div><div><h4>Fórmula usada</h4><pre class="method-code">${esc(analysis.method)}</pre></div></div></article>`; }).join('');
  }

  function renderAbout() { const target = $('#source-list'); if (!target) return; target.innerHTML = source.sources.map(item => item.available ? `<a class="nav-link" style="border:1px solid var(--color-border);margin-top:8px" href="${esc(item.url)}" target="_blank" rel="noreferrer">${esc(item.label)} <span style="margin-left:auto">↗</span></a>` : `<div class="nav-link" style="border:1px solid var(--color-border);margin-top:8px;cursor:default">${esc(item.label)} <span class="section-desc" style="margin-left:auto">Link não informado</span></div>`).join(''); }

  function init() { setupShell(); if (page === 'dashboard') wireDashboard(); if (page === 'data') wireData(); if (page === 'analysis') renderStats(); if (page === 'about') renderAbout(); }
  init();
})();

