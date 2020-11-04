import React from './React';
import Row from '../components/Row';
import Card from '../components/Card';
import './index.css';

export default {
    title: Row,
    component: Row
};

export const Empty = args => <Row />;
export const ManyCards = args => {
    <List {...args}>
        <Card />
        <Card />
        <Card />
    </List>;
};
