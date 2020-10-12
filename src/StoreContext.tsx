import React from 'react'
import { IHeightIndex, IBoard } from '../src/types/calendo'

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

    generateInitialWeek(): Date[] {
        let week: Date[] = []
        for (let i = 0; i < this._numRows; i++) {
            week.push(new Date(2020, 9, i + 8))
        }
        return week
    }
}

const Board = new BoardGenerator(ROW_HEIGHT)


const StoreContext = React.createContext(undefined)

function useBoard() {
    const context = React.useContext(StoreContext)
    if (!context) {
        throw new Error(`useCount must be used within a BoardProvider`)
    }
    return context
}

function BoardProvider(props) {
    const [boardState, setBoardState] = React.useState(0)

    const value = React.useMemo(function() {
        return [boardState, setBoardState] [boardState]
    }, [])
    return <StoreContext.Provider value={value} {...props} />
}

export {BoardProvider, useBoard}

