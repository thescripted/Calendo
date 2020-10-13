import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Navigation from './components/Navigation'
import {BoardProvider}  from './StoreContext.tsx'
import {WeekProvider} from './TimeContext.tsx'



ReactDOM.render(
    <React.StrictMode>
        <BoardProvider>
            <WeekProvider>
                <Navigation />
                <App />
            </WeekProvider>
        </BoardProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
