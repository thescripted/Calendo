import React from "react";
import styles from "./SignIn.module.css";

function SignIn() {
    return (
        <Layout>
            <Logo>Calendo</Logo>
            <Form>
                <Username />
                <Room />
                <SignInButton />
            </Form>
        </Layout>
    );
}

function Layout({ children }) {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>{children}</div>
        </div>
    );
}

function Logo({ children }) {
    return <h1>{children}</h1>;
}

function Form({ children }) {
    return <div className={styles.form}>{children}</div>;
}

function Username() {
    return (
        <div className={styles.username}>
            <label htmlFor="username">Username:</label>
            <input type="text" name="name" id="name" />
        </div>
    );
}

function Room() {
    return (
        <div className={styles.username}>
            <label htmlFor="room">Room:</label>
            <input type="text" name="room" id="room" />
        </div>
    );
}

function SignInButton() {
    return <button>Sign In!</button>;
}

export default SignIn;
