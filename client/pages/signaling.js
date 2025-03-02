import io from "socket.io-client";

//export const socket = io("http://192.168.1.90:3000"); // URL del signaling server MAC
//export const socket = io("http://192.168.1.122:3000"); // URL del signaling server MAC

export const socket = io("http://172.20.10.2:3000", {perMessageDeflate: {} }); // URL del signaling server HOTSPOT

 

