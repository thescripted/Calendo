import React from 'react';
import styles from './styles/Modal.module.css';
import * as dateFns from 'date-fns';
import produce from 'immer';

export default function Modal({ generator, updater, deleter, config, setModal, boardState}) {
    const defaultOptions = {
        startTime: config.startTime,
        endTime: config.endTime,
        content: "",
        date: config.date,
        day: config.day,
        preview: true,
    }

    const [eventOptions, setEventOptions] = React.useState(defaultOptions)
    const [eventObject, setEventObject] = React.useState(undefined)
    const [ID, setID] = React.useState(undefined)
    const formattedStartTime = dateFns.format(config.startTime, 'hh:mm a');
    const formattedEndTime = dateFns.format(config.endTime, 'hh:mm a');
    const formattedDate = dateFns.format(config.day.date, 'EEEE MMMM do');

    //This is horrific.
    React.useEffect(() => {
        const eventID = generator(defaultOptions)
        setID(eventID)
    }, []);

    React.useEffect(() => {
        setEventObject(boardState.cardCollection[ID])
    }, [boardState, ID])

    React.useEffect(() => {
        if (eventObject !== undefined) {
            updater(eventObject, eventOptions)
        }
    }, [eventOptions])

    function updateEventOptions(e) {
        const newState = produce(eventOptions, draftState => {
            draftState.content = e.target.value
        });
        setEventOptions(newState)
    }

    function publishEvent() {
        if (eventObject.content === "") {
            deleter(eventObject)
        } else {
        updater(eventObject, {...eventOptions, preview: false })
        }
    }

    function clearState() {
        setModal(false)
        setEventOptions(undefined)
        setEventObject(undefined)
    }

    return (
        <div className={styles.modal_wrapper}>
            <div className={styles.modal_container}>
                <div className={styles.modal_header}>
                    <button className={styles.x_icon} onClick={() => {
                        clearState()
                        deleter(eventObject)
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
                        clearState()
                        } 
                    }>Save</button>
                </div>
            </div>
        </div>
    );
}
