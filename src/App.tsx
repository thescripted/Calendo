import React from 'react'
import ReactDOM from 'react-dom'
import Header from './components/Header'
import Row from './components/Row'
import Card from './components/Event'
import Modal from './components/modal/Modal'
import Sidebar from './components/Sidebar'
import { hashDate, useEvent, getThreshold, locateDay, getCalendarInfo } from './support'
import * as dateFns from 'date-fns'
import { IEvent, IEventUpdateConfig, IModalInvoker } from './types/calendo'
import { useWeek } from './context/TimeContext'
import { useBoard, useBoardAPI } from './context/StoreContext'

/**
 * Returns the position of the cursor, relative to the calendar (0, 0) coordinate.
 * @param {number} - The absolute y-coordinate, relative to the page.
 * @returns {number} - Returns the coordinate relative to the calendar.
 */
function getRelativePosition(yCoordinate: number): number {
    const { TOP_OFFSET, SCROLL_OFFSET } = getCalendarInfo()
    const relativeYCoordinate = yCoordinate + SCROLL_OFFSET - TOP_OFFSET
    return relativeYCoordinate
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
}

function App() {
    const { boardState } = useBoard()
    const { weekArray } = useWeek()
    const { eventState, setEventState } = useEvent()
    const { generateEvent, updateEvent, deleteEvent } = useBoardAPI({ eventState, setEventState })
    const [modalInvoker, setModalInvoker] = React.useState<IModalInvoker>(defaultModalInvoker)

    // useEffect for toggling the modal. 
    // This relies on the cardollection being appropriately updated, but since this card
    // collection can be updated by many different places, a modalInvoker is used to toggle
    // the modal along with an updated Boardstate.
    React.useEffect(() => {
        if (modalInvoker.invoked) {
            setEventState({ ...eventState, modal: true, modalEvent: boardState.cardCollection[modalInvoker.eventID] })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardState.cardCollection, modalInvoker])

    // Effect to Scroll to bottom of Calendar Container. Typically Starts at 9am.
    // In thie future, this will be dependent on the time of day.
    React.useEffect(() => {
        const rootElem = document.getElementById('calendar_root')
        rootElem.scrollTop = rootElem.scrollHeight
    }, [])

    // Wrapper for setEventState. This is passed to the modal view to only update the modalState.
    function setModal(value: boolean) {
        setEventState({ ...eventState, modal: value, modalEvent: undefined })
        setModalInvoker(defaultModalInvoker)
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
        const yPosition = getRelativePosition(pageYCoordinate)
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
            const yPosition = getRelativePosition(yCoordinate)
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

        setModalInvoker({
            invoked: true,
            eventID: eventID,
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
        const yPosition = getRelativePosition(yCoord)
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

    function cardDragStartHandler(cardEvent: IEvent, ev) {
        ev.dataTransfer.setDragImage(invisibleImage, 0, 0)
        const clientHeight = ev.currentTarget.clientHeight
        const offsetThreshold = getThreshold(clientHeight)

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

    // Generates a preview Event based on the current Time. 
    // Operation is the exact same as "createPreviewEvent" but independent of the cursor position.
    function createEventWithCurrentTime(date: Date) {
        const startTime = getNearestStartTime(date)
        const defaultEndTime = dateFns.add(startTime, {
            minutes: 60 // 1 Hour by default.
        })
        const eventConfig: IEventUpdateConfig = {
            startTime: startTime,
            endTime: defaultEndTime,
            date: date,
            Day: boardState.eventDayCollection[hashDate(date)],
            content: "",
            preview: true
        }
        const eventID = generateEvent(eventConfig)

        setModalInvoker({
            invoked: true,
            eventID: eventID,
        })

        // falls foward to the next 30 minute interval. 
        // example: 3:17pm  -> 3:30pm
        // example: 5:31pm -> 6:00pm
        function getNearestStartTime(today: Date): Date {
            const currentTime = new Date()
            let limitExceeded = false
            let counter = 0
            let correctTime = today
            while (!limitExceeded) {
                counter += 1
                if (counter === 48) {
                    limitExceeded = true
                }
                correctTime = dateFns.add(correctTime, {
                    minutes: 30
                })
                if (currentTime <= correctTime) {
                    return correctTime
                }
            }
            return today
        }

    }

    function cardClickHandler(event: IEvent, e): void {
        setModalInvoker({
            eventID: event.eventID,
            invoked: true,
            feature: true
        })
    }


    return (
        <>
            <div className='App'>
                <div className="main_content">
                    <Sidebar createEventWithCurrentTime={createEventWithCurrentTime} />
                    <div className="calendar_content">
                        <Header weekArray={weekArray} />
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
                                                dragStart: cardDragStartHandler.bind(null, event),
                                                click: cardClickHandler.bind(null, event)
                                            }}
                                        />
                                    ))}
                                </Row>
                            ))}
                            <SVGHour />
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
                        invoker={modalInvoker} />,
                    document.getElementById("root")
                )) : undefined}
        </>
    );
}

function SVGHour() {
    const svgRoot = document.getElementById('svg_root')
    const height = 900
    const initialOffset = height / 24;
    const timeArray = Array.from({ length: 23 }).map((_, idx) => {
        return height * (idx / 24) + initialOffset
    })

    function formattedHour(hour: number): string {
        return dateFns.format(new Date(1997, 4, 20, hour), 'h aaaa')

    }
    return (
        <div id="svg_root" className="svg_root">
            {svgRoot && <svg width={svgRoot.offsetWidth} viewBox={`0 0 ${svgRoot.offsetWidth * 2} ${height * 2}`}>
                {timeArray.map((time, idx) => (
                    <React.Fragment key={idx}>
                        <text x="10" y={time * 2} style={{ fontSize: '24px' }}>{formattedHour(idx + 1)}</text>
                        <line key={time} x1="0" y1={time * 2} x2={svgRoot.offsetWidth * 2} y2={time * 2} style={{ stroke: "#ccc", strokeWidth: "1" }} />
                    </React.Fragment>
                ))}
            </svg>}
        </div>
    )

}

export default App;
