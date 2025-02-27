const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const liveStreams = {}; // Memorizza gli ID delle dirette e i relativi utenti

// Funzione per gestire la disconnessione di un utente da una diretta
function handlerLeaveBroadcast(socket, streamId) {
  const stream = liveStreams[streamId];
  if (!stream) return;

  console.log(`Utente ${socket.id} ha lasciato la diretta: ${streamId}`);
  // Se è il broadcaster a lasciare la diretta, termina la diretta
  if (stream.broadcaster === socket.id) {
    // Termina la diretta
    stream.viewers.forEach((viewerId) => {
      io.to(viewerId).emit("broadcast-ended");
    });
    delete liveStreams[streamId]; // Rimuove la diretta dalla lista
    console.log(`Diretta terminata: ${streamId}`);
    // Se è un viewer a lasciare la diretta, viene rimosso dalla lista dei viewer
  } else {
    socket.broadcast.emit("viewer-disconnect", socket.id);
    const index = stream.viewers.indexOf(socket.id);
    if (index !== -1) {
      stream.viewers.splice(index, 1); // Rimuove il viewer dalla lista
      socket.leave(streamId); // Lascia la diretta
      io.to(streamId).emit("user-count", stream.viewers.length + 1); // Aggiorna il numero di utenti connessi
      console.log("stream dopo la disconnessione:", stream);
    }
  }
}

io.on("connection", (socket) => {
  console.log("Utente connesso:", socket.id);

  // Invia la lista delle dirette attive quando richiesto
  socket.on("get-streams", () => {
    const streamIds = Object.keys(liveStreams); // Ottiene tutti gli ID delle dirette attive
    socket.emit("available-streams", streamIds); // Invia la lista al client che ha fatto la richiesta
  });


  // Gestione dell'avvio di una diretta
  socket.on("start-broadcast", (streamId) => {
    // Se esiste già una diretta con lo stesso ID, invia un errore
    if (liveStreams[streamId]) {
      socket.emit("error-broadcaster", "Diretta già esistente");
      return;
    }

    // Altrimenti, crea una nuova diretta e aggiunge il broadcaster
    liveStreams[streamId] = { broadcaster: socket.id, viewers: [] };
    socket.join(streamId);
    console.log(`Diretta avviata: ${streamId}`);
  });

  // Gestione dell'ingresso di un viewer
  socket.on("join-broadcast", (streamId) => {
    // Se la diretta non esiste, invia un errore
    const stream = liveStreams[streamId];
    if (!stream) {
      socket.emit("error-viewer", "Diretta non trovata");
      return;
    }

    // Altrimenti aggiunge il viewer all'elenco dei partecipanti e alla diretta
    stream.viewers.push(socket.id);
    socket.join(streamId);

    // Comunica il numero di utenti connessi
    io.to(streamId).emit("user-count", stream.viewers.length + 1); // broadcaster + viewers
    socket.to(streamId).emit("join-viewer", socket.id);

    console.log(`Utente ${socket.id} si è unito alla diretta: ${streamId}`);
    console.log("Numero di viewer connessi:", stream.viewers.length)

  });

  // Gestione dei segnali (offerte, risposte, candidati ICE)
  socket.on("signal", ({ streamId, to, signal }) => {
    // Se la diretta non esiste, non fa nulla
    const stream = liveStreams[streamId];
    if (!stream) return;

    // Se il segnale arriva dal broadcaster, lo inoltra al viewer
    if (socket.id === stream.broadcaster) {
      // Il viewer a cui inviare il segnale è specificato in 'to'
      const targetViewerId = to; 
    
      // Se il viewer specificato esiste, invia il segnale
      if (targetViewerId) {
        console.log(`Inoltro il segnale del broadcaster: ${stream.broadcaster} al viewer: ${targetViewerId}`);
        console.log("Segnale:", signal);
        io.to(targetViewerId).emit("signal", { from: socket.id, signal });
        // Se il viewer non esiste, fa un log
      } else {
        console.log("Nessun viewer specificato per invio del segnale");
      }
      // Se il segnale arriva da un viewer, lo inoltra al broadcaster
    }else {
      console.log(`Inoltro segnale del viewer ${socket.id} al broadcaster:`, stream.broadcaster);
      console.log("Segnale:", signal);
      io.to(stream.broadcaster).emit("signal", { from: socket.id, signal });
    }
  });

  // Gestione della disconnessione di un utente
  socket.on("disconnect", () => {
    console.log("Utente disconnesso:", socket.id);

    // Troviamo in quale diretta era coinvolto il broadcaster/viewer
    const streamIds = Object.keys(liveStreams);

    streamIds.forEach((streamId) => {
      const stream = liveStreams[streamId];

      // Se l'utente disconnesso era il broadcaster o un viewer, gestisce la disconnessione
      if (stream.broadcaster === socket.id || stream.viewers.includes(socket.id)) {
        handlerLeaveBroadcast(socket, streamId);
      }
    });
  });
  
  // Gestione dell'uscita di un broadcaster/viewer
  socket.on("leave-broadcast", (streamId) => {
    handlerLeaveBroadcast(socket, streamId);
  });
    
});

// Avvio del server sulla porta 3000
server.listen(3000, "0.0.0.0", () => {
  console.log("Signaling server in ascolto su porta 3000");
});
