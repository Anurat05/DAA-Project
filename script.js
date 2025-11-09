let array = [];
let running = false;
let speed = 200;

const visualizer = document.getElementById('visualizer');
const algoSelect = document.getElementById('algorithm');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const arraySizeInput = document.getElementById('arraySize');
const extraControls = document.getElementById('extraControls');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================== BASIC SETUP =====================
function generateArray(size = 20) {
  visualizer.innerHTML = '';
  array = [];
  for (let i = 0; i < size; i++) {
    const val = Math.floor(Math.random() * 300) + 20;
    array.push(val);
    const bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.height = `${val}px`;
    visualizer.appendChild(bar);
  }
}

function updateExtraControls() {
  const algo = algoSelect.value;
  extraControls.innerHTML = '';

  if (algo === 'greedy') {
    extraControls.innerHTML = `
      <label>Target:
        <input type="number" id="greedyTarget" value="63" min="1">
      </label>`;
  } else if (algo === 'nqueens') {
    extraControls.innerHTML = `
      <label>N (4–12):
        <input type="number" id="nQueensN" value="8" min="4" max="12">
      </label>`;
  } else if (algo === 'tsp') {
    extraControls.innerHTML = `
      <label>Nodes (3–8):
        <input type="number" id="tspNodes" value="5" min="3" max="8">
      </label>`;
  } else if (algo === 'knapsack') {
    extraControls.innerHTML = `
      <label>Items:
        <input type="number" id="knapItems" value="4" min="2" max="8">
      </label>
      <label>Capacity:
        <input type="number" id="knapCap" value="10" min="1">
      </label>`;
  }
}

// ===================== DIVIDE & CONQUER (MERGE SORT) =====================
async function mergeSort(arr, l, r) {
  if (!running) return;
  if (l >= r) return;

  const m = Math.floor((l + r) / 2);
  await mergeSort(arr, l, m);
  await mergeSort(arr, m + 1, r);
  await merge(arr, l, m, r);
}

async function merge(arr, l, m, r) {
  const bars = document.getElementsByClassName('bar');
  let left = arr.slice(l, m + 1);
  let right = arr.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;

  while (i < left.length && j < right.length && running) {
    bars[k].style.backgroundColor = 'red';
    await sleep(speed);
    if (left[i] < right[j]) {
      arr[k] = left[i];
      bars[k].style.height = `${left[i]}px`;
      i++;
    } else {
      arr[k] = right[j];
      bars[k].style.height = `${right[j]}px`;
      j++;
    }
    bars[k].style.backgroundColor = 'cyan';
    k++;
  }

  while (i < left.length && running) {
    arr[k] = left[i];
    bars[k].style.height = `${left[i]}px`;
    i++; k++; await sleep(speed);
  }
  while (j < right.length && running) {
    arr[k] = right[j];
    bars[k].style.height = `${right[j]}px`;
    j++; k++; await sleep(speed);
  }
}

// ===================== GREEDY (COIN CHANGE) =====================
async function runGreedy() {
  const target = parseInt(document.getElementById('greedyTarget').value);
  const coins = [25, 10, 5, 1];
  const container = visualizer;
  container.innerHTML = `<h3>Greedy Coin Change</h3>`;

  let remaining = target;
  for (let c of coins) {
    const count = Math.floor(remaining / c);
    remaining -= count * c;

    const box = document.createElement('div');
    box.style.border = "1px solid cyan";
    box.style.margin = "5px";
    box.style.padding = "10px";
    box.innerText = `${count} coin(s) of ${c}`;
    container.appendChild(box);
    await sleep(400);
  }

  const done = document.createElement('div');
  done.style.marginTop = '10px';
  done.innerHTML = `<b>Total: ${target}, Remaining: ${remaining}</b>`;
  container.appendChild(done);
}

