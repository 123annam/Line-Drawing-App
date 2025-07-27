const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let startX = 0;
let startY = 0;

let lines = [];
let redoStack = [];

// Load saved lines from localStorage on page load
const saved = localStorage.getItem("savedLines");
if (saved) {
  lines = JSON.parse(saved);
  drawLines();
}

canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDrawing) return;

  const endX = e.offsetX;
  const endY = e.offsetY;
  lines.push({ startX, startY, endX, endY });
  redoStack = []; // Clear redo on new draw
  drawLines();
  isDrawing = false;
});

function drawLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    ctx.beginPath();
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Save current drawing to localStorage
  localStorage.setItem("savedLines", JSON.stringify(lines));
}

function undo() {
  if (lines.length > 0) {
    const line = lines.pop();
    redoStack.push(line);
    drawLines();
  }
}

function redo() {
  if (redoStack.length > 0) {
    const line = redoStack.pop();
    lines.push(line);
    drawLines();
  }
}

function clearCanvas() {
  lines = [];
  redoStack = [];
  drawLines();
  localStorage.removeItem("savedLines");
}

function saveAsImage() {
  const link = document.createElement("a");
  link.download = "line-drawing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
