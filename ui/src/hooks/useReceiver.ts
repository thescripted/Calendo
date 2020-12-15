import React from "react";
import { IBoard } from "../types/calendo";
import { WebSocketContext } from "../context/WebSocketContext";

/**
 * useReceiver receives incoming messages from a WebSocket and deserializes it.
 * @returns {receivedBoardState} the deserialized boardState.
 *
 * The entire board gets sent across the socket, but I believe this might be expensive.
 *
 */
export default function useReceiver() {
    const [receivedBoardState, setReceived] = React.useState<
        IBoard | undefined
    >(undefined);
    const socket = React.useContext(WebSocketContext);

    // Initializes the socket event handlers to listen to the required events.
    React.useEffect(() => {
        socket.on("init", function (msg: string) {
            const payload = JSON.parse(msg, dateTimeReviver);
            setReceived(payload);
        });

        socket.on("calendar", function (msg: string) {
            const payload = JSON.parse(msg, dateTimeReviver);
            setReceived(payload);
        });
    }, [socket]);
    return receivedBoardState;
}

// Not ideal to have this defined here. Should move to utils.
function dateTimeReviver(key: string, value: string) {
    if (key === "date" || key === "startTime" || key === "endTime") {
        return new Date(value);
    }
    return value;
}