// ===================== BACKTRACKING (N-QUEENS) =====================
async function runNQueens() {
  const n = parseInt(document.getElementById('nQueensN').value);
  const board = Array.from({ length: n }, () => Array(n).fill(0));
  visualizer.innerHTML = '';
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${n}, 80px)`;
  grid.style.margin = 'auto';
  grid.style.width = `${n * 40}px`;
  visualizer.appendChild(grid);

  const cells = [];
  for (let i = 0; i < n * n; i++) {
    const cell = document.createElement('div');
    cell.style.width = '80px';
    cell.style.height = '80px';
    cell.style.border = '1px solid #333';
    cell.style.background = (Math.floor(i / n) + i) % 2 ? '#111' : '#333';
    grid.appendChild(cell);
    cells.push(cell);
  }

  async function placeQueen(row) {
    if (!running) return false;
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 1;
        cells[row * n + col].style.background = 'cyan';
        await sleep(speed);
        if (await placeQueen(row + 1)) return true;
        board[row][col] = 0;
        cells[row * n + col].style.background = (row + col) % 2 ? '#111' : '#333';
      }
    }
    return false;
  }

  function isSafe(r, c) {
    for (let i = 0; i < r; i++) {
      if (board[i][c]) return false;
      if (c - (r - i) >= 0 && board[i][c - (r - i)]) return false;
      if (c + (r - i) < n && board[i][c + (r - i)]) return false;
    }
    return true;
  }

  await placeQueen(0);
}

// ===================== BRANCH & BOUND (TSP) =====================
async function runTSP() {
  const nodes = parseInt(document.getElementById('tspNodes').value);
  const container = visualizer;
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const points = Array.from({ length: nodes }, () => ({
    x: Math.random() * 350 + 25,
    y: Math.random() * 350 + 25
  }));

  ctx.fillStyle = 'cyan';
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  });

  // simple nearest neighbor visualization (approximation)
  let visited = Array(nodes).fill(false);
  let path = [0];
  visited[0] = true;

  for (let step = 0; step < nodes - 1 && running; step++) {
    let last = path[path.length - 1];
    let nearest = -1;
    let bestDist = 1e9;
    for (let i = 0; i < nodes; i++) {
      if (!visited[i]) {
        let dx = points[i].x - points[last].x;
        let dy = points[i].y - points[last].y;
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) {
          bestDist = d;
          nearest = i;
        }
      }
    }
    visited[nearest] = true;
    path.push(nearest);

    // Draw step
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[last].x, points[last].y);
    ctx.lineTo(points[nearest].x, points[nearest].y);
    ctx.stroke();
    await sleep(400);
  }

  // Close the loop
  ctx.beginPath();
  ctx.moveTo(points[path[path.length - 1]].x, points[path[path.length - 1]].y);
  ctx.lineTo(points[path[0]].x, points[path[0]].y);
  ctx.stroke();
}

// ===================== DYNAMIC PROGRAMMING (KNAPSACK) =====================
async function runKnapsack() {
  const n = parseInt(document.getElementById('knapItems').value);
  const cap = parseInt(document.getElementById('knapCap').value);
  const weights = Array.from({ length: n }, () => Math.floor(Math.random() * 9) + 1);
  const values = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 5);
  visualizer.innerHTML = `<h3>Items (w, v): ${weights.map((w, i) => `(${w},${values[i]})`).join(' ')}</h3>`;
  const table = document.createElement('table');
  table.style.margin = 'auto';
  table.style.borderCollapse = 'collapse';
  visualizer.appendChild(table);

  const dp = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(0));
  for (let i = 0; i <= n; i++) {
    const row = document.createElement('tr');
    for (let w = 0; w <= cap; w++) {
      const cell = document.createElement('td');
      cell.innerText = dp[i][w];
      cell.style.border = '1px solid cyan';
      cell.style.width = '30px';
      cell.style.height = '30px';
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  const cells = table.getElementsByTagName('td');

  for (let i = 1; i <= n && running; i++) {
    for (let w = 1; w <= cap && running; w++) {
      const idx = i * (cap + 1) + w;
      cells[idx].style.background = 'red';
      await sleep(speed);
      if (weights[i - 1] <= w)
        dp[i][w] = Math.max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w]);
      else dp[i][w] = dp[i - 1][w];
      cells[idx].innerText = dp[i][w];
      cells[idx].style.background = 'cyan';
    }
  }
  const res = document.createElement('div');
  res.innerHTML = `<h3>Max Value: ${dp[n][cap]}</h3>`;
  visualizer.appendChild(res);
}

// ===================== BUTTONS =====================
startBtn.onclick = async () => {
  if (!running) {
    running = true;
    startBtn.innerText = 'Pause';
    const algo = algoSelect.value;

    if (algo === 'merge') await mergeSort(array, 0, array.length - 1);
    else if (algo === 'greedy') await runGreedy();
    else if (algo === 'nqueens') await runNQueens();
    else if (algo === 'tsp') await runTSP();
    else if (algo === 'knapsack') await runKnapsack();
  } else {
    running = false;
    startBtn.innerText = 'Start';
  }
};

resetBtn.onclick = () => {
  running = false;
  startBtn.innerText = 'Start';
  generateArray(arraySizeInput.value);
  updateExtraControls();
};

speedInput.oninput = () => { speed = 500 - speedInput.value; };
arraySizeInput.oninput = () => { generateArray(arraySizeInput.value); };
algoSelect.onchange = updateExtraControls;

window.onload = () => {
  generateArray();
  updateExtraControls();
};
// // ---------- Status panel helper ----------
// function updateStatus({ action = '', range = '', depth = null, left = [], right = [], i = null, j = null, k = null } = {}) {
//   const statusText = document.getElementById('statusText');
//   const rangeText = document.getElementById('rangeText');
//   const arraysText = document.getElementById('arraysText');
//   const indicesText = document.getElementById('indicesText');

//   if (statusText) statusText.innerHTML = `<span class="label">Status:</span> ${action}`;
//   if (rangeText) rangeText.innerHTML = depth !== null
//     ? `<span class="label">Range:</span> [${range}] &nbsp; <span class="small">Depth: ${depth}</span>`
//     : `<span class="label">Range:</span> [${range}]`;

//   if (arraysText) {
//     // show left and right arrays as monospace boxes
//     const leftHtml = `<div class="array-box"><strong>Left</strong><div>${left.length ? left.join(', ') : '[]'}</div></div>`;
//     const rightHtml = `<div class="array-box"><strong>Right</strong><div>${right.length ? right.join(', ') : '[]'}</div></div>`;
//     arraysText.innerHTML = `<div class="arrays-inline">${leftHtml}${rightHtml}</div>`;
//   }

//   if (indicesText) {
//     const parts = [];
//     if (i !== null) parts.push(`i=${i}`);
//     if (j !== null) parts.push(`j=${j}`);
//     if (k !== null) parts.push(`k=${k}`);
//     indicesText.innerHTML = `<span class="label">Indices:</span> <span class="indices">${parts.join(' | ') || '-'}</span>`;
//   }
// }
