import React from 'react';
import Slot from './Slot';
import Card from './Card';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
    return (
        <div className='App'>
            <DndProvider backend={HTML5Backend}>
                <Card />
                {Array.from({ length: 10 }).map((_, idx) => (
                    <Slot key={`slot-${idx}`} id={idx} />
                ))}
            </DndProvider>
        </div>
    );
}

export default App;
