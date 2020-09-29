import React from 'react';
import Card from './Card';

export default function generateCardTemplate(initial_coord) {
    return <Card coord={initial_coord} />;
}
