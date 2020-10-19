import React from 'react'
import ReactDOM from 'react-dom'
import CalendarHeader from './components/CalendarHeader'
import Row from './components/Row'
import Card from './components/Card'
import Modal from './components/Modal'
import Sidebar from './components/Sidebar'
import { hashDate, useEvent, getThreshold, locateEvent, locateDay, getCalendarInfo } from './support'
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
    const { LEFT_OFFSET, TOP_OFFSET, SCROLL_OFFSET } = getCalendarInfo()
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
    locator: -1,
    pivot: false
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

    // Wrapper for setEventState. This is passed to the modal view to only update the modalState.
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

    // Creates a preview event and invokes the modal.
    // The modal should not be invoked here, ideally. This needs to be split.
    function createPreviewEvent(date: Date, yCoordinate: number, modalIdx: number): void {
        let startTime: Date
        if (yCoordinate > 0) {
        const [_, yPosition] = getRelativePosition(0, yCoordinate)
        const slotIndex = getNearestSlot(yPosition, boardState.heightIndex)

        startTime = dateFns.add(date, {
            minutes: 30 * slotIndex
        })
        } else {
            // generate default startTime based on currentTime.
            const initialDate = new Date()
            startTime = initialDate // will be scoped to nearest Time.
        }
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

        // Modal index is determined via closure. This function may move somewhere else so beware.
        function calculateModalLocation() {
            // 1. Position the modal relative to the calendar Root.
            const { LEFT_OFFSET, WIDTH } = getCalendarInfo()

            // 2. Determine how many days are present in the view and subdivide.
            const ROWS = weekArray.length
            const SUBDIVISION = WIDTH / ROWS
            const PADDING = 12

            // 3. Compute
            let locator: number, pivot: boolean
            if (modalIdx < Math.floor(ROWS / 2)) {
                pivot = false 
                locator = LEFT_OFFSET + SUBDIVISION*(+modalIdx + 1) + PADDING
            } else {
                pivot = true 
                locator = LEFT_OFFSET + SUBDIVISION*(+modalIdx) - PADDING
            }

            // 4. Return the pixel value to be consumed in the modalInvoker.
            return {locator, pivot} 
        }
        const { locator, pivot } = calculateModalLocation()
        setModalInvoker({
            invoked: true,
            eventID: eventID,
            locator: locator,
            pivot: pivot
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
            const dataIndex = event.currentTarget.dataset.idx
            createPreviewEvent(dayOfWeek, yCoord, dataIndex)
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

    function createEventWithCurrentTime(date: Date) {
        createPreviewEvent(date, -1, 1)
    }

    return (
        <>
            <div className='App'>
                <div className="main_content">
                    <Sidebar createEventWithCurrentTime={createEventWithCurrentTime}/>
                    <div className="calendar_content">
                        <CalendarHeader weekArray={weekArray} />
                        <div id='calendar_root' className='container' onDragOver={containerDragOverHandler} onDropCapture={containerDragDropHandler}>
                            {weekArray.map((dayOfWeek: Date, rowViewID: number) => (
                                <Row
                                    dayOfWeek={dayOfWeek}
                                    key={rowViewID} 
                                    idx={rowViewID}
                                    eventHandlers={{
                                        mouseUp: rowMouseUpHandler.bind(null, dayOfWeek)
                                    }}
                                    rowHeight={boardState.viewportHeight}>
                                    {boardState.eventDayCollection[hashDate(dayOfWeek)]?.eventCollection.map((event: IEvent, dayViewID: number) => (
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
                    <Modal 
                        event={eventState.modalEvent} 
                        setModal={setModal} 
                        updater={updateEvent} 
                        deleter={deleteEvent} 
                        invoker={modalInvoker}/>,
                    document.getElementById("root")
                )) : undefined}
        </>
    );
}

function CalendarTime (props) {
    const svgRoot = document.getElementById('svg_root')
    const height = 900 
    const initialOffset = height / 24;
    const timeArray = Array.from({length: 23}).map((_, idx) => {
        return height * (idx/24) + initialOffset
    })

    function formattedHour(hour: number): string {
        return dateFns.format(new Date(1997, 4, 20, hour), 'h aaaa')

    }
    return (
        <div id="svg_root" className="svg_root">
            {svgRoot && <svg viewBox={`0 0 ${svgRoot.offsetWidth * 2} ${height * 2}`}>
                {timeArray.map((time, idx) => (
                    <>
                        <text x="10" y={time * 2} style={{fontSize: '24px'}}>{formattedHour(idx + 1 )}</text>
                        <line key={time} x1="0" y1={time * 2} x2={svgRoot.offsetWidth * 2} y2={time * 2} style={{stroke: "#ccc", strokeWidth: "1"}}/>
                    </>
                ))}
            </svg>}
        </div>
    )

}



export default App;
