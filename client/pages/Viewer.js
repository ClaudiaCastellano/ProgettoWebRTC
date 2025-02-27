import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from "react";
import {View, Text, Alert} from "react-native";
import { RTCView, RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";
import { socket } from "./signaling";
import {styles} from "./styles";

// Creazione del function component ViewerPage
const ViewerPage = ({ route, navigation }) => {
    const { streamId } = route.params;
    const [remoteStreams, setRemoteStreams] = useState([]);
    const pc = useRef(null); 
    const [userCount, setUserCount] = useState(0);
    const [error, setError] = useState(null);
    const [errorShown, setErrorShown] = useState(false); 

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


    useEffect(() => {
        
        // Funzione per avviare la visualizzazione della diretta
        const startViewer = async () => {

            console.log("Sono un viewer dello stream:", streamId);
            try {
                // Inizializza la connessione peer 
                pc.current = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });

                // Invia il segnale di join al signaling server
                socket.emit("join-broadcast", streamId);

                // Aggiunge i candidati ICE alla connessione peer
                pc.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("Invio ICE Candidate:", event.candidate);
                        // Invia il candidato ICE al signaling server
                        socket.emit("signal", { streamId, signal: event.candidate });
                    }
                };
        
                // Aggiunge il listener per i segnali dal signaling server
                socket.on("signal", async ({ from, signal }) => {
                    console.log("Ricevuto segnale:", signal);
                    console.log("pc.current", pc.current);

                    // Se il segnale contiene un'offerta SDP e la connessione non ha ancora una descrizione remota
                    if (signal.type === "offer" && !pc.current.remoteDescription) {
                        console.log("Ricevuta offerta SDP dal broadcaster, preparo risposta...");
                        try {
                            // Imposta la descrizione remota
                            await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
                            console.log("Impostata descrizione remota");
                            // Crea la risposta SDP
                            const answer = await pc.current.createAnswer();
                            // Imposta la descrizione locale
                            await pc.current.setLocalDescription(answer);
                            // Invia la risposta SDP al signaling server
                            socket.emit("signal", { streamId, signal: answer });
                            console.log("Invio risposta SDP al signaling server", answer);
                        } catch (error) {
                            console.log("Errore durante la ricezione dell'offerta:", error);
                        }
                    // Se il segnale contiene un candidato ICE
                    } else if (signal.candidate !== undefined) {
                        // Aggiunge il candidato ICE alla connessione peer
                        pc.current.addIceCandidate(signal);
                        console.log("Aggiunto ICE Candidate:", signal);
                    }
                   
                });
        
                // Aggiunge il listener per la fine della diretta
                socket.on("broadcast-ended", () => {
                    setError("La diretta è stata interrotta");
                });

                // Aggiunge il listener per l'aggiornamento del numero di utenti connessi
                socket.on("user-count", (count) => {
                    console.log("Utenti connessi:", count);
                    setUserCount(count-1);
                });

               // Aggiunge il listener per l'errore di diretta non esistente
                socket.on("error-viewer", () => {
                    setError("ID diretta non esistente");
                });

                // Gestione del flusso ricevuto
                pc.current.ontrack = (event) => {
                    console.log("Nuovo flusso ricevuto:", event.streams[0]);
                    setRemoteStreams((prev) => {
                    const alreadyExists = prev.some((stream) => stream.id === event.streams[0].id);
                    if (!alreadyExists) {
                        return [...prev, event.streams[0]]; // Crea un nuovo array con i flussi precedenti e il nuovo flusso
                    }
                    return prev;
                    });
            
                };
                
            } catch (error) {
                console.error("Errore durante l'inizializzazione della diretta:", error);
                Alert.alert("Errore");
            }
        
        };

        startViewer();

        return () => {
            // Disconnette il viewer quando il componente viene smontato
            socket.emit("leave-broadcast", streamId);
            // Chiude la connessione peer
            if (pc.current) {
                pc.current.close();
                pc.current = null;
                console.log("Connessione chiusa");
            }
        };
    }, [streamId, navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Visualizzando diretta "{streamId}" </Text>
            <Text style={styles.title}>Utenti connessi: {userCount}</Text>
        
            {/* Mostra i flussi remoti */}
            {remoteStreams.length === 0 && (
            <Text>In attesa di flussi remoti...</Text>
            )}
        
            {remoteStreams.map((remoteStream, index) => {
                return (
                    <RTCView key={index} streamURL={remoteStream.toURL()} style={styles.video} />
                );
            })}
        
        </View>
    );
      
};


export default ViewerPage;
