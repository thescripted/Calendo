import React, { useState } from 'react';
import Slot from './Slot';
import Row from './Row';
import Card from './Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// TODO: Remove renderSlot.
function renderSlot(row_idx, col_idx, card) {
    function displayCard() {
        if (card !== undefined) {
            // Placeholder. Ideally, Card id is determined before it is rendered.
            return <Card id={card[0] * 10 + card[1]} length={card[2]} />;
        } else {
            return undefined;
        }
    }

    function doNothing() {
        return;
    }
    return (
        <Slot key={`${row_idx}-${col_idx}`} row={row_idx} col={col_idx} updater={doNothing}>
            {displayCard()}
        </Slot>
    );
}

// TODO: How should a card data piece look like? How is it connected to the view?

// Check if card is in the data layer. Returns undefined if it is not.
function getCardFromData(row, col) {
    const TEMPORARY_ROW = 3;
    const TEMPORARY_COLUMN = 2;
    const LENGTH = 1;
    if (row === TEMPORARY_ROW && col === TEMPORARY_COLUMN) {
        //PLACEHOLDER (!!!)
        return [TEMPORARY_ROW, TEMPORARY_COLUMN, LENGTH];
    } else {
        return undefined;
    }
}

function App() {
    return (
        <div className='App'>
            <button>Click on me</button>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {/* Remove Slots for a more generic "Row". The cards will be mapped via height & absolute positioning. */}
                    {Array.from({ length: 7 }).map(function (_, row_idx) {
                        return (
                            <Row key={`${row_idx}`}>
                                {Array.from({ length: 12 }).map(function (_, col_idx) {
                                    const card = getCardFromData(row_idx, col_idx);
                                    return renderSlot(row_idx, col_idx, card);
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
