import React, { useState } from 'react';
import Slot from './Slot';
import Row from './Row';
import Card from './Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function displayCard(row, col, collection) {
    if (collection.includes([row, col])) {
        console.log('displaying');
        return <Card />;
    }
    return null;
}

function renderSlot(row_idx, col_idx, cardCollection) {
    return (
        <Slot key={`${row_idx}-${col_idx}`}>{displayCard(row_idx, col_idx, cardCollection)}</Slot>
    );
}

const layout = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Sunday
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Monday
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // ...
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const cardCollection = [[2, 2]];

function App() {
    window.collection = cardCollection;
    console.log(cardCollection);
    return (
        <div className='App'>
            <button>Click on me</button>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {layout.map(function (full_day, row_idx) {
                        return (
                            <Row key={`${row_idx}`}>
                                {full_day.map(function (_, col_idx) {
                                    return renderSlot(row_idx, col_idx, cardCollection);
                                })}
                            </Row>
                        );
                    })}
                </div>
            </DndProvider>
        </div>
    );
}

export default App;
