import React from 'react'
import { IHeightIndex, IBoard} from '../../src/types/calendo'
import { ROW_HEIGHT } from '../support/Constant'

class BoardGenerator {
    constructor(viewportHeight: number) {
        this._numRows = 7
        this._viewportHeight = viewportHeight
        this._heightIndex = this._generateHeightIndex(24, 2)

    }

    private _viewportHeight: number
    private _numRows: number
    private _heightIndex: IHeightIndex

    private _generateHeightIndex(hour: number, subdivision: number): IHeightIndex {
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

function BoardProvider(props) {
    const Board = new BoardGenerator(ROW_HEIGHT)
    const [boardState, setBoardState] = React.useState<IBoard>(Board.generateInitialBoardState())

    const value = React.useMemo(function () {
        return {
            boardState,
            setBoardState,
            Board
        }
    }, [Board, boardState])
    return <StoreContext.Provider value={value} {...props} />
}

export { StoreContext, BoardProvider}

