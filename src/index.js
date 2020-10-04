import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Modal from './components/Modal';

ReactDOM.render(
    <React.StrictMode>
        <App />
        <Modal />
    </React.StrictMode>,
    document.getElementById('root')
);
