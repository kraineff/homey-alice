import { ActionResult } from "./actionResult";

export type CapabilityState = {
    type: string;
    state: {
        instance: string;
        value: any;
        relative?: boolean; // range
    };
};

export type CapabilityAction = {
    type: string;
    state: {
        instance: string;
        action_result?: ActionResult;
    };
};