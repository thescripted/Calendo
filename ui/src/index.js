import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Navigation from './components/Navigation'
import Layout from './components/Layout'
import {BoardProvider}  from './context/StoreContext.tsx'
import {WeekProvider} from './context/TimeContext.tsx'

// WebSocket Configuration
const socket = new WebSocket('ws://localhost:3030/websocket')
socket.addEventListener('open', function (event) {
  socket.send("Hello!")
})

socket.addEventListener('message', function (event) {
  console.log('Message from server: ', event.data)
})

ReactDOM.render(
    <React.StrictMode>
        <BoardProvider>
            <WeekProvider>
                <Layout>
                    <Navigation />
                    <App />
                </Layout>
            </WeekProvider>
        </BoardProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
