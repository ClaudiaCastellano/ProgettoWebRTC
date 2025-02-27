import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {View, Text, TextInput, TouchableOpacity, FlatList, Modal, BackHandler} from "react-native";
import { socket } from "./signaling";
import { homestyle } from "./styles";

// Creazione del function component Home
const Home = ({ navigation }) => {
  const [streamId, setStreamId] = useState("");
  const [availableStreams, setAvailableStreams] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    // Riceve la lista delle dirette disponibili
    socket.on("available-streams", (streams) => {
      setAvailableStreams(streams);
    });
    return () => {
      // Disconnette il listener quando il componente viene smontato
      socket.off("available-streams");
    };
  }, []);

  // Blocca il tasto "Back" quando il componente è attivo
  useFocusEffect(
    useCallback(() => {
      const backAction = () => true; // Blocca il tasto "Back"
      
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
  
      return () => backHandler.remove();
    }, [])
  );

  // Funzione per richiedere la lista delle dirette disponibili
  const fetchAvailableStreams = () => {
    socket.emit("get-streams");
    setModalVisible(true);
  };

  // Funzione per unirsi a una diretta
  const joinStream = (selectedId) => {
    setModalVisible(false);
    navigation.navigate("Viewer", { streamId: selectedId });
  };

  // Funzione per avviare una diretta
  const startBroadcast = () => {
    if (streamId.trim() !== "") {
      navigation.navigate("Broadcast", { streamId });
      setStreamId("");
      setShowInput(false);
    }
  };

  // Ritorna gli elementi del componente Home
  return (
    <View style={homestyle.container}>
      <Text style={homestyle.title}>Benvenuto!</Text>

      {!showInput ? (
        <TouchableOpacity style={homestyle.button} onPress={() => setShowInput(true)}>
          <Text style={homestyle.buttonText}>Avvia una diretta</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={homestyle.input}
            placeholder="Inserisci ID diretta"
            placeholderTextColor="#aaa"
            value={streamId}
            onChangeText={setStreamId}
          />
          <TouchableOpacity style={homestyle.button} onPress={startBroadcast}>
            <Text style={homestyle.buttonText}>Conferma e Avvia</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={homestyle.buttonSecondary} onPress={fetchAvailableStreams}>
        <Text style={homestyle.buttonText}>Unisciti a una diretta</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={homestyle.modalContainer}>
          <View style={homestyle.modalContent}>
            <Text style={homestyle.modalTitle}>
              {availableStreams.length > 0
                ? "Seleziona una diretta"
                : "Non ci sono dirette disponibili"}
            </Text>
            <FlatList
              data={availableStreams}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={homestyle.streamItem} onPress={() => joinStream(item)}>
                  <Text style={homestyle.streamText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={homestyle.buttonChiudi} onPress={() => setModalVisible(false)}>
              <Text style={homestyle.buttonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};



export default Home;

