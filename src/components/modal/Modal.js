import React from 'react';
import styles from './styles/Modal.module.css';
import * as dateFns from 'date-fns';
import produce from 'immer';

// styleObject will contain the css-style needed to render the modal in the right location.
// This will be updated in an effect, based on the location of the event.
let styleObject = {}
export default function Modal({ updater, deleter, event, setModal, ...props }) {

    const defaultOptions = {
        startTime: event.startTime,
        endTime: event.endTime,
        content: event.content,
        date: event.date,
        Day: event.Day,
        preview: true,
    }
    const [eventOptions, setEventOptions] = React.useState(defaultOptions)

    // Effect to update Event Data.
    React.useEffect(() => {
        updater(event, eventOptions)
    }, [eventOptions])

    // Effect to update the style Object.
    React.useEffect(() => {
        /**
         * getModalPosition is a method that considers the location and width of the event to
         * update, the viewport dimensions, the page dimensions, and the scroll position in order
         * to determine the location of the modal. This will ensure that the modal is always visible
         * on the client's screen and positioned next to the event that the client created.
         *
         * This functions considers the boundary of the viewport, and (will eventually) consider
         * updating the scroll to ensure that the modal and event is always in view.
         * 
         * @param element - The DOM element to position the modal next to.
         * @return object - The CSS styling for the modal.
         */
        function getModalPosition(element) {
            const modalDimension = { // Determined elsewhere. This is a placeholder.
                width: 400,
                height: 226
            }
            const viewportDimension = {
                width: window.innerWidth,
                height: window.innerHeight
            }
            const elementDimensions = element.getBoundingClientRect()
            const { top, left, width } = elementDimensions
            const padding = 4
            const CSSObject = {
                top: top + window.scrollY,
                left: left + width + window.scrollX + padding,
                opacity: 1,
                pivot: false // Used for determining animation direction
            }

            if (left > viewportDimension.width / 2) {
                CSSObject.left = left - modalDimension.width - padding
                CSSObject.pivot = true
            }

            let heightBuffer = 4
            if (CSSObject.top < heightBuffer) {
                CSSObject.top = heightBuffer 
            } else if (CSSObject.top >= viewportDimension.height - modalDimension.height - heightBuffer + window.scrollY) {
                CSSObject.top = viewportDimension.height - modalDimension.height - heightBuffer + window.scrollY
            }

            let widthBuffer = 8
            if (CSSObject.left < widthBuffer) {
                CSSObject.left = widthBuffer
            } else if (CSSObject.left >= viewportDimension.width - modalDimension.width - widthBuffer + window.scrollX) {
                CSSObject.left = viewportDimension.width - modalDimension.width - widthBuffer + window.scrollX
            }

            return CSSObject
        }

        const eventViewObject = document.querySelector(`[data-eventid="${event.eventID}"]`)
        const viewData = getModalPosition(eventViewObject)
        const pivot = viewData.pivot
        delete viewData.pivot
        styleObject = {...styleObject, ...viewData}
        return () => {
            styleObject = {}
        }
    }, [])

    function updateEventOptions(e) {
        const newState = produce(eventOptions, draftState => {
            draftState.content = e.target.value
        });
        setEventOptions(newState)
    }

    function publishEvent() {
        if (event.content === "") {
            deleter(event)
        } else {
        updater(event, {...eventOptions, preview: false})
        }
    }

    function clearState() {
        setModal(false)
        setEventOptions(undefined)
    }

    const formattedStartTime = dateFns.format(event.startTime, 'hh:mm a');
    const formattedEndTime = dateFns.format(event.endTime, 'hh:mm a');
    const formattedDate = dateFns.format(event.date, 'EEEE, MMMM do');
    return (
        <div className={styles.modal_wrapper}>
            <div className={styles.modal_container} style={styleObject}>
                <div className={styles.modal_header}>
                    <button className={styles.x_icon} onClick={() => {
                        deleter(event)
                        clearState()
                        }
                    } />
                </div>
                <div className={styles.modal_main}>
                    <textarea
                        autoFocus
                        className={`${styles.hover} ${styles.hover_3}`}
                        placeholder='Add Title'
                        value={eventOptions.content}
                        onChange={updateEventOptions}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                publishEvent()
                                clearState()
                                return
                            }
                        }}
                        rows='1'
                        wrap='soft'
                    ></textarea>
                    <div className={styles.modal_date_wrapper}>
                        <div className={styles.modal_dates_area}>
                            <button className={styles.date_area}>{formattedDate}</button>
                            <div className={styles.time_area}>
                                <button>{formattedStartTime}</button>–<button>{formattedEndTime}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.modal_footer}>
                    <button onClick={() => {
                        publishEvent()
                        clearState()
                        } 
                    }>Save</button>
                </div>
            </div>
        </div>
    );
}
