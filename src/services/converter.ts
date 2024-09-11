import { HomeyAPIV2 } from "homey-api";
import { CapabilityAction, CapabilityState } from "../typings";
import { makeStateBody } from "./utils";

export type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };
export type HomeyCapabilities = Record<string, HomeyCapability>;
type ConverterBuilder<Params, SetValue> =
    (converter: Converter<Params & { retrievable?: boolean }, SetValue>) => typeof converter;

export class HomeyConverter {
    private converters: Record<string, Converter<any, any>> = {};

    constructor(private name: string, private type?: string) {}

    static create(name: string, type?: string) {
        return new HomeyConverter(name, type);
    }

    use(converter: HomeyConverter) {
        const converters = { ...this.converters };
        const convertersNew = { ...converter.converters };

        Object.values(convertersNew).map(converterNew => {
            const converterKey = `${converterNew.type},${converterNew.instance}`;
            const converterName = converters[converterKey]?.name;

            converterName && Object.values(converters)
                .map(converter => converter.name === converterName &&
                    delete converters[`${converter.type},${converter.instance}`]);
                
            converters[converterKey] = converterNew;
        });

        this.type = converter.type || this.type;
        this.converters = converters;
        return this;
    }

    createState(run: ConverterBuilder<{ split?: boolean }, boolean>) {
        const type = "devices.capabilities.on_off";
        const instance = "on";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createColor(instance: string, run: ConverterBuilder<{
        temperature_k?: {
            min: number;
            max: number;
        };
        scenes?: string[];
    }, any>) {
        const type = "devices.capabilities.color_setting";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createVideo(run: ConverterBuilder<{ protocols: string[] }, { protocols: string[] }>) {
        const type = "devices.capabilities.video_stream";
        const instance = "get_stream";
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createMode(instance: string, run: ConverterBuilder<{ modes: string[] }, string>) {
        const type = "devices.capabilities.mode";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createRange(instance: string, run: ConverterBuilder<{
        unit?: string;
        random_access?: boolean;
        range?: {
            min: number;
            max: number;
            precision: number;
        };
    }, number>) {
        const type = "devices.capabilities.range";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createToggle(instance: string, run: ConverterBuilder<{}, boolean>) {
        const type = "devices.capabilities.toggle";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createFloat(instance: string, run: ConverterBuilder<{ unit?: string }, number>) {
        const type = "devices.properties.float";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    createEvent(instance: string, run: ConverterBuilder<{ events: string[] }, string>) {
        const type = "devices.properties.event";
        // @ts-ignore
        this.converters[`${type},${instance}`] = run(new Converter(this.name, type, instance));
        return this;
    }

    getParams(capabilities: HomeyCapabilities) {
        const response: any = {
            capabilities: [], properties: [], custom_data: []
        };

        let capabilityColor: any;
        const converterIds = new Set();
        Object.values(this.converters).map(converter => {
            const capability = converter.convertParams(capabilities);
            converterIds.add(converter.name);

            if (capability.type === "devices.capabilities.color_setting") {
                if (!capabilityColor) capabilityColor = capability;
                else capabilityColor.parameters = { ...capabilityColor.parameters, ...capability.parameters };
                return;
            }

            response[converter.category].push(capability);
        });

        capabilityColor && response.capabilities.push(capabilityColor);
        response.custom_data = [...converterIds];
        response.type = this.type;
        return response;
    }

    getStates(capabilities: HomeyCapabilities) {
        const converters = Object.values(this.converters);
        const response: Record<"capabilities" | "properties", Array<CapabilityState>> = {
            capabilities: [], properties: []
        };

        converters.map(converter => {
            const capability = converter.convertGet(capabilities);
            capability !== undefined && response[converter.category].push(capability);
        });

        return response;
    }

    async setStates(capabilities: Array<CapabilityState>, handler: (capabilityId: string, value: any) => Promise<any>) {
        const response: Record<"capabilities", Array<CapabilityAction>> = {
            capabilities: []
        };

        response.capabilities = await Promise.all(capabilities.map(async ({ type, state }) => {
            const instance = state.instance;
            const converter = this.converters[`${type},${instance}`];
            if (converter) return converter.convertSet(state.value, handler);
            
            const result = { status: "ERROR", error_code: "INVALID_ACTION" };
            return makeStateBody(type, instance, { action_result: result });
        }));

        return response;
    }
}

type ParamsHandler<Params> = (capabilities: HomeyCapabilities) => Partial<Params>;

class Converter<Params extends Record<string, any>, SetValue extends any> {
    readonly category: "capabilities" | "properties";
    private parameters: Params;
    private handleParams: ParamsHandler<Params>;
    private handleGet: (capabilities: HomeyCapabilities) => any;
    private handleSet: (value: any) => Record<string, any>;

    constructor(readonly name: string, readonly type: string, readonly instance: string) {
        this.category = type.split(".")[1] as any;
        this.parameters = {} as Params;
        this.handleParams = () => ({});
        this.handleGet = () => undefined;
        this.handleSet = () => ({});
    }

    setParams(params: Params & { parse?: ParamsHandler<Params>; }) {
        const { parse, ...parameters } = params;
        const prevHandler = this.handleParams;
        
        this.parameters = parameters as Params;
        parse && (this.handleParams = function (capabilities) {
            const prevValue = prevHandler(capabilities);
            const value = parse(capabilities);
            return { ...prevValue, ...value };
        })

        return this;
    }

    getHomey<ValueType = any>(capabilityId: string, handler?: (value: ValueType) => SetValue | "@prev" | "@break") {
        const currentHandler = this.handleGet;
        handler = handler ?? (value => value as unknown as SetValue);

        this.handleGet = function (capabilities) {
            const currentValue = currentHandler(capabilities);
            try {
                const capability = capabilities[capabilityId];
                let capabilityValue = capability.value;
                if (capability.getable === false && capability.type === "boolean") capabilityValue = false;

                const value = capabilityValue === null && "@prev" || handler(capabilityValue);
                if (value === "@prev") return currentValue;
                if (value === "@break") return undefined;
                if (typeof value === "number") return Math.abs(value);
                if (typeof value === "object" && typeof currentValue === "object") return { ...currentValue, ...value };

                return value ?? undefined;
            } catch (error) {
                return currentValue;
            }
        }
        
        return this;
    }

    setHomey<ValueType = any>(capabilityId: string, handler?: (value: SetValue) => ValueType | "@break") {
        const currentHandler = this.handleSet;
        handler = handler ?? (value => value as unknown as ValueType);

        this.handleSet = function (capabilityValue) {
            const currentValue = currentHandler(capabilityValue);
            try {
                capabilityValue = capabilityValue ?? undefined;
                const value = handler(capabilityValue);
                currentValue[capabilityId] = (value === "@break" || value === null || value === undefined) ? undefined : value;
                return currentValue;
            } catch (error) {
                return currentValue;
            }
        }
        
        return this;
    }

    convertParams(capabilities: HomeyCapabilities) {
        const parameters: Record<string, any> = {
            ...this.parameters,
            ...this.handleParams(capabilities)
        };

        return {
            type: this.type,
            retrievable: parameters.retrievable ?? true,
            reportable: false,
            parameters: {
                ...((this.type !== "devices.capabilities.on_off" && this.type !== "devices.capabilities.color_setting") && {
                    instance: this.instance
                }),
                ...((this.instance === "hsv" || this.instance === "rgb") && {
                    color_model: this.instance
                }),
                ...((parameters.temperature_k !== undefined && this.instance === "temperature_k") && {
                    temperature_k: parameters.temperature_k
                }),
                ...((parameters.scenes !== undefined && this.instance === "scene") && {
                    color_scene: { scenes: parameters.scenes.map((id: string) => ({ id })) }
                }),
                ...((parameters.split !== undefined) && {
                    split: parameters.split
                }),
                ...((parameters.random_access !== undefined) && {
                    random_access: parameters.random_access
                }),
                ...((parameters.range !== undefined) && {
                    range: parameters.range
                }),
                ...((parameters.unit !== undefined) && {
                    unit: `unit.${parameters.unit}`
                }),
                ...((parameters.modes !== undefined) && {
                    modes: parameters.modes.map((value: string) => ({ value }))
                }),
                ...((parameters.events !== undefined) && {
                    events: parameters.events.map((value: string) => ({ value }))
                })
            }
        };
    }

    convertGet(capabilities: HomeyCapabilities) {
        const value = this.handleGet(capabilities);
        if (value !== undefined) return makeStateBody(this.type, this.instance, { value });
        return undefined;
    }

    async convertSet(value: any, handler: (capabilityId: string, value: any) => Promise<any>) {
        const values = Object.entries(this.handleSet(value));
        const actionResult = await Promise
            .all(values.map(async ([capabilityId, value]) => value !== undefined && handler(capabilityId, value)))
            .then(() => ({ status: "DONE" }))
            .catch((error: Error) => {
                const errorMsg = error?.message || "";
                const result = { status: "ERROR", error_code: "DEVICE_UNREACHABLE" };
                console.log(errorMsg);

                if (errorMsg.startsWith("Invalid Capability:"))
                    return ({ status: "DONE" });

                if (errorMsg.startsWith("Not Found: Device with ID"))
                    result.error_code = "DEVICE_NOT_FOUND";

                if (errorMsg.startsWith("Power on in progress..."))
                    result.error_code = "DEVICE_BUSY";

                return result;
            });
        
        return makeStateBody(this.type, this.instance, { action_result: actionResult });
    }
}