const knownMarketValues = {
  2021: 987.0,
  2024: 1615.4,
  2030: 5930.2
};

const forecastCagr = 0.248;

const compoundInterpolate = (startYear, startValue, endYear, endValue, year) => {
  const growthRate = (endValue / startValue) ** (1 / (endYear - startYear)) - 1;
  return startValue * (1 + growthRate) ** (year - startYear);
};

const forecastBackcast = (targetYear, targetValue, cagr, year) =>
  targetValue / (1 + cagr) ** (targetYear - year);

const marketData = Array.from({ length: 10 }, (_, index) => {
  const year = 2021 + index;
  const isKnown = Object.hasOwn(knownMarketValues, year);
  let value = knownMarketValues[year];

  if (!value && year < 2024) {
    value = compoundInterpolate(2021, knownMarketValues[2021], 2024, knownMarketValues[2024], year);
  }

  if (!value && year > 2024) {
    value = forecastBackcast(2030, knownMarketValues[2030], forecastCagr, year);
  }

  return {
    year: String(year),
    value,
    type: year <= 2024 ? 'historical' : 'forecast',
    isKnown
  };
});

const maxMarketValue = 6000;

const regions = [
  { name: 'Asia Pacific', color: 'var(--purple-deep)' },
  { name: 'MEA', color: 'var(--blue-pale)' },
  { name: 'Latin America', color: 'var(--blue)' },
  { name: 'Europe', color: 'var(--lavender)' },
  { name: 'North America', color: 'var(--violet)' }
];

const housingElevatorData = [
  { label: 'Without elevator', value: 42, color: '#86b72c' },
  { label: 'With elevator', value: 58, color: '#8f8f8f' }
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
  group.className = `report-bar-group ${item.isKnown ? 'known' : 'estimated'}`;

  const height = `${(item.value / maxMarketValue) * 100}%`;
  group.style.setProperty('--bar-height', height);

  group.innerHTML = `
    <div class="report-value">${formatMoney(item.value)}</div>
    <div class="report-bar ${item.type}" style="height: ${height};"></div>
    <div class="report-year">${item.year}</div>
  `;

  marketBars.appendChild(group);
});

const trendArrowLayer = document.querySelector('#trend-arrow-layer');
const cagrNote = document.querySelector('.cagr-note');

const renderTrendArrow = () => {
  trendArrowLayer.innerHTML = '';

  const plotRect = document.querySelector('.report-plot').getBoundingClientRect();
  const points = [...document.querySelectorAll('.report-bar')].map((bar) => {
    const rect = bar.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - plotRect.left,
      y: rect.top - plotRect.top
    };
  });

  points.slice(0, -1).forEach((point, index) => {
    const next = points[index + 1];
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const segment = document.createElement('div');
    segment.className = 'trend-segment';
    segment.style.left = `${point.x}px`;
    segment.style.top = `${point.y}px`;
    segment.style.width = `${length}px`;
    segment.style.transform = `rotate(${angle}deg)`;
    trendArrowLayer.appendChild(segment);
  });

  const finalPoint = points[points.length - 1];
  const previousPoint = points[points.length - 2];
  const finalAngle = Math.atan2(finalPoint.y - previousPoint.y, finalPoint.x - previousPoint.x) * (180 / Math.PI);

  const arrowHead = document.createElement('div');
  arrowHead.className = 'trend-arrow-head';
  arrowHead.style.left = `${finalPoint.x - 4}px`;
  arrowHead.style.top = `${finalPoint.y}px`;
  arrowHead.style.transform = `translateY(-50%) rotate(${finalAngle}deg)`;
  trendArrowLayer.appendChild(arrowHead);

  cagrNote.style.left = `${Math.max((finalPoint.x / plotRect.width) * 100 - 18, 58)}%`;
  cagrNote.style.top = `${Math.max((finalPoint.y / plotRect.height) * 100 - 8, 2)}%`;
};

requestAnimationFrame(renderTrendArrow);
window.addEventListener('resize', renderTrendArrow);

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

const housingStats = document.querySelector('#housing-stats');

housingElevatorData.forEach((item) => {
  const row = document.createElement('div');
  row.className = 'housing-stat';
  row.innerHTML = `
    <i style="background: ${item.color};"></i>
    <span>${item.label}</span>
    <strong>${item.value}%</strong>
  `;
  housingStats.appendChild(row);
});
