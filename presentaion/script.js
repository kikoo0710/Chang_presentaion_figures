const marketData = [
  { year: '2021', value: 987.0, type: 'historical' },
  { year: '2022', value: 1172.0, type: 'historical' },
  { year: '2023', value: 1378.0, type: 'historical' },
  { year: '2024', value: 1615.4, type: 'historical' },
  { year: '2025', value: 2016.0, type: 'forecast' },
  { year: '2026', value: 2516.0, type: 'forecast' },
  { year: '2027', value: 3140.0, type: 'forecast' },
  { year: '2028', value: 3919.0, type: 'forecast' },
  { year: '2029', value: 4891.0, type: 'forecast' },
  { year: '2030', value: 5930.2, type: 'forecast' }
];

const maxMarketValue = 6000;

const regions = [
  { name: 'Asia Pacific', color: 'var(--purple-deep)' },
  { name: 'MEA', color: 'var(--blue-pale)' },
  { name: 'Latin America', color: 'var(--blue)' },
  { name: 'Europe', color: 'var(--lavender)' },
  { name: 'North America', color: 'var(--violet)' }
];

const regionData = [
  {
    year: '2030',
    total: 5930.2,
    segments: [20, 1.6, 4.4, 36.8, 37.2]
  },
  {
    year: '2024',
    total: 1615.4,
    segments: [15, 2.2, 3.8, 36.8, 42.2]
  }
];

const formatMoney = (value) =>
  `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}M`;

const marketBars = document.querySelector('#market-bars');

marketData.forEach((item) => {
  const group = document.createElement('div');
  group.className = 'report-bar-group';

  const height = `${(item.value / maxMarketValue) * 100}%`;

  group.innerHTML = `
    <div class="report-value">${formatMoney(item.value)}</div>
    <div class="report-bar ${item.type}" style="height: ${height};"></div>
    <div class="report-year">${item.year}</div>
  `;

  marketBars.appendChild(group);
});

const regionChart = document.querySelector('#region-chart');

regionData.forEach((row) => {
  const regionRow = document.createElement('div');
  regionRow.className = 'region-row';

  const segments = row.segments
    .map((width, index) => {
      const region = regions[index];
      return `<div class="segment" title="${region.name}: ${width}%" style="width: ${width}%; background: ${region.color};"></div>`;
    })
    .join('');

  regionRow.innerHTML = `
    <div class="region-year">${row.year}</div>
    <div class="stack-track">
      <div class="stack-bar">${segments}</div>
    </div>
    <div class="region-total">${formatMoney(row.total)}</div>
  `;

  regionChart.appendChild(regionRow);
});

const legend = document.querySelector('#legend');

regions.forEach((region) => {
  const item = document.createElement('div');
  item.className = 'legend-item';
  item.innerHTML = `
    <span class="legend-swatch" style="background: ${region.color};"></span>
    <span>${region.name}</span>
  `;
  legend.appendChild(item);
});
