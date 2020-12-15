import React from "react";
import styles from "./styles/Modal.module.css";
import MainModal from "./MainModal";

// Switch Between Main Modal and EditModal depending on incoming props.
export default function Modal({ invoker, ...props }) {
    // Todo: Abstract logic on this level to pass into the modals.

    return (
        <div className={styles.modal_wrapper}>
            <MainModal {...props} />
        </div>
    );
}
