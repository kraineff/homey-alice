import { HomeyAPIV2 } from "homey-api";
import { CapabilityAction, CapabilityParams, CapabilityState } from "../typings";
import { makeStateBody } from "./utils";

type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };
type HomeyCapabilities = Record<string, HomeyCapability>;
type ConverterBuilder<Params, SetValue> =
    (converter: Converter<Params & { retrievable?: boolean }, SetValue>) => typeof converter;

export class HomeyConverter {
    private converters: Record<string, Converter<any, any>> = {};

    constructor(private name: string) {}

    static create(name: string) {
        return new HomeyConverter(name);
    }

    use(converter: HomeyConverter) {
        const converters = { ...this.converters };
        const newConverters = Object.values({ ...converter.converters });

        newConverters.map(newConverter => {
            const newConverterKey = `${newConverter.type},${newConverter.instance}`;
            const currentConverter = converters[newConverterKey];

            if (currentConverter !== undefined) {
                const currentConverterName = currentConverter.name;
                
                Object.values(converters).map(converter => {
                    if (converter.name !== currentConverterName) return;
                    delete converters[`${converter.type},${converter.instance}`];
                });
            }

            converters[newConverterKey] = newConverter;
        });

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
        const converters = Object.values(this.converters);
        const response: Record<"capabilities" | "properties" | "custom_data", Array<any>> = {
            capabilities: [],
            properties: [],
            custom_data: []
        };

        let colorCapability: any = {};
        const converterIds = new Set();
        converters.map(converter => {
            const capability = converter.convertParams(capabilities);
            converterIds.add(converter.name);

            if (capability.type === "devices.capabilities.color_setting")
                return colorCapability = {
                    type: "devices.capabilities.color_setting",
                    retrievable: colorCapability.retrievable ?? capability.retrievable,
                    reportable: colorCapability.reportable ?? capability.reportable,
                    parameters: { ...(colorCapability.parameters || {}), ...capability.parameters }
                };

            response[converter.category].push(capability);
        });

        Object.keys(colorCapability).length && response.capabilities.push(colorCapability);
        response.custom_data = [...converterIds];
        return response;
    }

    getStates(capabilities: HomeyCapabilities) {
        const converters = Object.values(this.converters);
        const response: Record<"capabilities" | "properties", Array<CapabilityState>> = {
            capabilities: [],
            properties: [],
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
    private parameters: CapabilityParams;
    private parametersRaw: Params;
    private handleParams: ParamsHandler<Params>;
    private handleGet: (capabilities: HomeyCapabilities) => any;
    private handleSet: (value: any) => Record<string, any>;

    constructor(readonly name: string, readonly type: string, readonly instance: string) {
        this.category = type.split(".")[1] as any;
        this.parameters = {
            type,
            retrievable: true, reportable: false,
            parameters: {}
        };
        this.parametersRaw = {} as Params;
        this.handleParams = () => ({});
        this.handleGet = () => null;
        this.handleSet = () => ({});
    }

    setParams(params: Params & { parse?: ParamsHandler<Params>; }) {
        const { parse, ...parameters } = params;
        const prevHandler = this.handleParams;
        
        this.parametersRaw = parameters as Params;
        parse && (this.handleParams = function (capabilities) {
            const prevValue = prevHandler(capabilities);
            const value = parse(capabilities);
            return { ...prevValue, ...value };
        })

        return this;
    }

    getHomey<ValueType = any>(capabilityId: string, handler?: (value: ValueType) => SetValue | undefined | "@break") {
        const prevHandler = this.handleGet;
        handler = handler ?? (value => value as unknown as SetValue);

        this.handleGet = function (capabilities) {
            const capability = capabilities[capabilityId];

            let capabilityValue = capability?.value ?? undefined;
            if (capability?.getable === false && capability?.type === "boolean")
                capabilityValue = false;

            const prevValue = prevHandler(capabilities);
            const value = capabilityValue !== undefined ? handler(capabilityValue) : undefined;

            if (value === "@break") return undefined;
            if (value === undefined) return prevValue;
            if (typeof value === "number") return Math.abs(value);
            if (typeof value === "object" && typeof prevValue === "object") return { ...prevValue, ...value };
            return value;
        }
        
        return this;
    }

    setHomey<ValueType = any>(capabilityId: string, handler?: (value: SetValue) => ValueType | undefined) {
        const prevHandler = this.handleSet;
        handler = handler ?? (value => value as unknown as ValueType);

        this.handleSet = function (capabilityValue) {
            capabilityValue = capabilityValue ?? undefined;
            const prevValue = prevHandler(capabilityValue);
            const value = handler(capabilityValue);
            prevValue[capabilityId] = value ?? undefined;
            return prevValue;
        }
        
        return this;
    }

    convertParams(capabilities: HomeyCapabilities) {
        const parametersRaw: Record<string, any> = {
            ...this.parametersRaw,
            ...this.handleParams(capabilities)
        };
        
        const parameters = { ...this.parameters };
        if (parametersRaw.retrievable !== undefined)
            parameters.retrievable = parametersRaw.retrievable;

        parameters.parameters = {
            ...parameters.parameters,
            ...(["devices.capabilities.mode",
                 "devices.capabilities.range",
                 "devices.capabilities.toggle",
                 "devices.properties.float",
                 "devices.properties.event"].includes(this.type) && {
                instance: this.instance
            }),
            ...((["hsv", "rgb"].includes(this.instance)) && {
                color_model: this.instance
            }),
            ...(("temperature_k" === this.instance && parametersRaw.temperature_k) && {
                temperature_k: parametersRaw.temperature_k
            }),
            ...(("scene" === this.instance && parametersRaw.scenes) && {
                color_scene: {
                    scenes: parametersRaw.scenes.map((id: string) => ({ id }))
                }
            }),
            ...((parametersRaw.split ?? undefined) && {
                split: parametersRaw.split
            }),
            ...((parametersRaw.random_access ?? undefined) && {
                random_access: parametersRaw.random_access
            }),
            ...((parametersRaw.unit ?? undefined) && {
                unit: `unit.${parametersRaw.unit}`
            }),
            ...((parametersRaw.modes ?? undefined) && {
                modes: parametersRaw.modes.map((value: string) => ({ value }))
            }),
            ...((parametersRaw.events ?? undefined) && {
                events: parametersRaw.events.map((value: string) => ({ value }))
            }),
            ...((parametersRaw.range ?? undefined) && {
                range: parametersRaw.range
            })
        };

        return parameters;
    }

    convertGet(capabilities: HomeyCapabilities) {
        const value = this.handleGet(capabilities);
        return value !== undefined ? makeStateBody(this.type, this.instance, { value }) : undefined;
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