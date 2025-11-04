import { Server } from "socket.io";

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join-document", (docId) => {
      socket.join(docId);
      socket.to(docId).emit("user-joined", socket.id);
    });

    socket.on("text-change", ({ docId, delta }) => {
      socket.to(docId).emit("text-change", delta);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
}
