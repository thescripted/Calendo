import React from 'react';
import Row from './components/Row';
import Card from './components/Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import produce from 'immer';

const rowCoordinates = [25, 75, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575]; // Perhaps kept in a constant file.

interface ICard {
    level: number;
    height: number;
}

interface IRow {
    cards: ICard[]
}

function comparison(coordinate) {
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
    const [board, setBoardState] = React.useState<IRow[]>(); // # of arrays = # of rows in calendar.

    function generateCard(rowIndex, cardHeight) {
        const newCard: ICard = { level: 1, height: cardHeight - 25 };
        const nextState: IRow[] = produce(board, draftState => {
            draftState[rowIndex].cards.push(newCard);
        });
        setBoardState(nextState);
    }

    function calendarClickHandler(rowIdx: Number, event) {
        // should rewrite to calendarClickEventHandler or something like that
        event.persist();
        // Ensure that nativeEvent is only activated on the row, not any card/models/etc.
        // if (event.target !== "0") {
        //     return
        // }

        // Kinda iffy using document.getElement in a react application. This should never get deleted although.
        if (!Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)) {
            return;
        }
        const yCoord = event.nativeEvent.offsetY;
        console.log(`x-coord: ${event.nativeEvent.offsetX}, y-coord: ${event.nativeEvent.offsetY}`);
        // event.stopPropagation();
        const { index, value } = comparison(yCoord); // Determine the height of where I need to render the card.
        generateCard(rowIdx, value);
        console.log(`${yCoord} is closest to ${value}, which has index ${index}`);
    }

    return (
        <div className='App'>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {board.map((single_row, idx) => (
                        <Row rowIdx={idx} key={idx} calendarClickHandler={calendarClickHandler}>
                            {single_row.cards.map(function (carditem) {
                                return (
                                    <Card
                                        content='Hello, World'
                                        level={carditem.level}
                                        height={carditem.height}
                                        key={`${idx}-${carditem.level * 10}-${carditem.height}`}
                                    />
                                );
                            })}
                        </Row>
                    ))}
                </div>
            </DndProvider>
        </div>
    );
}

export default App;
