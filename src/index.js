import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Navigation from './components/Navigation'
import Layout from './components/Layout'
import {BoardProvider}  from './StoreContext.tsx'
import {WeekProvider} from './TimeContext.tsx'



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
