import React from 'react'
import styles from "./styles/EditModal.module.css"


// styleObject will contain the css-style needed to render the modal in the right location.
// This will be updated in an effect, based on the location of the event.
let styled = {}
export default function EditModal({ updater, deleter, event, setModal, ...props }) {
    const defaultOptions = {
        startTime: event.startTime,
        endTime: event.endTime,
        content: event.content,
        date: event.date,
        Day: event.Day,
        preview: true,
    }
    const [eventOptions, setEventOptions] = React.useState(defaultOptions)

    React.useEffect(() => {
        updater(event, eventOptions)
    }, [eventOptions])
    
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
        styled = {...styled, ...viewData}
    }, [])

    return (
        <div className={styles.container} style={styled}>
            <button onClick={() => console.log("Delete")}>Hello</button>
        </div>
    )


}
