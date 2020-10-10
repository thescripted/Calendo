import React from 'react';
import styles from './styles/Card.module.css';
import * as dateFns from 'date-fns';

import { useDrag } from 'react-dnd';
import { TYPES } from '../support/Constant';

export default function Card({ event, eventHandlers, ...props }) {
    //    const [collectedProps, drag] = useDrag({
        // ID is the main identifier for the card. This should be injected to this component from the model layer.
        // This will be the ID used so the slots know which card to render/update when needed.
    //   item: { type: TYPES.CARD, id: props.id },
    //   collect: monitor => ({
    //       isDragging: monitor.isDragging()
    //   })
    // });
    const formattedStartTime = dateFns.format(event.startTime, 'hh:mm a');
    const formattedEndTime = dateFns.format(event.endTime, 'hh:mm a');
    const eventIntRatio = dateFns.differenceInMinutes(event.endTime, event.startTime) / (24 * 60);
    const eventHeightRatio = dateFns.differenceInMinutes(event.startTime, event.date) / (24 * 60);
    const eventContent = event.content === "" ? "Untitled Event" : event.content

    return (
        <div
            draggable="true"
            onDragStart={eventHandlers.dragStart}
            className={styles.card}
            style={{
                height: `${props.scale * eventIntRatio - 2}px`,
                top: eventHeightRatio * props.scale,
                opacity: `${event.preview ? 0.6 : 1.0}`
            }}
            onMouseDown={eventHandlers.mouseDown}
            // onMouseUp={() => props.publishDragEvent(props.rowID, props.id, false)}
        >
            <p>{eventContent}</p>
            <p>{`${formattedStartTime} - ${formattedEndTime}`}</p>
        </div>
    );
}
