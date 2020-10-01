import React from 'react';
import Row from './components/Row';
import Card from './components/Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import produce from 'immer';
import { ROW_HEIGHT } from './support/Constant'

interface ICard {
    level: number;
    levelPreview: number;
    height: number;
    heightIndex: number;
    containerIdx: number
    cardIdx: number
}

interface ICardDictionary {
    [index: string]: ICard
}

interface IBoard {
    numRows: 5,
    height: 600,
    cardCollection: ICardDictionary
}

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
    const [navigate, setNavigate] = React.useState<boolean>(false) // TODO: Update Name
    const [cardGenerator, setCardGenerator] = React.useState<boolean>(true) //TODO: Restructure how cards are generated.
    const [draggedCard, setDraggedCard] = React.useState<ICard>(null)

    function publishDragEvent(rowID: number, id: number, bool: boolean) {
        if (bool) { // We have just come out of a dragEvent. Do not generate card.
            setCardGenerator(false)
            setDraggedCard({ containerIdx: rowID, cardIdx: id })
        }
        setNavigate(bool)
    }

    function generateCard(rowIndex: number, cardHeight: number, cardHeightIndex: number) {
        const newCard: ICard = { level: 1, levelPreview: 1, height: cardHeight - rowCoordinates[0], heightIndex: cardHeightIndex };
        const nextState: ICard[][] = produce(board, draftState => {
            draftState[rowIndex].push(newCard);
        });
        setBoardState(nextState);
    }

    function resolveClickHandler(rowIdx, event) {
        event.persist();
        // Kinda iffy using document.getElement in a react application. This should never get deleted although.
        if (!Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)) {
            return;
        }
        const yCoord = event.nativeEvent.offsetY;
        console.log(`x-coord: ${event.nativeEvent.offsetX}, y-coord: ${event.nativeEvent.offsetY}`);
        // event.stopPropagation();
        const { index, value } = comparison(yCoord); // Determine the height of where I need to render the card.

        if (!cardGenerator) { // If something stopped the card from generating, restart it.
            setCardGenerator(true)
        } else {
            generateCard(rowIdx, value, index);
        }
        console.log(`${yCoord} is closest to ${value}, which has index ${index}`);
    }

    function logMouseEvent(rowID, event) {
        if (!Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)) {
            return;
        }
        if (navigate) {
            const coordinate = event.nativeEvent.offsetY
            console.log(`I am Row: ${rowID}: ${coordinate}`);
            registerCardPreviewState(draggedCard, coordinate)
        } else {
            //TODO: Register mouse event
            return
        }
    }

    function registerCardPreviewState(cardID, coordinate) {
        const { index, value } = comparison(coordinate)
        let currentCard = draggedCard

    }


    return (
        <div className='App'>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {board.map((single_row, idx) => (
                        <Row
                            rowIdx={idx}
                            key={idx}
                            resolveClickHandler={resolveClickHandler}
                            logMouseEvent={logMouseEvent}
                            setNavigate={setNavigate} // TODO: Is there a way to setNavigate without passing it to Row?
                            rowHeight={ROW_HEIGHT}>
                            {single_row.map(function (carditem, cardIdx) {
                                return (
                                    <Card
                                        id={cardIdx}
                                        rowID={idx}
                                        publishDragEvent={publishDragEvent}
                                        content='Hello, World'
                                        levelPreview={carditem.levelPreview}
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


{
    fjaof: {
        location: 1,
            height: 1,
                time: 1800,
                    row: 1,
    },
    hdfioup1: {
        location: 1,
        ...
    }
    ...
}