import React from 'react';
import styles from './styles/Modal.module.css';
import * as dateFns from 'date-fns';
import produce from 'immer';

export default function Modal({ updater, deleter, event, setModal }) {
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
    const formattedDate = dateFns.format(event.date, 'EEEE MMMM do');

    return (
        <div className={styles.modal_wrapper}>
            <div className={styles.modal_container}>
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
