import React from 'react';
import Row from './components/Row';
import Card from './components/Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import produce from 'immer';
import { ROW_HEIGHT } from './support/Constant'

// TODO: Perhaps move rowCoordinates into a constructor method in a Row class. 
const rowCoordinates = ((defaultHeight: number): number[] => {
    const HOUR = 24
    const HourToViewScale = defaultHeight / HOUR
    const Offset = HourToViewScale / 2
    let hourArray = Array.from({ length: HOUR }).map(function (hour, idx) {
        return HourToViewScale * idx + Offset
    })
    return hourArray
})(ROW_HEIGHT)

interface ICard {
    level: number;
    height: number;
}

function comparison(coordinate: number) {
    let minVal = Number.MAX_SAFE_INTEGER;
    let coord = -1;
    rowCoordinates.forEach(function (rowCoord, idx) {
        const value: number = Math.abs(rowCoord - coordinate); // Idk why a unary operator is needed on a known number type.
        if (minVal > value) {
            coord = idx;
            minVal = value;
        }
    });
    return { index: coord, value: rowCoordinates[coord] };
}

function App() {
    const [board, setBoardState] = React.useState<ICard[][]>([[], [], [], [], []]); // # of arrays = # of rows in calendar.
    console.log(rowCoordinates)
    function generateCard(rowIndex: number, cardHeight: number) {
        const newCard: ICard = { level: 1, height: cardHeight - rowCoordinates[0] };
        const nextState: ICard[][] = produce(board, draftState => {
            draftState[rowIndex].push(newCard);
        });
        setBoardState(nextState);
    }

    function calendarClickHandler(rowIdx: number, event) {
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
                        <Row rowIdx={idx} key={idx} calendarClickHandler={calendarClickHandler} rowHeight={ROW_HEIGHT}>
                            {single_row.map(function (carditem) {
                                return (
                                    <Card
                                        content='Hello, World'
                                        level={carditem.level}
                                        height={carditem.height}
                                        scale={rowCoordinates[0] * 2}
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
