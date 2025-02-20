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
let prevX = 0, prevY = 0;

// Color picker event
document.getElementById("colorPicker").addEventListener("change", (e) => {
    color = e.target.value;
});

// Mouse event listeners
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    prevX = e.clientX - canvas.offsetLeft;
    prevY = e.clientY - canvas.offsetTop;
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    // Emit draw event to server instead of drawing directly
    socket.emit("draw", { x, y, prevX, prevY, color });

    prevX = x;
    prevY = y;
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
});

// Only draw when server confirms the action
socket.on("draw", ({ x, y, prevX, prevY, color }) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
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
    boardState.forEach(({ x, y, prevX, prevY, color }) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
    });
});
