const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const liveStreams = {}; // Memorizza gli ID delle dirette e i relativi utenti


io.on("connection", (socket) => {
  console.log("Utente connesso:", socket.id);

  // Invia la lista delle dirette attive quando richiesto
  socket.on("get-streams", () => {
    const streamIds = Object.keys(liveStreams); // Ottiene tutti gli ID delle dirette attive
    socket.emit("available-streams", streamIds); // Invia la lista al client che ha fatto la richiesta
  });


  // Gestione dell'avvio di una diretta
  socket.on("start-broadcast", (streamId) => {
    if (liveStreams[streamId]) {
      socket.emit("error-broadcaster", "Diretta già esistente");
      return;
    }

    liveStreams[streamId] = { broadcaster: socket.id, viewers: [] };
    socket.join(streamId);
    console.log(`Diretta avviata: ${streamId}`);
  });

  // Gestione dell'ingresso di un viewer
  socket.on("join-broadcast", (streamId) => {
    const stream = liveStreams[streamId];
    if (!stream) {
      socket.emit("error-viewer", "Diretta non trovata");
      return;
    }

    // Aggiungi il viewer
    stream.viewers.push(socket.id);
    socket.join(streamId);

    // Comunica il numero di utenti connessi
    io.to(streamId).emit("user-count", stream.viewers.length + 1); // broadcaster + viewers
    socket.to(streamId).emit("join-viewer", socket.id);
    console.log("Ho inviato il numero di viewer");

    console.log(`Utente ${socket.id} si è unito alla diretta: ${streamId}`);
    console.log("Numero di viewer connessi:", stream.viewers.length)

  
  });

  // Gestione dei segnali (offerte, risposte, candidati ICE)
  socket.on("signal", ({ streamId, signal }) => {
    const stream = liveStreams[streamId];
    if (!stream) return;

    if (socket.id === stream.broadcaster) {
      // Se il segnale arriva dal broadcaster, inoltralo a tutti i viewer
      stream.viewers.forEach((viewerId) => {
        console.log("Inoltro segnale al viewer", viewerId);
        io.to(viewerId).emit("signal", { from: socket.id, signal });
      });

    } else {
      // Se il segnale arriva da un viewer, inoltralo al broadcaster
      io.to(stream.broadcaster).emit("signal", { from: socket.id, signal });
    }
  });

  // Gestione della disconnessione
  socket.on("disconnect", () => {
    console.log("Utente disconnesso:", socket.id);
  });

  socket.on("leave-broadcast", (streamId) => {
    const stream = liveStreams[streamId];
    if (!stream) return;

    console.log(`Utente ${socket.id} ha lasciato la diretta: ${streamId}`);
    if (stream.broadcaster === socket.id) {
      // Termina la diretta
      stream.viewers.forEach((viewerId) => {
        io.to(viewerId).emit("broadcast-ended");
      });
      delete liveStreams[streamId];
      console.log(`Diretta terminata: ${streamId}`);
    } else {
      socket.broadcast.emit("viewer-disconnect", socket.id);
      const index = stream.viewers.indexOf(socket.id);
      if (index !== -1) {
        stream.viewers.splice(index, 1);
        socket.leave(streamId);
        io.to(streamId).emit("user-count", stream.viewers.length + 1);
        console.log("stream dopo la disconnessione:", stream);
      }
    }
    
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Signaling server in ascolto su porta 3000");
});
