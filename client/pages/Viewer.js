import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Alert
} from "react-native";
import { RTCView, mediaDevices, RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";
import { socket } from "./signaling";
import {styles} from "./styles";


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
                navigation.navigate("Home");
            }}]);
        }
    }, [error, errorShown]);

    useEffect(() => {
        
        const startViewer = async () => {

            console.log("Sono un viewer dello stream:", streamId);
            try {
                pc.current = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });

                socket.emit("join-broadcast", streamId);
                pc.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("Invio ICE Candidate:", event.candidate);
                        socket.emit("signal", { streamId, signal: event.candidate });
                    }
                };
        
                socket.on("signal", async ({ from, signal }) => {
                    console.log("Ricevuto segnale:", signal);
                    console.log("pc.current esiste?", pc.current);

                    console.log("sono un viewer e ho ricevuto un signal");
                    console.log("il tipo di signal è", signal.type);
                    if (signal.type === "offer" && !pc.current.remoteDescription) {
                        console.log("Ricevuta offerta SDP dal broadcaster, preparo risposta...");
                        try {
                            await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
                            console.log("Impostata descrizione remota");
                            const answer = await pc.current.createAnswer();
                            await pc.current.setLocalDescription(answer);
                            socket.emit("signal", { streamId, signal: answer });
                            console.log("Invio risposta SDP al signaling server", answer);
                        } catch (error) {
                            console.error("Errore durante la ricezione dell'offerta:", error);
                        }
                    
                    } else if (signal.candidate !== undefined) {
                        pc.current.addIceCandidate(signal);
                        console.log("Aggiunto ICE Candidate:", signal);
                    }
                   
                });
        
                socket.on("broadcast-ended", () => {
                    setError("La diretta è stata interrotta");
                });

                socket.on("user-count", (count) => {
                    console.log("Utenti connessi:", count);
                    setUserCount(count-1);
                });

               
                socket.on("error-viewer", () => {
                    setError("ID diretta non esistente");
                });

                pc.current.ontrack = (event) => {
                    console.log("Nuovo flusso ricevuto:", event.streams[0]);
                    setRemoteStreams((prev) => {
                    const alreadyExists = prev.some((stream) => stream.id === event.streams[0].id);
                    if (!alreadyExists) {
                        return [...prev, event.streams[0]];
                    }
                    return prev;
                    });
            
                };
                
            } catch (error) {
                console.error("Errore durante l'inizializzazione della diretta:", error);
                Alert.alert("Errore", "Impossibile avviare la diretta. Assicurati di aver dato i permessi necessari.");
            }
        
        };

        startViewer();

        return () => {
            socket.emit("leave-broadcast", streamId);
            if (pc.current) {
                pc.current.close();
                pc.current = null;
                console.log("Connessione chiusa");
            }
        };
    }, [streamId, navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}> "Visualizzando diretta" </Text>
            <Text style={styles.title}>Utenti connessi: {userCount}</Text>
        
            {/* Se sei un viewer, mostra i flussi remoti */}
            {remoteStreams.length === 0 && (
            <Text>In attesa di flussi remoti...</Text>
            )}
        
            {remoteStreams.map((remoteStream, index) => {
                console.log("Flusso remoto ricevuto:", remoteStream);
                console.log("URL del flusso remoto:", remoteStream.toURL());
                console.log("key:", index);
                return (
                    <RTCView key={index} streamURL={remoteStream.toURL()} style={styles.video} />
                );
            })}
        
            {/* Aggiungi log per i flussi locali e remoti */}
            {console.log("Remote streams:", remoteStreams)}
        </View>
    );
      
};


export default ViewerPage;
