import React from 'react'
import ReactDOM from 'react-dom'
import CalendarHeader from './components/CalendarHeader'
import Row from './components/Row'
import Card from './components/Card'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import { hashDate, useEvent, getThreshold, locateEvent, locateDay } from './support'
import * as dateFns from 'date-fns'
import { IEvent, IEventUpdateConfig, IDay, IModalInvoker } from './types/calendo'
import { useWeek } from './TimeContext'
import { useBoard, useBoardAPI } from './StoreContext'

/**
 * Returns the position of the cursor, relative to the calendar (0, 0) coordinate.
 * @param {number} The absolute y-coordinate, relative to the page.
 * @returns {number} Returns the coordinate relative to the calendar.
 */
function getRelativePosition(xCoordinate: number, yCoordinate: number): number[] {
    //TODO: Gather offset from this variable vvv
    
    const calendarRoot = document.getElementById('calendar_root')
    const LEFT_OFFSET = calendarRoot.offsetLeft 
    const TOP_OFFSET = calendarRoot.offsetTop 
    const SCROLL_OFFSET = calendarRoot.scrollTop

    const relativeXCoordinate = xCoordinate - LEFT_OFFSET
    const relativeYCoordinate = yCoordinate + SCROLL_OFFSET - TOP_OFFSET
    return [relativeXCoordinate, relativeYCoordinate]
}

/**
 * Given an array of coordinates, and a cursor position, this will return the index
 * of the nearest slot.
 * Example:
 * rawCoordinate = 130
 * slots = [0, 50, 100, 150, 200, 250]
 *
 * Returns:
 * 150
 *
 * @param {number} rawCoordinate
 * @param {number[]} slots
 * @return {number}
 */
