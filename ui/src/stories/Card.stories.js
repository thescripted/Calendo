import React from 'react';
import Card from '../components/Card';
import './index.css';

export default {
    title: 'Card',
    component: Card
};

const Template = args => <Card {...args} />;
export const Default = Template.bind({});
Default.args = {
    level: 1,
    content: 'Hello, World',
    dateString: '11 – 11:30am'
};

export const Hour = Template.bind({});
Hour.args = {
    ...Default.args,
    level: 2,
    dateString: '11 – 12:00am'
};

export const ExtraLong = Template.bind({});
ExtraLong.args = {
    ...Default.args,
    level: 6,
    dateString: '11 – 2:00am'
};
