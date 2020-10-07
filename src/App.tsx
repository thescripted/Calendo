import React from 'react';
import ReactDOM from 'react-dom';
import Row from './components/Row';
import Card from './components/Card';
import Modal from './components/Modal';
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
    preview?: boolean
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

interface IOptions {
    start: Date
    end: Date
    day: IDay
}

interface IEventUpdateConfig {
    startTime?: Date
    endTime?: Date
    content?: string
    date?: Date
    day?: IDay
    preview?: boolean
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

function App() {
    const [boardState, setBoardState] = React.useState<IBoard>(Board.generateInitialBoardState());
    const [weekArray, setWeekArray] = React.useState<Date[]>(Board.generateInitialWeek());
    const [navigate, setNavigate] = React.useState<boolean>(false) // TODO: Update Name
    const [dragging, setDragging] = React.useState<IEvent | undefined>(undefined)
    const [modal, setModal] = React.useState<boolean>(false)
    const [modalOptions, setModalOptions] = React.useState<IEventUpdateConfig>()

    function validate(eventID: string, stagedState: IBoard): void {
        return
    }

    // GenerateEvent will return a promise. It (eventually) will resolve if there is no time confliction.
    function generateEvent(options: IEventUpdateConfig): string  { 
        const eventID = uuidv4()
        const eventDraft: IEvent = {
            eventID: eventID,
            dayID: options.day.dayID,
            date: options.date,
            startTime: options.startTime,
            endTime: options.endTime,
            endTimePreview: null,
            content: options.content,
            preview: options.preview, 
        }

        const nextState: IBoard = produce(boardState, draftState => {
            draftState.cardCollection[eventID] = eventDraft
            draftState.eventDayCollection[options.day.dayID].eventCollection.push(eventDraft)
        })

        validate(eventID, nextState) // This does nothing for now.
        setBoardState(nextState)
        return eventID
    }


    function updateEvent(event: IEvent, options: IEventUpdateConfig): void {
        console.log(options)
        console.log("updating event!")
        // This is so ugly. Don't even look at this. I am tired.
        const nextState: IBoard = produce(boardState, draftState => {
            draftState.cardCollection[event.eventID].startTime = options.startTime //TODO: Make it such that there's only one source of truth.
            draftState.cardCollection[event.eventID].endTime = options.endTime
            draftState.cardCollection[event.eventID].content = options.content 
            draftState.cardCollection[event.eventID].preview = options.preview
            draftState.cardCollection[event.eventID].date = options.date 
            draftState.eventDayCollection[event.dayID].eventCollection.map(singleEvent => {
                if (singleEvent.eventID === event.eventID) {
                    singleEvent.startTime= options.startTime
                    singleEvent.endTime = options.endTime
                    singleEvent.content = options.content
                    singleEvent.preview = options.preview
                    singleEvent.date = options.date
                }
                return singleEvent
            })
        })

        validate(event.eventID, nextState)
        console.log(nextState)
        setBoardState(nextState)
    }

    function deleteEvent(eventID: string): void {
        return
    }

    function emitModal(defaultStart: Date, defaultEnd: Date, rowEvent: IDay): void {
        setModalOptions({
            startTime: defaultStart,
            endTime: defaultEnd,
            date: rowEvent.date,
            day: rowEvent,
            content: "",
            preview: false
        })
        setModal(true)
    }


    function resolveMouseUpHandler(dayOfWeek: Date, event) {
        event.persist();
        if (dragging !== undefined) {
            const { index } = comparison(event.nativeEvent.offsetY)
            const endHour = dateFns.add(dayOfWeek, {
                minutes: 30 * index
            })
            updateEvent(dragging, {endTime: endHour})

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
            emitModal(startHour, oneHourLater, boardState.eventDayCollection[hashDate(dayOfWeek)])
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
        updateEvent(dragging, {endTime: endHour})

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
      <>
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
        { modal ? ( 
            ReactDOM.createPortal(
                <Modal generator={generateEvent} options={modalOptions} setModal={setModal} updater={updateEvent} boardState={boardState}/>,
                document.getElementById("root")
            )) : undefined }
    </>
    );
}

export default App;
