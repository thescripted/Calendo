import React from 'react'
import ReactDOM from 'react-dom'
import CalendarHeader from './components/CalendarHeader'
import Row from './components/Row'
import Card from './components/Card'
import Modal from './components/Modal'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import produce from 'immer';
import { ROW_HEIGHT } from './support/Constant'
import { hashDate } from './support'
import { v4 as uuidv4 } from 'uuid'
import * as dateFns from 'date-fns'

function getCursorPosition(event) {
    return [event.pageX, event.pageY]
}

/**
 * Returns the position of the cursor, relative to the calendar (0, 0) coordinate.
 * @param {number} The absolute y-coordinate, relative to the page.
 * @returns {number} Returns the coordinate relative to the calendar.
 */
function getRelativePosition(coordinate: number): number {
    // currently unused. It will be more complicated when the calendar is placed into a scrollable container.
    const calendarRoot = document.getElementById('calendar_root')
    const HARDCODED_ROOT_TOP_OFFSET = 84 
    const SCROLL_OFFSET = calendarRoot.scrollTop
    const relativeCoordinate = coordinate + SCROLL_OFFSET - HARDCODED_ROOT_TOP_OFFSET
    return relativeCoordinate
}

function getNearestSlot(rawCoordinate: number, slots: number[]): number {
    let minVal = Number.MAX_SAFE_INTEGER;
    let coord = -1;
    slots.forEach( function(rowCoord, idx) { // a binary search would work better. Whatever.
        const value: number = Math.abs(rowCoord - rawCoordinate);
        if (minVal > value) {
            coord = idx;
            minVal = value;
        }
    });
    return coord
}
// Hack to get blank image for dragEvents
const invisibleImage = document.createElement('img'); 
invisibleImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

interface IHeightIndex extends Array<number> {
    [index: number]: number
}

interface IEvent {
    eventID: string
    Day: IDay
    date: Date
    startTime: Date
    endTime: Date
    content: string
    preview: boolean
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

interface IEventUpdateConfig {
    startTime?: Date
    endTime?: Date
    content?: string
    date?: Date
    day?: IDay
    preview?: boolean
}

interface IEventState {
    dragging: IEvent | undefined
    carrying: IEvent | undefined
    modal: boolean
    isDragging: boolean
    isCarrying: boolean
    modalEvent: IEvent | undefined
}

interface IModalInvoker {
    invoked: boolean
    eventID: string
    locator: number
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
        return hourArray
    }

    private _generateDefaultDays(): ISearchDay {
        let result: ISearchDay = {}
        for (let i = 0; i < this._numRows; i++) {
            const date = new Date(2020, 9, i + 8) // 2020-10-01T05:00:00.000Z, 2020-10-02T05:00:00.000Z, ...
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
            week.push(new Date(2020, 9, i + 8))
        }
        return week
    }
}

const Board = new BoardGenerator(ROW_HEIGHT)

const defaultEventState = {
    dragging: undefined,
    carrying: undefined,
    modal: false,
    isDragging: false,
    isCarrying: false,
    modalEvent: undefined
}

const defaultModalInvoker: IModalInvoker = {
    invoked: false,
    eventID: "",
    locator: -1
}


