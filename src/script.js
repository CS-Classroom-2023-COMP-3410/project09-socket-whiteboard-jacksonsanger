import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Connect to the Socket.IO server

// Get canvas and context
const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

// Set default drawing settings
let drawing = false;
let color = "#000000";
let brushSize = 3; // Default brush size
let prevX = 0, prevY = 0;

// Get the correct cursor position relative to the canvas
function getCursorPosition(e) {
    const rect = canvas.getBoundingClientRect(); // Get canvas position
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Update color when selected
document.getElementById("colorPicker").addEventListener("change", (e) => {
    color = e.target.value;
});

// Update brush size when slider changes
document.getElementById("brushSize").addEventListener("input", (e) => {
    brushSize = e.target.value;
    document.getElementById("brushSizeDisplay").innerText = brushSize;
});

// Mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    const { x, y } = getCursorPosition(e);
    prevX = x;
    prevY = y;
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const { x, y } = getCursorPosition(e);

    // Emit draw event with brush size
    socket.emit("draw", { x, y, prevX, prevY, color, brushSize });

    prevX = x;
    prevY = y;
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
});

// ONLY actually draw when the server sends a draw event
socket.on("draw", ({ x, y, prevX, prevY, color, brushSize }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
});

// Clear board button
document.getElementById("clearBtn").addEventListener("click", () => {
    socket.emit("clearBoard");
});

// Listen for clear board event from server
socket.on("clearBoard", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Load board state for new users
socket.on("loadBoard", (boardState) => {
    boardState.forEach(({ x, y, prevX, prevY, color, brushSize }) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
    });
});
