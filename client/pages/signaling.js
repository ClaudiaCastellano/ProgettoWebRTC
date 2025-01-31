import io from "socket.io-client";

export const socket = io("http://192.168.1.90:3000"); // URL del signaling server MAC

//export const socket = io("http://100.102.99.75:3000"); // URL del signaling server UNINA 

//export const socket = io("http://172.20.10.3:3000"); // URL del signaling server HOTSPOT

//export const socket = io("http://192.168.1.73:3000"); // URL del signaling server WINDOWS
