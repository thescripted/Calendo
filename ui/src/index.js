import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import SignIn from "./SignIn";
import Navigation from "./components/Navigation";
import Layout from "./components/Layout";
import { BoardProvider } from "./context/StoreContext.tsx";
import { WeekProvider } from "./context/TimeContext.tsx";
import { WebSocketProvider } from "./context/WebSocketContext";
import { URLProvider } from "./context/URLContext";

ReactDOM.render(
    <React.StrictMode>
        <SignIn />
    </React.StrictMode>,
    document.getElementById("root")
);
