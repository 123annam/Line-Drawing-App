const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let startX, startY;
let lines = [];
let redoStack = [];

// Load from localStorage
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
  redoStack = [];
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
  localStorage.setItem("savedLines", JSON.stringify(lines));
}

function undo() {
  if (lines.length > 0) {
    redoStack.push(lines.pop());
    drawLines();
  }
}

function redo() {
  if (redoStack.length > 0) {
    lines.push(redoStack.pop());
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
  const format = document.getElementById("formatSelect").value;

  if (format === "svg") {
    exportToSVG();
    return;
  }

  if (format === "pdf") {
    exportToPDF();
    return;
  }

  let mime = "image/png";
  let ext = "png";

  if (format === "jpeg") {
    mime = "image/jpeg";
    ext = "jpg";
  } else if (format === "webp") {
    mime = "image/webp";
    ext = "webp";
  }

  const link = document.createElement("a");
  link.download = `drawing.${ext}`;
  link.href = canvas.toDataURL(mime);
  link.click();
}

function exportToSVG() {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;

  for (const line of lines) {
    svgContent += `<line x1="${line.startX}" y1="${line.startY}" x2="${line.endX}" y2="${line.endY}" stroke="black" stroke-width="2"/>`;
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.download = "drawing.svg";
  link.href = URL.createObjectURL(blob);
  link.click();
}

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save("drawing.pdf");
}

// Save to file
function saveToFile() {
  const blob = new Blob([JSON.stringify(lines)], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "drawing.json";
  link.href = URL.createObjectURL(blob);
  link.click();
}

// Load from file
function loadFromFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        lines = data;
        redoStack = [];
        drawLines();
      } else {
        alert("Invalid drawing file.");
      }
    } catch (err) {
      alert("Failed to load file.");
    }
  };
  reader.readAsText(file);
}
