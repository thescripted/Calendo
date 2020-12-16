export interface IHeightIndex extends Array<number> {
    [index: number]: number;
}

export interface IEvent {
    eventID: string;
    Day: IDay;
    date: Date;
    startTime: Date;
    endTime: Date;
    content: string;
    preview: boolean;
}

export interface IEventUpdateConfig {
    Day?: IDay;
    date?: Date;
    startTime?: Date;
    endTime?: Date;
    content?: string;
    preview?: boolean;
}

export interface IDay {
    date: Date;
    dayID: string;
    eventCollection: IEvent[];
}

export interface ISearchEvent {
    [eventID: string]: IEvent;
}

export interface ISearchDay {
    [dayID: string]: IDay;
}

export interface IBoard {
    numRows: number; // Will be removed soon...
    viewportHeight: number;
    heightIndex: IHeightIndex; // Should probably not be state-dependent.
    cardCollection: ISearchEvent;
    eventDayCollection: ISearchDay;
    endpoint: string;
}

export interface IEventState {
    dragging: IEvent | undefined;
    carrying: IEvent | undefined;
    modal: boolean;
    isDragging: boolean;
    isCarrying: boolean;
    modalEvent: IEvent | undefined;
}

export interface IModalInvoker {
    invoked: boolean;
    eventID: string;
    feature?: boolean; // if true, will invoke "feature modal" instead of "main modal"
}
