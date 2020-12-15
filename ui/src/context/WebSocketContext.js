import React from "react";
import io from "socket.io-client";

const DEV_URL = "http://localhost:5000";
const WebSocketContext = React.createContext(undefined);
let socket;
let value;

function WebSocketProvider(props) {
    if (!socket) {
        socket = io.connect(DEV_URL);
        socket.on("connect", function () {
            socket.emit("init", "User has connected");
        });
        value = socket;
    }
    return <WebSocketContext.Provider value={value} {...props} />;
}
export { WebSocketContext, WebSocketProvider };
