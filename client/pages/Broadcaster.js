import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from "react";
import {View, Text, Alert, TouchableOpacity } from "react-native";
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";
import { socket } from "./signaling";
import {broadcasterStyle} from "./styles";

// Creazione del function component BroadcasterPage
const BroadcasterPage = ({ route, navigation }) => {

    const { streamId } = route.params;
    const [stream, setStream] = useState(null);
    const peerConnections = useRef({}); // Registro delle connessioni peer
    const [error, setError] = useState(null);
    const [errorShown, setErrorShown] = useState(false); 
    const [isFront, setIsFront] = useState(true); 
    const localStream = useRef(null); // Stream locale del broadcaster
    const [userCount, setUserCount] = useState(0);

    
    useEffect(() => {
        if (error && !errorShown) {
            // Mostra l'alert solo se l'errore non è stato ancora mostrato
            Alert.alert("Errore", error, [{ text: "OK", onPress: () => {
                setError(null);
                setErrorShown(true);  // Imposta flag a true dopo aver mostrato l'alert
                navigation.navigate("Home"); // Reindirizza alla Home
            }}]);
        }
    }, [error, errorShown]);

    // Funzione per acquisire lo stream video e audio
    const getStream = async (facing) => {
        try {
            const localStream = await mediaDevices.getUserMedia({
                video: { facingMode: facing ? "user" : "environment" }, // Fotocamera frontale o posteriore
                audio: true // Abilita l'audio
            });

            return localStream; // Restituisce lo stream acquisito
        } catch (error) {
            // Se l'utente non autorizza l'accesso alla fotocamera o al microfono mostra errore
            setError("Autorizzazione necessaria. Per continuare consenti l'accesso alla fotocamera e al microfono dalle impostazioni del dispositivo.");
        }
    };

    useEffect(() => {
        
        // Funzione per avviare la trasmissione
        const startBroadcast = async () => {
            console.log("Sono il broadcaster dello stream:", streamId);

            // Impostazione dello stream locale del broadcaster
            localStream.current = await getStream(isFront);
            setStream(localStream.current);
            // Se non è stato possibile acquisire lo stream interrompe l'esecuzione
            if (!localStream.current) return;

            // Invia il segnale di inizio trasmissione al signaling server
            socket.emit("start-broadcast", streamId);

            // Aggiunge il listener per i segnali dai viewer
            socket.on("signal", async ({ from, signal }) => {
                console.log("Ricevuto segnale:", signal);
                // Ottiene la connessione peer del viewer
                const pc = peerConnections.current[from];
                // Se la connessione peer non è stata trovata
                if (!pc) {
                    // Mostra un messaggio di warning
                    console.warn(`Connessione peer non trovata per viewer ${from}`);
                    return;
                }
                // Se il segnale contiene un candidato ICE
                if (signal.candidate) {
                    console.log(`Aggiungo ICE Candidate dal viewer ${from}`);
                    // Aggiunge il candidato ICE alla connessione peer
                    await pc.addIceCandidate(signal);
                // Se il segnale contiene una risposta SDP
                } else if (signal.type === "answer") {
                    console.log(`Ricevuta risposta SDP dal viewer ${from}`);
                    // Imposta la descrizione remota del viewer
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                }
                    
            });
            
            // Aggiunge il listener per i viewer che si uniscono alla trasmissione
            socket.on("join-viewer", async (viewerId) => {

                // Crea una nuova connessione peer per il viewer
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });
        
                // Flusso del broadcaster aggiunto al peer connection
                localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current));
    
                // Invia i candidati ICE al viewer
                pc.onicecandidate = (event) => {
                    // Se è stato generato un candidato ICE lo invia al viewer
                    if (event.candidate) {
                        console.log(`Invio ICE Candidate al viewer ${viewerId}`);
                        socket.emit("signal", { streamId, to: viewerId, signal: event.candidate });
                    }
                };
        
                // Crea un'offerta SDP per il viewer
                const offer = await pc.createOffer();
                // Imposta l'offerta SDP come descrizione locale
                await pc.setLocalDescription(offer);
                console.log(`Invio offerta SDP al viewer ${viewerId}`);
                // Invia l'offerta SDP al viewer
                socket.emit("signal", { streamId, to: viewerId, signal: offer });
    
                // Aggiungi la connessione al registro
                peerConnections.current[viewerId] = pc;
                        
            });
            
            // Aggiunge il listener per l'aggiornamento del numero di utenti connessi
            socket.on("user-count", (count) => {
                console.log("Utenti connessi:", count);
                setUserCount(count-1);
            });

            // Aggiunge il listener per la disconnessione di un viewer
            socket.on("viewer-disconnect", (viewerId) => {
                console.log(`Viewer disconnesso: ${viewerId}`);
                // Ottiene la connessione peer del viewer
                const pc = peerConnections.current[viewerId];
                // Se la connessione peer è stata trovata
                if (pc) {
                    // Chiude la connessione peer e la rimuove dal registro
                    pc.close();
                    delete peerConnections.current[viewerId];
                }
            });

            // Aggiunge il listener per la ricezione di un errore relativo all'ID diretta
            socket.on("error-broadcaster", () => {
                setError("ID diretta già utilizzato");
            });
        
        };

        startBroadcast();

        return () => {
            // Disconnette il broadcaster quando il componente viene smontato
            socket.emit("leave-broadcast", streamId);
            console.log("ho invocato leave broadcast");
            // Chiude tutte le connessioni peer 
            Object.values(peerConnections.current).forEach((pc) => pc.close());
        };
    }, [streamId, navigation]);

    // Funzione per cambiare la fotocamera
    const toggleCamera = async () => {
        // Se non è stato acquisito lo stream interrompe l'esecuzione
        if (!stream) return;

        // Cambia la fotocamera frontale/posteriore
        const newIsFront = !isFront;
        setIsFront(newIsFront);

        // Acquisisce il nuovo stream con la fotocamera selezionata
        const newStream = await getStream(newIsFront);
        // Se non è stato possibile acquisire il nuovo stream interrompe l'esecuzione
        if (!newStream) return;

        // Sostituzione dei nuovi track nella connessione peer
        Object.values(peerConnections.current).forEach((pc) => {
            pc.getSenders().forEach((sender) => {
                if (sender.track.kind === "video") {
                    sender.replaceTrack(newStream.getVideoTracks()[0]);
                }
            });
        });

        // Sostituzione del nuovo stream nel broadcaster
        localStream.current = newStream;
        setStream(newStream);
    };

    return (
        <View style={broadcasterStyle.container}>
        <Text style={broadcasterStyle.title}> Diretta "{streamId}" avviata</Text>
        <Text style={broadcasterStyle.title}>Utenti connessi: {userCount}</Text>
    
        {/* Mostra il tuo flusso locale del broadcaster */}
        {stream && (
            <RTCView streamURL={stream.toURL()} style={broadcasterStyle.video} /> 
        )}
        {!stream && (
            <Text>Sto cercando di acquisire il flusso video...</Text>
        )}
    
        {/* Pulsante per cambiare la fotocamera */}
        <TouchableOpacity style={broadcasterStyle.switchButton} onPress={toggleCamera}>
            <Text style={broadcasterStyle.buttonText}>🔄 Cambia fotocamera</Text>
        </TouchableOpacity>
        </View>
    );
};


export default BroadcasterPage;
