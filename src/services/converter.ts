import { HomeyAPIV2 } from "homey-api";
import { CapabilityState, DeviceCapability, DeviceProperty } from "../typings";

type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };

type GetValueHandler = (capabilities: Record<string, HomeyCapability>) => any;
type SetValueHandler = (value: any) => Record<string, any>;
type Converter = {
    type: string;
    instance: string;
    category: "capabilities" | "properties";
    details: DeviceCapability | DeviceProperty;
    get: GetValueHandler;
    set: SetValueHandler;
};

class ConverterWrapper<SetValue> {
    public handleGet: GetValueHandler;
    public handleSet: SetValueHandler;

    constructor() {
        this.handleGet = () => null;
        this.handleSet = () => ({});
    }

    getHomey(
        capabilityId: string,
        handler: (capability: HomeyCapability) => SetValue = (capability => capability.value)
    ) {
        const currentHandler = this.handleGet;
        this.handleGet = function (capabilities) {
            const capability = capabilities[capabilityId];
            let capabilityValue = capability?.value ?? null;
            if (capability?.getable === false) capabilityValue = false;

            const prevValue = currentHandler(capabilities);
            const value = capabilityValue !== null ? handler(capability) : null;
            
            if (value === null) return prevValue;
            if (typeof value === "number") return Math.abs(value);
            if (typeof value === "object" && typeof prevValue === "object") return { ...prevValue, ...value };
            return value;
        }

        return this;
    }

    setHomey(
        capabilityId: string,
        handler: (value: Required<SetValue>) => any = (value => value)
    ) {
        const currentHandler = this.handleSet;
        this.handleSet = function (_value) {
            const capabilityValue = _value ?? null;
            const currentValue = currentHandler(capabilityValue);
            const value = handler(capabilityValue);
            currentValue[capabilityId] = value;
            return currentValue;
        }

        return this;
    }
}

type ConverterWrapperHandler<SetValue = any> = (run: ConverterWrapper<SetValue>) => typeof run;

export class HomeyConverter {
    private converters: Record<string, Converter> = {};
    private type?: string;

    getDetails() {
        const converters = Object.values(this.converters);
        const response: Record<string, any[]> = {
            capabilities: [],
            properties: []
        };

        converters.map(converter => {
            const capability = converter.details;
            response[converter.category].push(capability);
        });

        return response;
    }

    getState(capabilities: Record<string, any>) {
        const converters = Object.values(this.converters);
        const response: Record<string, any[]> = {
            capabilities: [],
            properties: []
        };

        converters.map(({ type, instance, category, get }) => {
            const value = get(capabilities);
            value !== null && response[category].push({ type, state: { instance, value } });
        });

        return response;
    }

    async setState(capabilities: Array<CapabilityState>, setValue: (capabilityId: string, value: any) => Promise<any>) {
        const response: Record<string, any[]> = {
            capabilities: []
        };

        await Promise.all(
            capabilities.map(async ({ type, state }) => {
                const instance = state.instance;
                const converter = this.converters[`${type},${instance}`];
                if (!converter) return;
    
                const values = converter.set(state.value);
                const valuesArray = Object.entries(values);
                const actionStatus = await Promise
                    .all(valuesArray.map(async ([capabilityId, value]) => value !== null && setValue(capabilityId, value)))
                    .then(() => "DONE")
                    .catch(() => "ERROR");

                response.capabilities.push({ type, state: { instance, action_result: { status: actionStatus } } });
            })
        );

        return response;
    }

    setType(type: string) {
        this.type = type;
        return this;
    }

    getType() {
        return this.type && `devices.types.${this.type}`;
    }

    private appendConverter<T>(run: ConverterWrapperHandler<T>, type: string, instance: string, parameters: any) {
        const { handleGet, handleSet } = run(new ConverterWrapper());
        const category = type.split(".")[1] as any;

        this.converters[`${type},${instance}`] = {
            type, instance, category,
            details: { type, parameters },
            get: handleGet, set: handleSet
        };
    }
    
    createState(run: ConverterWrapperHandler<boolean>) {
        const instance = "on";
        this.appendConverter(run, "devices.capabilities.on_off", instance, {});
        return this;
    }

    createColor(run: ConverterWrapperHandler<Partial<{ h: number, s: number, v: number }>>) {
        const instance = "hsv";
        this.appendConverter(run, "devices.capabilities.color_setting", instance, { color_model: instance });
        return this;
    }

    createVideo(protocols: string[], run: ConverterWrapperHandler<{ protocols: string[] }>) {
        const instance = "get_stream";
        this.appendConverter(run, "devices.capabilities.video_stream", instance, { protocols });
        return this;
    }

    createMode(instance: string, modes: string[], run: ConverterWrapperHandler<string>) {
        this.appendConverter(run, "devices.capabilities.mode", instance, {
            instance,
            modes: modes.map(mode => ({ value: mode }))
        });
        return this;
    }

    createRange(instance: string, unit: string, range: [number, number, number], run: ConverterWrapperHandler<number>) {
        const [min, max, precision] = range;
        unit = `unit.${unit}`;

        this.appendConverter(run, "devices.capabilities.range", instance, {
            instance, unit,
            range: { min, max, precision }
        });
        return this;
    }

    createToggle(instance: string, run: ConverterWrapperHandler<boolean>) {
        this.appendConverter(run, "devices.properties.toggle", instance, { instance });
        return this;
    }

    createFloat(instance: string, unit: string, run: ConverterWrapperHandler<number>) {
        unit = `unit.${unit}`;
        this.appendConverter(run, "devices.properties.float", instance, { instance, unit });
        return this;
    }

    createEvent(instance: string, events: string[], run: ConverterWrapperHandler<string>) {
        this.appendConverter(run, "devices.properties.event", instance, {
            instance,
            events: events.map(event => ({ value: event }))
        });
        return this;
    }
}