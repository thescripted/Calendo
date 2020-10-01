import React from 'react';
import Row from './components/Row';
import Card from './components/Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import produce from 'immer';
import { ROW_HEIGHT } from './support/Constant'
import { hashDate } from './support'

interface IHeightIndex {
    [index: number]: number
}

interface IEvent {
    eventID: string
    level: number
    levelPreview: number
    heightLocator: IHeightIndex
    date: IDay
    content: string
}

interface IDay {
    date: Date
    dayID: string
    eventCollection: IEvent[]
}

interface ISearchEvent {
    [eventID: string]: IEvent
}

interface ISearchDay {
    [dayID: string]: IDay
}

interface IBoard {
    numRows: number // Will be removed soon...
    viewportHeight: number
    heightIndex: IHeightIndex
    cardCollection: ISearchEvent
    eventDayCollection: ISearchDay
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

class BoardGenerator {
    constructor(viewportHeight) {
        this._numRows = 5
        this._viewportHeight = viewportHeight
        this._heightIndex = this._generateHeightIndex()
        this._defaultDayCollection = this._generateDefaultDays()

    }

    private _viewportHeight: number
    private _numRows: number
    private _heightIndex: IHeightIndex
    private _defaultDayCollection: ISearchDay

    private _generateHeightIndex(): IHeightIndex {
        const HOUR = 24
        const HourToViewScale = this._viewportHeight / HOUR
        const Offset = HourToViewScale / 2
        let hourArray = Array.from({ length: HOUR }).map(function (_, idx) {
            return HourToViewScale * idx + Offset
        })
        return hourArray
    }

    public _generateDefaultDays(): ISearchDay {
        let result: ISearchDay = {}
        for (let i = 0; i < this._numRows; i++) {
            const date = new Date(2020, 9, i) // 2020-10-01T05:00:00.000Z, 2020-10-02T05:00:00.000Z, ...
            const id = hashDate(date) // Hashed date for ID. Do not use after year 3244.
            result[id] = {
                date: date,
                dayID: id,
                eventCollection: []
            }
        }
        return result
    }

    generateInitialBoardState(): IBoard {
        return {
            numRows: this._numRows,
            viewportHeight: this._viewportHeight,
            heightIndex: this._heightIndex,
            cardCollection: {},
            eventDayCollection: this._defaultDayCollection
        }
    }

    generateInitialWeek(): Date[] { // Will return 5 dates. 
        let week: Date[] = []
        for (let i = 0; i < this._numRows; i++) {
            week.push(new Date(2020, 9, i))
        }
        return week
    }
}

const Board = new BoardGenerator(ROW_HEIGHT)
function getNativeEvent(rowID, nativeEvent) {
    console.log(nativeEvent.offsetY)
    return nativeEvent.offsetY
}

function App() {
    const [boardState, setBoardState] = React.useState<IBoard>(Board.generateInitialBoardState());
    const [weekArray, setWeekArray] = React.useState<Date[]>(Board.generateInitialWeek())


    // const [board, setBoardstate] = React.useState<IEvent[][]>([[], [], [], [], []]); // # of arrays = # of rows in calendar.
    const [navigate, setNavigate] = React.useState<boolean>(false) // TODO: Update Name
    const [cardGenerator, setCardGenerator] = React.useState<boolean>(true) //TODO: Restructure how cards are generated.
    const [draggedCard, setDraggedCard] = React.useState<IEvent>(null)

    // function publishDragEvent(rowID: number, id: number, bool: boolean) {
    //     if (bool) { // We have just come out of a dragEvent. Do not generate card.
    //         setCardGenerator(false)
    //         // setDraggedCard({ containerIdx: rowID, cardIdx: id })
    //     }
    //     setNavigate(bool)
    // }

    function generateCard(rowIndex: number, cardHeight: number, cardHeightIndex: number) {
        // const newCard: IEvent = { level: 1, levelPreview: 1, height: cardHeight - rowCoordinates[0], heightIndex: cardHeightIndex };
        // const nextState: IEvent[][] = produce(board, draftState => {
        //     draftState[rowIndex].push(newCard);
        // });
        // setBoardState(nextState);
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
        // const { index, value } = comparison(yCoord); // Determine the height of where I need to render the card.

        // if (!cardGenerator) { // If something stopped the card from generating, restart it.
        //     setCardGenerator(true)
        // } else {
        //     generateCard(rowIdx, value, index);
        // }
        // console.log(`${yCoord} is closest to ${value}, which has index ${index}`);
    }

    function logMouseEvent(rowID, event) {
        if (!Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)) {
            return;
        }
        if (navigate) {
            const coordinate = event.nativeEvent.offsetY
            console.log(`I am Row: ${rowID}: ${coordinate}`);
            // registerCardPreviewState(draggedCard, coordinate)
        } else {
            //TODO: Register mouse event
            return
        }
    }

    // function registerCardPreviewState(cardID, coordinate) {
    //     const { index, value } = comparison(coordinate)
    //     let currentCard = draggedCard

    // }
    return (
        <div className='App'>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {weekArray.map((dayOfWeek, rowViewID) => (
                        <Row
                            rowIdx={rowViewID}
                            key={rowViewID}
                            resolveClickHandler={resolveClickHandler}
                            logMouseEvent={logMouseEvent}
                            setNavigate={setNavigate} // TODO: Is there a way to setNavigate without passing it to Row?
                            rowHeight={boardState.viewportHeight}>
                            {/* {single_row.map(function (carditem, cardIdx) {
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
                            })} */}
                            {boardState.eventDayCollection[hashDate(dayOfWeek)].eventCollection.map((event, dayViewID) => (
                                <Card
                                    event={event}
                                    key={`${rowViewID} + ${dayViewID}`}
                                    scale={boardState.viewportHeight / 24}
                                />
                            ))}
                        </Row>
                    ))}
                </div>
            </DndProvider>
        </div>
    );
}

export default App;


// {
//     fjaof: {
//         location: 1,
//             height: 1,
//                 time: 1800,
//                     row: 1,
//     },
//     hdfioup1: {
//         location: 1,
//         ...
//     }
//     ...
// }