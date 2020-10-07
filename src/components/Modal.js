import React from 'react';
import styles from './styles/Modal.module.css';
import * as dateFns from 'date-fns';
import produce from 'immer';

export default function Modal({ generator, updater, options, setModal, boardState}) {

    const defaultOptions = {
        startTime: options.startTime,
        endTime: options.endTime,
        content: "Hello, World",
        date: options.date,
        day: options.day,
        preview: false,
    }

    const [eventOptions, setEventOptions] = React.useState(defaultOptions)
    const [eventObject, setEventObject] = React.useState(undefined)
    const [ID, setID] = React.useState(undefined)
    const formattedStartTime = dateFns.format(options.startTime, 'hh:mm a');
    const formattedEndTime = dateFns.format(options.endTime, 'hh:mm a');
    const formattedDate = dateFns.format(options.day.date, 'EEEE MMMM do');

    React.useEffect(() => {
        if (ID == undefined) {
            setID(generator(defaultOptions))
        }
        setEventObject(boardState.cardCollection[ID])
    }, [boardState, ID])

    React.useEffect(() => {
        if (eventObject !== undefined) {
            updater(eventObject, eventOptions)
        }
    }, [eventOptions, eventObject])

    function updateEventContent(e) {
        const newState = produce(eventOptions, draftState => {
            draftState.content = e.target.value
        });
        setEventOptions(newState)
    }

    function publishEvent() {
        updater(eventObject, eventOptions)
    }
    return (
        <div className={styles.modal_wrapper}>
            <div className={styles.modal_container}>
                <div className={styles.modal_header}>
                    <button className={styles.x_icon} onClick={() => setModal(false)} />
                </div>
                <div className={styles.modal_main}>
                    <textarea
                        autoFocus
                        className={`${styles.hover} ${styles.hover_3}`}
                        placeholder='Add Title'
                        value={eventOptions[2]}
                        onChange={updateEventContent}
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
                        <p className={styles.timezone}>UTC-5</p>
                    </div>
                </div>
                <div className={styles.modal_footer}>
                    <button onClick={() => {
                        publishEvent()
                        setModal(false)
                        } 
                    }>Save</button>
                </div>
            </div>
        </div>
    );
}
