import React from 'react';
import Row from './components/Row';
import Card from './components/Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import produce from 'immer';
import { ROW_HEIGHT } from './support/Constant'
import { hashDate } from './support'
import { v4 as uuidv4 } from "uuid"
import * as dateFns from 'date-fns'

interface IHeightIndex extends Array<number> {
    [index: number]: number
}

interface IEvent {
    eventID: string
    dayID: string
    date: Date
    startTime: Date
    endTime: Date
    endTimePreview: Date | null // Used for validating updating the end-hour.
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
    heightIndex: IHeightIndex // Should probably not be state-dependent. 
    cardCollection: ISearchEvent
    eventDayCollection: ISearchDay
}


class BoardGenerator {
    constructor(viewportHeight) {
        this._numRows = 5
        this._viewportHeight = viewportHeight
        this._heightIndex = this._generateHeightIndex(24, 2)
        this._defaultDayCollection = this._generateDefaultDays()

    }

    private _viewportHeight: number
    private _numRows: number
    private _heightIndex: IHeightIndex
    private _defaultDayCollection: ISearchDay

    private _generateHeightIndex(hour, subdivision): IHeightIndex {
        const HourToViewScale = this._viewportHeight / (hour * subdivision)
        const Offset = HourToViewScale / 2
        let hourArray = Array.from({ length: hour * subdivision }).map(function (_, idx) {
            return HourToViewScale * idx + Offset
        })
        console.log(hourArray)
        return hourArray
    }

    private _generateDefaultDays(): ISearchDay {
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

    generateInitialWeek(): Date[] {
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
    const [weekArray, setWeekArray] = React.useState<Date[]>(Board.generateInitialWeek());
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

    function generateEvent(startHour: Date, endHour: Date, content: string, Day: IDay) {
        const eventID = uuidv4()
        const eventDraft: IEvent = {
            eventID: eventID,
            dayID: Day.dayID,
            date: Day.date,
            startTime: startHour,
            endTime: endHour,
            endTimePreview: null,
            content: content,
        }

        const nextState: IBoard = produce(boardState, draftState => {
            draftState.cardCollection[eventID] = eventDraft
            draftState.eventDayCollection[Day.dayID].eventCollection.push(eventDraft)
        })

        setBoardState(nextState)
    }


    function resolveClickHandler(dayOfWeek: Date, event) {
        event.persist();
        // Kinda iffy using document.getElement in a react application. This should never get deleted although.
        if (!Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)) {
            return;
        }
        console.log(`x-coord: ${event.nativeEvent.offsetX}, y-coord: ${event.nativeEvent.offsetY}`);
        const { index, value } = comparison(event.nativeEvent.offsetY)
        const startHour = dateFns.add(dayOfWeek, { // by default, day of week starts at zero. Will need to push this to UTC. Later.
            minutes: 30 * index
        })

        const oneHourLater = dateFns.add(startHour, {
            hours: 1,
        })
        generateEvent(startHour, oneHourLater, "Hello, World", boardState.eventDayCollection[hashDate(dayOfWeek)])
    }

    function comparison(coordinate: number) {
        let minVal = Number.MAX_SAFE_INTEGER;
        let coord = -1;
        boardState.heightIndex.forEach(function (rowCoord, idx) { // a binary search would work better. Whatever.
            const value: number = Math.abs(rowCoord - coordinate);
            if (minVal > value) {
                coord = idx;
                minVal = value;
            }
        });
        return { index: coord, value: boardState.heightIndex[coord] };
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

    return (
        <div className='App'>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {weekArray.map((dayOfWeek, rowViewID) => (
                        <Row
                            dayOfWeek={dayOfWeek}
                            key={rowViewID} // TODO: Maybe change the key to ID?
                            resolveClickHandler={resolveClickHandler}
                            logMouseEvent={logMouseEvent}
                            setNavigate={setNavigate} // TODO: Is there a way to setNavigate without passing it to Row?
                            rowHeight={boardState.viewportHeight}>
                            {boardState.eventDayCollection[hashDate(dayOfWeek)].eventCollection.map((event, dayViewID) => (
                                <Card
                                    event={event}
                                    key={`${rowViewID} + ${dayViewID}`}
                                    scale={boardState.viewportHeight}
                                    grid={boardState.heightIndex}
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