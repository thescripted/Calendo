import React from 'react';
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

function comparison(coordinate) {
    const rowCoordinates = [25, 75, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575]; // Perhaps kept in a constant file.
    let minVal = Number.MAX_SAFE_INTEGER;
    let coord = -1;
    rowCoordinates.forEach(function (rowCoord, idx) {
        const value = Math.abs(rowCoord - coordinate);
        if (minVal > value) {
            coord = idx;
            minVal = value;
        }
    });
    return { index: coord, value: rowCoordinates[coord] };
}

function App() {
    const [card, setCardState] = React.useState([]);
    console.log(card);

    function generateCard(card_height) {
        setCardState([...card, { level: 1, height: card_height - 25 }]);
    }

    function log(event) {
        event.persist();
        // Ensure that nativeEvent is only activated on the row, not any card/models/etc.
        // if (event.target !== "0") {
        //     return
        // }

        // Kinda iffy using document.getElement in a react application. This should never get deleted although.
        if (event.target != document.getElementById('row_event')) {
            return;
        }
        const yCoord = event.nativeEvent.offsetY;
        console.log(`x-coord: ${event.nativeEvent.offsetX}, y-coord: ${event.nativeEvent.offsetY}`);
        // event.stopPropagation();
        const { index, value } = comparison(yCoord); // Determine the height of where I need to render the card.
        generateCard(value);
        console.log(`${yCoord} is closest to ${value}, which has index ${index}`);
    }

    return (
        <div className='App'>
            <button>Click on me</button>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {/* Remove Slots for a more generic "Row". The cards will be mapped via height & absolute positioning.
                    {Array.from({ length: 7 }).map(function (_, row_idx) {
                        return (
                            <Row key={`${row_idx}`}>
                                {Array.from({ length: 12 }).map(function (_, col_idx) {
                                    const card = getCardFromData(row_idx, col_idx);
                                    return renderSlot(row_idx, col_idx, card);
                                })}
                            </Row>
                        );
                    })} */}
                    <Row log={log}>
                        {card.map(function (carditem) {
                            return (
                                <Card
                                    content='Hello, World'
                                    level={carditem.level}
                                    height={carditem.height}
                                    key={`${carditem.level * 10}-${carditem.height}`}
                                />
                            );
                        })}
                    </Row>
                </div>
            </DndProvider>
        </div>
    );
}

export default App;
