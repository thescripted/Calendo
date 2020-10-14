import React from 'react'
import { IHeightIndex, IBoard, IEvent, IEventUpdateConfig } from '../src/types/calendo'
import produce from 'immer';
import { ROW_HEIGHT } from './support/Constant'
import { v4 as uuidv4 } from 'uuid'

class BoardGenerator {
    constructor(viewportHeight: number) {
        this._numRows = 7
        this._viewportHeight = viewportHeight
        this._heightIndex = this._generateHeightIndex(24, 2)

    }

    private _viewportHeight: number
    private _numRows: number
    private _heightIndex: IHeightIndex
  
    private _generateHeightIndex(hour, subdivision): IHeightIndex {
        const HourToViewScale = this._viewportHeight / (hour * subdivision)
        const Offset = HourToViewScale / 2
        let hourArray = Array.from({ length: hour * subdivision }).map(function (_, idx) {
            return HourToViewScale * idx + Offset
        })
        return hourArray
    }

    generateInitialBoardState(): IBoard {
        return {
            numRows: this._numRows,
            viewportHeight: this._viewportHeight,
            heightIndex: this._heightIndex,
            cardCollection: {},
            eventDayCollection: {}
        }
    }

}

const StoreContext = React.createContext(undefined)

// TODO: Validate will determine if the event location is validated. If the card
// is in a "preview" state, then no validation checks are needed.
function validate(event: IEvent, stagedState: IBoard): void {
    const { preview, startTime, endTime, date } = event
    if (preview) {
        return
    }
}

function useBoardAPI(localEventContext) {
    const context = React.useContext(StoreContext)

    const {boardState, setBoardState} = context
    const {eventState, setEventState} = localEventContext

    function generateEvent(options: IEventUpdateConfig): string {
        const eventID = uuidv4()
        const eventDraft: IEvent = {
            eventID: eventID,
            date: options.date,
            Day: options.Day,
            startTime: options.startTime,
            endTime: options.endTime,
            content: options.content,
            preview: options.preview,
        }

        const nextState: IBoard = produce<IBoard>(boardState, draftState => {
            draftState.cardCollection[eventID] = eventDraft
            draftState.eventDayCollection[options.Day.dayID].eventCollection.push(eventDraft)
        })

        validate(eventDraft, nextState)
        setBoardState(nextState)
        return eventID
    }

    function updateEvent(event: IEvent, options: IEventUpdateConfig): void {
        const nextState: IBoard = produce<IBoard>(boardState, draftState => {
            const cardItem = draftState.cardCollection[event.eventID]
            draftState.cardCollection[event.eventID] = { ...cardItem, ...options }

            // Event has moved to a different date.
            let oldEventArray: IEvent[]
            if (options.date && event.date.valueOf() !== options.date.valueOf()) {
                oldEventArray = draftState.eventDayCollection[event.Day.dayID].eventCollection.filter(singleEvent => {
                    if (singleEvent.eventID !== event.eventID) {
                        return singleEvent
                    }
                })
                draftState.eventDayCollection[options.Day.dayID].eventCollection.push({ ...cardItem, ...options })
                // Since this condition only apply when we are "carrying a card", update that carrying object state.
                const nextCarryingState = produce(eventState, draftState => {
                  draftState.carrying = { ...draftState.carrying, ...options }
                })
                setEventState(nextCarryingState)
  
            } else {
                oldEventArray = draftState.eventDayCollection[event.Day.dayID].eventCollection.map(singleEvent => {
                    if (singleEvent.eventID === event.eventID) {
                        return { ...cardItem, ...options }
                    }
                    return singleEvent
                })
            }

            draftState.eventDayCollection[event.Day.dayID].eventCollection = oldEventArray
        })
        validate(event, nextState)
        setBoardState(nextState)
    }

    // TODO: Make use of this. Can be used in validation or by user request.
    function deleteEvent(event: IEvent): void {
        const nextState: IBoard = produce<IBoard>(boardState, draftState => {
            delete draftState.cardCollection[event.eventID]
            const eventArray = draftState.eventDayCollection[event.Day.dayID].eventCollection.map(singleEvent => {
                if (singleEvent.eventID === event.eventID) {
                    return undefined
                }
                return singleEvent
            }).filter(singleEvent => {
                return (singleEvent !== undefined)
            })
            draftState.eventDayCollection[event.Day.dayID].eventCollection = eventArray
        })
        validate(event, nextState)
        setBoardState(nextState)
    }

    return {generateEvent, updateEvent, deleteEvent}
}

function useBoard() {
    const context = React.useContext(StoreContext)
    if (!context) {
        throw new Error(`useBoard must be used within a BoardProvider`)
    }

    const {boardState, setBoardState} = context

    return {
        boardState,
        setBoardState
    }
}

function BoardProvider(props) {
    const Board = new BoardGenerator(ROW_HEIGHT)
    const [boardState, setBoardState] = React.useState<IBoard>(Board.generateInitialBoardState())

    const value = React.useMemo(function() {
        return {
            boardState, 
            setBoardState,
            Board
        }
    }, [boardState])
    return <StoreContext.Provider value={value} {...props} />
}

export {StoreContext, BoardProvider, useBoard, useBoardAPI}

