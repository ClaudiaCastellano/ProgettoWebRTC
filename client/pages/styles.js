import {  StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "flex-start", alignItems: "center", paddingTop: 20 },
    title: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, width: "80%", marginBottom: 20 },
    video: { width: "100%", height: "90%" },
});


/*export const homestyle = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, width: "80%", marginBottom: 20 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    streamItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc", alignItems: "center" },
    streamText: { fontSize: 16 }
});*/

export const homestyle = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#1E1E1E", alignItems: "center", justifyContent: "center", padding: 20},
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 20},
    input: { width: "100%", padding: 15, borderRadius: 10, backgroundColor: "#333", color: "#fff", marginBottom: 10, fontSize: 16, textAlign: "center"},
    button: { backgroundColor: "#6200ea", padding: 15, borderRadius: 30, alignItems: "center", marginVertical: 10, width: "80%"},
    buttonSecondary: { backgroundColor: "#03DAC5", padding: 15, borderRadius: 30, alignItems: "center", marginVertical: 10, width: "80%" },
    buttonChiudi: { backgroundColor: "#cd5c5c", padding: 15, borderRadius: 30, alignItems: "center", marginVertical: 10, width: "40%"},
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold"},
    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center"},
    modalContent: { backgroundColor: "#222", padding: 20, borderRadius: 15, width: "90%", alignItems: "center"},
    modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 15},
    streamItem: { backgroundColor: "#03DAC5", padding: 8, borderRadius: 10, marginVertical: 5, width: "250", alignItems: "center"},
    streamText: { color: "#fff", fontSize: 16},
  });

export const broadcasterStyle = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
    video: { width: "100%", height: "60%", backgroundColor: "#000" },
    switchButton: { marginTop: 20, padding: 10, backgroundColor: "#03DAC5", borderRadius: 30 },
    buttonText: { color: "#fff", fontSize: 16 }
});