import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Navigation from './components/Navigation'

ReactDOM.render(
    <React.StrictMode>
        <Navigation />
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
