import React from "react";
import { StoreContext } from "../context/StoreContext";
import produce from "immer";
import { v4 as uuidv4 } from "uuid";
import {
    IBoard,
    IEvent,
    IEventUpdateConfig,
    IEventState,
} from "../../src/types/calendo";
import { isShallowEqual } from "../support/index";
import useDispatcher from "./useDispatcher"; // not sure how I feel coupling this hook with this file.

function validate(...args) {
    return;
}

interface APIConfig {
    eventState: IEventState;
    setEventState: Function;
    user: string;
}

export default function useBoardAPI(config: APIConfig) {
    const context = React.useContext(StoreContext);
    const { boardState, setBoardState } = context;
    const { eventState, setEventState, user } = config;
    const [opts, setOpts] = React.useState({});
    const dispatch = useDispatcher();

    function generateEvent(options: IEventUpdateConfig): string {
        const eventID = uuidv4();
        const eventDraft: IEvent = {
            eventID: eventID,
            date: options.date,
            Day: options.Day,
            startTime: options.startTime,
            endTime: options.endTime,
            content: options.content,
            preview: options.preview,
            author: config.user, // created on init.
        };

        const nextState: IBoard = produce<IBoard>(boardState, draftState => {
            draftState.cardCollection[eventID] = eventDraft;
            draftState.eventDayCollection[
                options.Day.dayID
            ].eventCollection.push(eventDraft);
        });

        validate(eventDraft, nextState);
        setBoardState(nextState);
        return eventID;
    }

    function updateEvent(event: IEvent, options: IEventUpdateConfig): void {
        if (!isShallowEqual(options, opts)) {
            setOpts(options);
            const nextState: IBoard = produce<IBoard>(
                boardState,
                draftState => {
                    const cardItem = draftState.cardCollection[event.eventID];
                    draftState.cardCollection[event.eventID] = {
                        ...cardItem,
                        ...options,
                    };

                    // Event has moved to a different date.
                    let oldEventArray: IEvent[];
                    if (
                        options.date &&
                        event.date.valueOf() !== options.date.valueOf()
                    ) {
                        oldEventArray = draftState.eventDayCollection[
                            event.Day.dayID
                        ].eventCollection.filter(singleEvent => {
                            if (singleEvent.eventID === event.eventID) {
                                return false;
                            }
                            return singleEvent;
                        });
                        draftState.eventDayCollection[
                            options.Day.dayID
                        ].eventCollection.push({ ...cardItem, ...options });
                        // Since this condition only apply when we are "carrying a card", update that carrying object state.
                        const nextCarryingState = produce(
                            eventState,
                            draftState => {
                                draftState.carrying = {
                                    ...draftState.carrying,
                                    ...options,
                                };
                            }
                        );
                        setEventState(nextCarryingState);
                    } else {
                        oldEventArray = draftState.eventDayCollection[
                            event.Day.dayID
                        ].eventCollection.map(singleEvent => {
                            if (singleEvent.eventID === event.eventID) {
                                return { ...cardItem, ...options };
                            }
                            return singleEvent;
                        });
                    }

                    draftState.eventDayCollection[
                        event.Day.dayID
                    ].eventCollection = oldEventArray;
                }
            );
            validate(event, nextState);
            setBoardState(nextState);
            if (options.preview === false) {
                dispatch(); // sends to server updated board state. Not sure if I want network traffic in this file.
            }
        }
    }

    // TODO: Make use of this. Can be used in validation or by user request.
    function deleteEvent(event: IEvent): void {
        const nextState: IBoard = produce<IBoard>(boardState, draftState => {
            delete draftState.cardCollection[event.eventID];
            const eventArray = draftState.eventDayCollection[
                event.Day.dayID
            ].eventCollection
                .map(singleEvent => {
                    if (singleEvent.eventID === event.eventID) {
                        return undefined;
                    }
                    return singleEvent;
                })
                .filter(singleEvent => {
                    return singleEvent !== undefined;
                });
            draftState.eventDayCollection[
                event.Day.dayID
            ].eventCollection = eventArray;
        });
        validate(event, nextState);
        setBoardState(nextState);
        dispatch(); // sends to server updated board state. Not sure if I want network traffic in this file.
    }

    return { generateEvent, updateEvent, deleteEvent };
}
