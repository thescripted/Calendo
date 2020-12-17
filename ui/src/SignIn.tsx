import React from "react";
import styles from "./SignIn.module.css";

function SignIn() {
    return (
        <Layout>
            <Logo>Calendo</Logo>
            <Form>
                <Header>Login to your Account</Header>
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

function Header({ children }) {
    return (
        <div className={styles.header}>
            <h2>{children}</h2>
        </div>
    );
}

function Logo({ children }) {
    return <h1>{children}</h1>;
}

function Form({ children }) {
    return (
        <form className={styles.form}>
            <div className={styles.formcontent}>{children}</div>
        </form>
    );
}

function Username() {
    return (
        <div className={styles.username}>
            <label htmlFor="username">Username</label>
            <input type="text" name="name" id="name" placeholder="Your Name" />
        </div>
    );
}

function Room() {
    return (
        <div className={styles.username}>
            <label htmlFor="room">Room</label>
            <input type="text" name="room" id="room" placeholder="Room ID" />
        </div>
    );
}

function SignInButton() {
    return <button>Enter Room</button>;
}

export default SignIn;
