import React from 'react';
import styles from './styles/Modal.module.css';

export default function Modal(props) {
    return (
        <div className={styles.modal_wrapper}>
            <div className={styles.modal_container}>
                <div className={styles.modal_header}>
                    <button className={styles.x_icon} />
                </div>
                <div className={styles.modal_main}>
                    <textarea
                        className={`${styles.hover} ${styles.hover_3}`}
                        placeholder='Add Title'
                        rows='1'
                        wrap='soft'
                    ></textarea>
                    <div className={styles.modal_date_wrapper}>
                        <div className={styles.modal_dates_area}>
                            <button className={styles.date_area}>Monday, October 5</button>
                            <div className={styles.time_area}>
                                <button>10:30am</button>–<button>11:30am</button>
                            </div>
                        </div>
                        <p className={styles.timezone}>UTC-5</p>
                    </div>
                </div>
                <div className={styles.modal_footer}>
                    <button>Save</button>
                </div>
            </div>
        </div>
    );
}