function App() {
    const [boardState, setBoardState] = React.useState<IBoard>(Board.generateInitialBoardState())
    const [eventState, setEventState] = React.useState<IEventState>(defaultEventState)
    const [modalInvoker, setModalInvoker] = React.useState<IModalInvoker>(defaultModalInvoker)
    const [weekArray, setWeekArray] = React.useState<Date[]>(Board.generateInitialWeek())

    // useEffect for modal. only called when the appropriate caller was invoked.
    // This is very stupid and sloppy. But I cannot attach callbacks to setState using functional components.
    // And there are many ways the board state can be created/added.
    // This effect only runs when the correct invoker generates a new card.
    // The card location/information is stored in that invoker object and passed into the modal here.
    // Sigh. ):
    React.useEffect( () => {
        if (modalInvoker.invoked) {
            emitModal(getEvent(modalInvoker.eventID), modalInvoker.locator)
        }
    }, [boardState.cardCollection, modalInvoker])
    
    function getEvent(eventID: string): IEvent | undefined {
        return boardState.cardCollection[eventID]
    }

    function getDay(dayID: string): IDay | undefined {
        return boardState.eventDayCollection[dayID]
    }
    function validate(eventID: string, stagedState: IBoard): void {
        return
    }

    function setModal(value: boolean) { // Wrapper for setEventState
        setEventState({...eventState, modal: value, modalEvent: undefined })
        setModalInvoker(defaultModalInvoker)
    }
  
    function generateEvent(options: IEventUpdateConfig): string {
        const eventID = uuidv4()
        const eventDraft: IEvent = {
            eventID: eventID,
            date: options.date,
            Day: options.day,
            startTime: options.startTime,
            endTime: options.endTime,
            content: options.content,
            preview: options.preview,
        }

        const nextState: IBoard = produce(boardState, draftState => {
            draftState.cardCollection[eventID] = eventDraft
            draftState.eventDayCollection[options.day.dayID].eventCollection.push(eventDraft)
        })

        validate(eventID, nextState)
        setBoardState(nextState)
        return eventID
    }

    function updateEvent(event: IEvent, options: IEventUpdateConfig): void {
        const nextState: IBoard = produce(boardState, draftState => {
            const cardItem = draftState.cardCollection[event.eventID]
            draftState.cardCollection[event.eventID] = { ...cardItem, ...options }

            const eventArray = draftState.eventDayCollection[event.Day.dayID].eventCollection.map(singleEvent => {
                if (singleEvent.eventID === event.eventID) {
                    return { ...singleEvent, ...options }
                }
                return singleEvent
            })
            draftState.eventDayCollection[event.Day.dayID].eventCollection = eventArray
        })
        validate(event.eventID, nextState)
        setBoardState(nextState)
    }

    function deleteEvent(event: IEvent): void {
        const nextState: IBoard = produce(boardState, draftState => {
            delete draftState.cardCollection[event.eventID]
            const eventArray = draftState.eventDayCollection[event.Day.dayID].eventCollection.map(singleEvent => {
                if (singleEvent.eventID === event.eventID) {
                    return undefined
                }
                return singleEvent
            }).filter(singleEvent => {
                return (singleEvent !== undefined)
            })
            draftState.eventDayCollection[event.Day.dayID].eventCollection = eventArray
        })
        validate(event.eventID, nextState)
        setBoardState(nextState)
    }


    function emitModal(event: IEvent, location: any): void {
        setEventState({...eventState, modal: true, modalEvent: event})
    }


    function finalizeCardMovement(cardEvent: IEvent) {
        updateEvent(cardEvent, { preview: false })
        setEventState({...eventState, dragging: undefined, isDragging: false })
    }

    function expandCardDown(event: IEvent, pageYCoordinate: number) {
        const yPosition = getRelativePosition(pageYCoordinate)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)
        const date = event.date
        const updatedEndTime = dateFns.add(date, {
            minutes: 30 * slotIndex
        })
        updateEvent(event, { endTime: updatedEndTime, preview: true }) // Triggers an event update
    }

    // needs a better name. Basically, this checks if the event target is not a card
    function isTargetEmpty(event) {
        return Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)
    }

    // Creates a preview event.
    function createPreviewEvent(date: Date, yCoordinate: number): void {
        const yPosition = getRelativePosition(yCoordinate)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)
        const startTime = dateFns.add(date, {
            minutes: 30 * slotIndex
        })
        const defaultEndTime = dateFns.add(startTime, {
            minutes: 60 // 1 Hour by default.
        })
        const eventConfig = {
            startTime: startTime,
            endTime: defaultEndTime,
            date: date,
            day: boardState.eventDayCollection[hashDate(date)], // For now a day will always exists. This isn't always true.
            content: "",
            preview: true
        }
        const eventID = generateEvent(eventConfig)
        setModalInvoker({
            invoked: true,
            eventID: eventID,
            locator: 0
        })
    }

    function rowMouseUpHandler(dayOfWeek: Date, event) {
        event.persist();
        const [_, yCoord] = getCursorPosition(event)
        if (eventState.isDragging) {
            finalizeCardMovement(eventState.dragging)
            return
        } 
        if (isTargetEmpty(event)){ // Creating a new Card only happens if a card isn't already there.
            const modalLocation = {
                x: 0,
                y: 0
            }
            createPreviewEvent(dayOfWeek, yCoord)
        }
    }

    function rowMouseMoveHandler(dayOfWeek: Date, event): void {
        event.persist()
        // event.stopPropagation()
        console.log(eventState)
        const [_, yCoord] = getCursorPosition(event)
        if (eventState.isDragging) { // We're dragging a card. Update the endTime.
            expandCardDown(eventState.dragging, yCoord)
        } else if (eventState.isCarrying) {
            console.log("Carrying Card over Date: ", dayOfWeek)
        }
    }


    function carryCardOver(coordinate: number, preview=true) {
        if (eventState.isCarrying === false) {
            throw new Error("There is no event currently being dragged.")
        }

        const event = eventState.carrying
        const yPosition = getRelativePosition(coordinate)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)
        const date = event.date

        const secondsToAdd = (dateFns.getTime(event.endTime) - dateFns.getTime(event.startTime)) / 1000

        const updatedStartTime = dateFns.add(date, {
            minutes: 30 * slotIndex
        })
        const updatedEndTime = dateFns.add(updatedStartTime, {
            seconds: secondsToAdd
        })

        updateEvent(event, { startTime: updatedStartTime, endTime: updatedEndTime, preview: preview}) // Triggers an event update
    }
    function cardMouseDownHandler(event, card: IEvent) {
        // setEventState({...eventState, dragging: card, isDragging: true})
    }

    function containerDragOverHandler(ev) {
        ev.preventDefault()
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        carryCardOver(ev.pageY)
    }

    function containerDragDropHandler(ev) {
        ev.preventDefault()
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        carryCardOver(ev.pageY, false)
        setEventState({
            ...eventState,
            carrying: undefined,
            isCarrying: false
        })
    }

    function cardDragStartHandler(cardEvent: IEvent, ev) {
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        console.log("Triggered!")
        setEventState({
            ...eventState,
            carrying: cardEvent,
            isCarrying: true
        })
    }

    return (
        <>
            <div className='App'>
                <DndProvider backend={HTML5Backend}>
                    <CalendarHeader weekArray={weekArray}/>
                    <div id='calendar_root' className='container' onDragOver={containerDragOverHandler} onDropCapture={containerDragDropHandler}>
                        {weekArray.map((dayOfWeek, rowViewID) => (
                            <Row
                                dayOfWeek={dayOfWeek}
                                key={rowViewID} // TODO: Maybe change the key to ID?
                                eventHandlers={{
                                    mouseMove: rowMouseMoveHandler.bind(null, dayOfWeek),
                                    mouseUp: rowMouseUpHandler.bind(null, dayOfWeek)
                                }}
                                rowHeight={boardState.viewportHeight}>
                                {getDay(hashDate(dayOfWeek)).eventCollection.map((event, dayViewID) => (
                                    <Card
                                        event={event}
                                        key={`${rowViewID} + ${dayViewID}`}
                                        scale={boardState.viewportHeight}
                                        grid={boardState.heightIndex}
                                        eventHandlers={{
                                            mouseDown: cardMouseDownHandler.bind(null, event),
                                            dragStart: cardDragStartHandler.bind(null, event)
                                        }}
                                    />
                                ))}
                            </Row>
                        ))}
                    </div>
                </DndProvider>
            </div>
            { eventState.modal ? (
                ReactDOM.createPortal(
                    <Modal event={eventState.modalEvent} setModal={setModal} updater={updateEvent} deleter={deleteEvent} />,
                    document.getElementById("root")
                )) : undefined}
        </>
    );
}

export default App;
