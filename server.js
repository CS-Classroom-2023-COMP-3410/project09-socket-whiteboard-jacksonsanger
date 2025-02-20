const { Server } = require("socket.io");

const io = new Server(3000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store board state
let boardState = [];

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send current board state to new user
    socket.emit("loadBoard", boardState);

    // Listen for draw actions
    socket.on("draw", (data) => {
        boardState.push(data); // Store drawing action

        // ✅ Broadcast drawing action to ALL clients, including the sender
        io.emit("draw", data);
    });

    // Listen for clear board event
    socket.on("clearBoard", () => {
        boardState = []; // Reset board state
        io.emit("clearBoard"); // Notify all clients
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

console.log("Socket.IO server running on port 3000");
