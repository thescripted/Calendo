import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Navigation from './components/Navigation'
import {BoardProvider, useCount} from './StoreContext'



ReactDOM.render(
    <React.StrictMode>
        <BoardProvider>
            <Navigation />
            <App />
        </BoardProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
