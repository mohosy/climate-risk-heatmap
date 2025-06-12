const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const tempInput = document.getElementById("tempInput");
const rainInput = document.getElementById("rainInput");
const budgetInput = document.getElementById("budgetInput");
const tempValue = document.getElementById("tempValue");
const rainValue = document.getElementById("rainValue");
const budgetValue = document.getElementById("budgetValue");

const simulateBtn = document.getElementById("simulateBtn");
const randomizeBtn = document.getElementById("randomizeBtn");
const avgRisk = document.getElementById("avgRisk");
const hotspots = document.getElementById("hotspots");
const resilience = document.getElementById("resilience");
const alert = document.getElementById("alert");

const rows = 22;
const cols = 34;
const cellW = canvas.width / cols;
const cellH = canvas.height / rows;

let grid = [];

function noise(x, y) {
  return (
    Math.sin(x * 0.37 + y * 0.21) * 0.45 +
    Math.cos(x * 0.17 - y * 0.32) * 0.32 +
    Math.sin(x * 0.73 + y * 0.11) * 0.23
  );
}

function riskColor(score) {
  const t = Math.max(0, Math.min(1, score / 100));
  const r = Math.round(35 + t * 220);
  const g = Math.round(185 - t * 140);
  const b = Math.round(215 - t * 190);
  return `rgb(${r},${g},${b})`;
}

function generateGrid() {
  const temp = Number(tempInput.value);
  const rain = Number(rainInput.value);
  const budget = Number(budgetInput.value);

  const adaptation = budget / 100;
  grid = [];

  for (let r = 0; r < rows; r += 1) {
    const row = [];
    for (let c = 0; c < cols; c += 1) {
      const elevation = (Math.sin(c * 0.25) + Math.cos(r * 0.3) + 2) / 4;
      const coastal = 1 - Math.abs((c / cols) * 2 - 1);
      const climateStress = temp * 16 + rain * 12 + noise(c, r) * 15;
      const hazard = climateStress + coastal * 20 + (1 - elevation) * 18;
      const adaptiveOffset = adaptation * (30 + elevation * 10);
      const risk = Math.max(0, Math.min(100, hazard - adaptiveOffset));

      row.push({ elevation, coastal, risk });
    }
    grid.push(row);
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = grid[r][c];
      ctx.fillStyle = riskColor(cell.risk);
      ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  for (let r = 0; r <= rows; r += 1) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(canvas.width, r * cellH);
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c += 1) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, canvas.height);
    ctx.stroke();
  }
}

function updateStats() {
  let total = 0;
  let high = 0;

  for (const row of grid) {
    for (const cell of row) {
      total += cell.risk;
      if (cell.risk > 70) high += 1;
    }
  }

  const count = rows * cols;
  const avg = total / count;
  const budget = Number(budgetInput.value);
  const resilienceScore = Math.max(0, Math.min(100, 100 - avg + budget * 0.35));

  avgRisk.textContent = avg.toFixed(1);
  hotspots.textContent = String(high);
  resilience.textContent = resilienceScore.toFixed(1);

  if (avg > 68) {
    alert.textContent = "Severe";
    alert.style.color = "#ff6f7f";
  } else if (avg > 45) {
    alert.textContent = "Moderate";
    alert.style.color = "#ffd166";
  } else {
    alert.textContent = "Low";
    alert.style.color = "#5ee6a7";
  }
}

function runSimulation() {
  generateGrid();
  drawGrid();
  updateStats();
}

function syncLabels() {
  tempValue.textContent = Number(tempInput.value).toFixed(1);
  rainValue.textContent = Number(rainInput.value).toFixed(1);
  budgetValue.textContent = budgetInput.value;
}

[tempInput, rainInput, budgetInput].forEach((input) => {
  input.addEventListener("input", () => {
    syncLabels();
    runSimulation();
  });
});

simulateBtn.addEventListener("click", runSimulation);

randomizeBtn.addEventListener("click", () => {
  tempInput.value = (1 + Math.random() * 3.5).toFixed(1);
  rainInput.value = (0.5 + Math.random() * 2.5).toFixed(1);
  budgetInput.value = String(Math.floor(Math.random() * 101));
  syncLabels();
  runSimulation();
});

syncLabels();
runSimulation();
