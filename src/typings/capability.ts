import { ActionResult } from ".";

type BaseCapability<Parameters> = {
    type: string;
    retrievable?: boolean;
    reportable?: boolean;
    parameters: Parameters;
};

export type StateCapability = BaseCapability<{
    split?: boolean;
}>;

export type ColorCapability = BaseCapability<(
    | { color_model: "hsv" | "rgb" }
    | { temperature_k: { min?: number, max?: number } }
    | { color_scene: { scenes: Array<{ id: string }> } }
)>;

export type ModeCapability = BaseCapability<{
    instance: string;
    modes: Array<{ value: string }>;
}>;

export type RangeCapability = BaseCapability<{
    instance: string;
    unit?: string;
    random_access?: boolean;
    range?: {
        min?: number;
        max?: number;
        precision?: number;
    };
}>;

export type ToggleCapability = BaseCapability<{
    instance: string;
}>;

export type FloatCapability = BaseCapability<{
    instance: string;
    unit: string;
}>;

export type EventCapability = BaseCapability<{
    instance: string;
    events: Array<{ value: string }>;
}>;

type BaseCapabilityState<State> = {
    type: string;
    state: { instance: string } & State;
};

export type CapabilityState = BaseCapabilityState<{
    value: any;
    relative?: boolean; // range
}>;

export type CapabilityStateAction = BaseCapabilityState<{
    action_result?: ActionResult;
}>;

export type DeviceCapability = StateCapability | ColorCapability | ModeCapability | RangeCapability | ToggleCapability;
export type DeviceProperty = FloatCapability | EventCapability;