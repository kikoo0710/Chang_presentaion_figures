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

const growthLine = document.querySelector('#cagr-growth-line');

const pointsToCurve = (points) => {
  if (points.length < 2) {
    return '';
  }

  const commands = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = (current.x + next.x) / 2;

    commands.push(
      `C ${controlX.toFixed(2)} ${current.y.toFixed(2)}, ${controlX.toFixed(2)} ${next.y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`
    );
  }

  return commands.join(' ');
};

const cagrNote = document.querySelector('.cagr-note');

const updateGrowthCurve = () => {
  const curvePoints = marketData.map((item, index) => ({
    x: ((index + 0.5) / marketData.length) * 100,
    y: 100 - (item.value / maxMarketValue) * 100
  }));

  growthLine.setAttribute('d', pointsToCurve(curvePoints));

  const arrowHeadPoint = curvePoints[curvePoints.length - 1];
  cagrNote.style.left = `${Math.max(arrowHeadPoint.x - 18, 0)}%`;
  cagrNote.style.top = `${Math.max(arrowHeadPoint.y - 9, 2)}%`;
};

requestAnimationFrame(updateGrowthCurve);
window.addEventListener('resize', updateGrowthCurve);

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
