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


class BoardGenerator { // Maybe change this to a "function setup" or init instead.
    constructor(viewportHeight: number) {
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

// <!-------------------------------------- TODO --------------------------------------!>
// Register React DND for all drag-related events (moving cards from one row to another, moving cards within rows, expanding cards, etc.)
// Configure Refactoring your state object & Incorporate a validator before any state changes.
// Configure "Preview" Layer for updating card.
// Continue Refactoring & Updating Application.
function App() {
    const [boardState, setBoardState] = React.useState<IBoard>(Board.generateInitialBoardState());
    const [weekArray, setWeekArray] = React.useState<Date[]>(Board.generateInitialWeek());
    const [navigate, setNavigate] = React.useState<boolean>(false) // TODO: Update Name
    const [dragging, setDragging] = React.useState<IEvent | undefined>(undefined)

    function validate(eventID: string, stagedState: IBoard): void {
        setBoardState(stagedState)
    }

    function generateEvent(startHour: Date, endHour: Date, content: string, Day: IDay): void {
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

        validate(eventID, nextState)
    }

    function updateEvent(event: IEvent, endTime: Date): void { // TODO: Change endtime to a config/option method
        const nextState: IBoard = produce(boardState, draftState => {
            draftState.cardCollection[event.eventID].endTime = endTime //TODO: Make it such that there's only one source of truth.
            draftState.eventDayCollection[event.dayID].eventCollection.map(singleEvent => {
                if (singleEvent.eventID === event.eventID) {
                    singleEvent.endTime = endTime
                }
                return singleEvent
            })
        })

        validate(event.eventID, nextState)
    }

    function deleteEvent(eventID: string): void {
        return
    }


    function resolveMouseUpHandler(dayOfWeek: Date, event) {
        event.persist();
        if (dragging !== undefined) {
            const { index } = comparison(event.nativeEvent.offsetY)
            const endHour = dateFns.add(dayOfWeek, {
                minutes: 30 * index
            })
            updateEvent(dragging, endHour)

            setDragging(undefined)
            return
        } else {
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
    }

    function resolveMouseMoveHandler(dayOfWeek: Date, event) {
        event.persist()
        if (dragging === undefined) return
        const eventHeightRatio = dateFns.differenceInMinutes(dragging.startTime, dragging.date) / (24 * 60);
        let comparator: number
        if (!Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)) {
            comparator = event.nativeEvent.offsetY + eventHeightRatio * boardState.viewportHeight
        } else {
            comparator = event.nativeEvent.offsetY
        }
        console.log(comparator)
        const { index } = comparison(comparator)
        const endHour = dateFns.add(dayOfWeek, {
            minutes: 30 * index
        })
        updateEvent(dragging, endHour)

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
            return
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

    function mouseDownEvent(event, card: IEvent) {
        setDragging(card)
    }

    React.useEffect(() => {
        console.log(dragging)
    }, [dragging])

    return (
        <div className='App'>
            <DndProvider backend={HTML5Backend}>
                <div className='container'>
                    {weekArray.map((dayOfWeek, rowViewID) => (
                        <Row
                            dayOfWeek={dayOfWeek}
                            key={rowViewID} // TODO: Maybe change the key to ID?
                            resolveMouseUpHandler={resolveMouseUpHandler}
                            resolveMouseMoveHandler={resolveMouseMoveHandler}
                            logMouseEvent={logMouseEvent}
                            setNavigate={setNavigate} // TODO: Is there a way to setNavigate without passing it to Row?
                            rowHeight={boardState.viewportHeight}>
                            {boardState.eventDayCollection[hashDate(dayOfWeek)].eventCollection.map((event, dayViewID) => (
                                <Card
                                    event={event}
                                    key={`${rowViewID} + ${dayViewID}`}
                                    scale={boardState.viewportHeight}
                                    grid={boardState.heightIndex}
                                    mouseDown={mouseDownEvent}
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