function getNearestSlot(rawCoordinate: number, slots: number[]): number {
    let minVal = Number.MAX_SAFE_INTEGER;
    let coord = -1;
    slots.forEach(function (rowCoord, idx) { // a binary search would work better. Whatever.
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

const defaultModalInvoker: IModalInvoker = {
    invoked: false,
    eventID: "",
    locator: -1
}

function App() {
    const {boardState} = useBoard()
    const {weekArray} = useWeek()
    const {eventState, setEventState} = useEvent()
    const {generateEvent, updateEvent, deleteEvent} = useBoardAPI({eventState, setEventState})
    const [modalInvoker, setModalInvoker] = React.useState<IModalInvoker>(defaultModalInvoker)
    // useEffect for toggling the modal. 
    // This relies on the cardollection being appropriately updated, but since this card
    // collection can be updated by many different places, a modalInvoker is used to toggle
    // the modal along with an updated Boardstate.
    React.useEffect(() => {
        if (modalInvoker.invoked) {
            emitModal(locateEvent(modalInvoker.eventID, boardState), modalInvoker.locator)
        }
    }, [boardState.cardCollection, modalInvoker])

    // Wrapper for setEventState. This is passed to the modal view.
    function setModal(value: boolean) {
        setEventState({ ...eventState, modal: value, modalEvent: undefined })
        setModalInvoker(defaultModalInvoker)
    }

    function emitModal(event: IEvent, location: any): void {
        setEventState({ ...eventState, modal: true, modalEvent: event })
    }

    function finalizeCardMovement(cardEvent: IEvent) {
        updateEvent(cardEvent, { preview: false })
        setEventState({ ...eventState, dragging: undefined, isDragging: false })
    }

    // needs a better name. Basically, this checks if the event target is not a card
    function isTargetEmpty(event) {
        return Array.from(document.querySelectorAll('.rowEvent')).includes(event.target)
    }

    function expandCardDown(event: IEvent, pageYCoordinate: number, preview = true) {
        const [_, yPosition] = getRelativePosition(0, pageYCoordinate)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)
        const date = event.date
        const updatedEndTime = dateFns.add(date, {
            minutes: 30 * slotIndex
        })
        updateEvent(event, { endTime: updatedEndTime, preview: preview }) // Triggers an event update
    }

    // Creates a preview event.
    function createPreviewEvent(date: Date, yCoordinate: number): void {
        const [_, yPosition] = getRelativePosition(0, yCoordinate)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)
        const startTime = dateFns.add(date, {
            minutes: 30 * slotIndex
        })
        const defaultEndTime = dateFns.add(startTime, {
            minutes: 60 // 1 Hour by default.
        })
        const eventConfig: IEventUpdateConfig = {
            startTime: startTime,
            endTime: defaultEndTime,
            date: date,
            Day: boardState.eventDayCollection[hashDate(date)], // For now a day will always exists. This isn't always true.
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
        const yCoord = event.pageY
        if (eventState.isDragging) {
            finalizeCardMovement(eventState.dragging)
            return
        }
        if (isTargetEmpty(event)) { // Creating a new Card only happens if a card isn't already there.
            const modalLocation = {
                x: 0,
                y: 0
            }
            createPreviewEvent(dayOfWeek, yCoord)
        }
    }

    function carryCardOver(date: string, yCoord: number, preview = true) {
        if (eventState.isCarrying === false) {
            return
        }

        const event = eventState.carrying
        const [_, yPosition] = getRelativePosition(0, yCoord)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)

        let eventDate: Date
        if (date === undefined) {
            eventDate = event.date
        } else {
            eventDate = new Date(date)
        }

        const eventDay = locateDay(eventDate, boardState)
        const secondsToAdd = (dateFns.getTime(event.endTime) - dateFns.getTime(event.startTime)) / 1000

        const updatedStartTime = dateFns.add(eventDate, {
            minutes: 30 * slotIndex
        })
        const updatedEndTime = dateFns.add(updatedStartTime, {
            seconds: secondsToAdd
        })

        updateEvent(event, { startTime: updatedStartTime, endTime: updatedEndTime, date: eventDate, Day: eventDay, preview: preview }) // Triggers an event update
    }

    function cardMouseDownHandler(event, card: IEvent) {
        // setEventState({...eventState, dragging: card, isDragging: true})
    }

    function cardDragStartHandler(cardEvent: IEvent, ev) {
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        const clientHeight = ev.currentTarget.clientHeight
        const offsetThreshold = getThreshold(clientHeight)
        console.log(`Offset: ${ev.nativeEvent.offsetY}, ClientHeight: ${clientHeight}, threshold: ${clientHeight - offsetThreshold}`)

        // To Determine if the card should be "carried" or "dragged" depends on the user click location.
        if (ev.nativeEvent.offsetY > clientHeight - offsetThreshold) {
            setEventState({
                ...eventState,
                dragging: cardEvent,
                isDragging: true
            })
        } else {
            setEventState({
                ...eventState,
                carrying: cardEvent,
                isCarrying: true
            })
        }
    }

    function containerDragOverHandler(ev) {
        ev.persist()
        ev.preventDefault()
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        if (eventState.isDragging) {
            expandCardDown(eventState.dragging, ev.pageY)
        } else if (eventState.isCarrying) {
            carryCardOver(ev.target.dataset.date, ev.pageY)
        }
    }

    function containerDragDropHandler(ev) {
        ev.preventDefault()
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        if (eventState.isDragging) {
            expandCardDown(eventState.dragging, ev.pageY, false)
        } else if (eventState.isCarrying) {
            carryCardOver(ev.target.dataset.date, ev.pageY, false)
        }

        // onDrop, remove all drag/carry events.
        setEventState({
            ...eventState,
            dragging: undefined,
            isDragging: false,
            carrying: undefined,
            isCarrying: false
        })
    }

    return (
        <>
            <div className='App'>
                <div className="main_content">
                    <Sidebar />
                    <div className="calendar_content">
                        <CalendarHeader weekArray={weekArray} />
                        <div id='calendar_root' className='container' onDragOver={containerDragOverHandler} onDropCapture={containerDragDropHandler}>
                            {weekArray.map((dayOfWeek, rowViewID) => (
                                <Row
                                    dayOfWeek={dayOfWeek}
                                    key={rowViewID} // TODO: Maybe change the key to ID?
                                    eventHandlers={{
                                        mouseUp: rowMouseUpHandler.bind(null, dayOfWeek)
                                    }}
                                    rowHeight={boardState.viewportHeight}>
                                    {boardState.eventDayCollection[hashDate(dayOfWeek)]?.eventCollection.map((event, dayViewID) => (
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
                        <CalendarTime />
                        </div>
                    </div>
                </div>

            </div>
            { eventState.modal ? (
                ReactDOM.createPortal(
                    <Modal event={eventState.modalEvent} setModal={setModal} updater={updateEvent} deleter={deleteEvent} />,
                    document.getElementById("root")
                )) : undefined}
        </>
    );
}

function CalendarTime (props) {
    return (
        <div className="svg_root">
            <svg width="600" height="900" viewBox="0 0 1200 1800">
                <line x1="0" y1="100" x2="600" y2="100" style={{stroke:"rgb(255,0,0)", strokeWidth:"1"}}/>
                <line x1="0" y1="200" x2="600" y2="200" style={{stroke:"rgb(255,0,0)", strokeWidth:"1"}}/>
            </svg>
        </div>
    )

}

export default App;
