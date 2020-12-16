import React from "react";

function SignIn() {
    return (
        <Layout>
            <Logo>Calendo</Logo>
            <Form>
                <Username />
                <Room />
            </Form>
        </Layout>
    );
}

function Layout({ children }) {
    return <div className={styles.container}>{children}</div>;
}

function Logo({ children }) {
    return <h1>{children}</h1>;
}

function Form({ children }) {
    return <div>{children}</div>;
}

function Username() {}

function Room() {}

export default SignIn;
