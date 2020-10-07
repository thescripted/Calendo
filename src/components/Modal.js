import React from 'react';
import styles from './styles/Modal.module.css';
import * as dateFns from 'date-fns';
import produce from 'immer';

export default function Modal({ generator, updater, options, setModal}) {

    const defaultOptions = [
        options.start,
        options.end,
        "Hello, World",
        options.day,
        false,
    ]

    const [eventOptions, setEventOptions] = React.useState(defaultOptions)
    const [eventObject, setEventObject] = React.useState(undefined)
    const formattedStartTime = dateFns.format(options.start, 'hh:mm a');
    const formattedEndTime = dateFns.format(options.end, 'hh:mm a');
    const formattedDate = dateFns.format(options.day.date, 'EEEE MMMM do');

    const eventTesting = generator(...defaultOptions)
    console.log(eventTesting)


    React.useEffect(() => {
        console.log("I'm triggered")
        console.log(eventObject)
        if (eventObject !== undefined) {
            updater(eventObject, {
                startTime: eventOptions[0],
                endTime: eventOptions[1],
                content: eventOptions[2],
                date: eventOptions[3]
            })
        }
    }, [eventOptions] )

    function updateEventContent(e) {
        const newState = produce(eventOptions, draftState => {
            draftState[2] = e.target.value
        });
        setEventOptions(newState)
        console.log(newState)
    }

    function publishEvent() {
        updater(eventObject, {
            startTime: eventOptions[0],
            endTime: eventOptions[1],
            content: eventOptions[2],
            date: eventOptions[3],
            preview: false
        })
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
