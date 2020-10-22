import React from 'react';
import styles from './styles/Card.module.css';
import * as dateFns from 'date-fns';
import {getThreshold} from '../support';


export default function Card({ event, eventHandlers, ...props }) {
    const formattedStartTime = dateFns.format(event.startTime, 'hh:mm a');
    const formattedEndTime = dateFns.format(event.endTime, 'hh:mm a');
    const eventIntRatio = dateFns.differenceInMinutes(event.endTime, event.startTime) / (24 * 60);
    const eventHeightRatio = dateFns.differenceInMinutes(event.startTime, event.date) / (24 * 60);
    const eventContent = event.content === "" ? "Untitled Event" : event.content
    const [cursor, setCursor] = React.useState("default")
    let defaultStyle = {
        height: `${props.scale * eventIntRatio - 2}px`,
        top: eventHeightRatio * props.scale,
        opacity: `${event.preview ? 0.6 : 1.0}`,
        cursor: cursor
    }

    function updatePointer(e) {
        e.persist()
        const threshold = getThreshold(e.currentTarget.clientHeight)
        if (e.nativeEvent.offsetY < e.currentTarget.clientHeight - threshold){
            setCursor("default")
        } else {
            setCursor("ns-resize")
        }
    }

    return (
        <div
            data-eventid={event.eventID}
            draggable="true"
            onDragStart={eventHandlers.dragStart}
            className={styles.card}
            style={defaultStyle}
            onClick={eventHandlers.click}
            onMouseMoveCapture={updatePointer}
        >
            <p>{eventContent}</p>
            <p>{`${formattedStartTime} - ${formattedEndTime}`}</p>
        </div>
    );
}
