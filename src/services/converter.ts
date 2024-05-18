import { CapabilityState, CapabilityStateAction } from "../typings";

type ConverterBuilder<Params, SetValue> =
    (run: Converter<Params, SetValue>) => typeof run;

export class HomeyConverter {
    private converters: Record<string, any> = {};

    use(converter: HomeyConverter) {
        this.converters = { ...this.converters, ...converter.converters };
        return this;
    }

    createState(run: ConverterBuilder<{ split?: boolean }, boolean>) {
        const type = "devices.capabilities.on_off";
        const instance = "on";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createColor(run: ConverterBuilder<{}, Partial<{ h: number, s: number, v: number }>>) {
        const type = "devices.capabilities.color_setting";
        const instance = "hsv";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createVideo(run: ConverterBuilder<{ protocols: string[] }, { protocols: string[] }>) {
        const type = "devices.capabilities.video_stream";
        const instance = "get_stream";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createMode(instance: string, run: ConverterBuilder<{ modes: string[] }, string>) {
        const type = "devices.capabilities.mode";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createRange(instance: string, run: ConverterBuilder<{
        unit?: string;
        random_access?: boolean;
        range?: [number, number, number];
    }, number>) {
        const type = "devices.capabilities.range";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createToggle(instance: string, run: ConverterBuilder<{}, boolean>) {
        const type = "devices.capabilities.toggle";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createFloat(instance: string, run: ConverterBuilder<{ unit?: string }, number>) {
        const type = "devices.properties.float";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    createEvent(instance: string, run: ConverterBuilder<{ events: string[] }, string>) {
        const type = "devices.properties.event";
        this.converters[`${type},${instance}`] = run(new Converter(type, instance));
        return this;
    }

    getParameters(capabilities: any) {
        const converters = Object.values(this.converters);
        const response: Record<"capabilities" | "properties", Array<any>> = {
            capabilities: [],
            properties: [],
        };

        converters.map(converter => {
            const parameters = converter.getParams(capabilities);
            response[converter.category as keyof typeof response].push(parameters);
        });

        return response;
    }

    getStates(capabilities: any) {
        const converters = Object.values(this.converters);
        const response: Record<"capabilities" | "properties", Array<CapabilityState>> = {
            capabilities: [],
            properties: [],
        };

        converters.map(converter => {
            const { type, instance, category } = converter;
            const value = converter.getState(capabilities);
            value !== null && response[category as keyof typeof response].push({ type, state: { instance, value } });
        });

        return response;
    }

    async setStates(capabilities: Array<CapabilityState>, handler: (capabilityId: string, value: any) => Promise<any>) {
        const response: Record<"capabilities", Array<CapabilityStateAction>> = {
            capabilities: []
        };

        await Promise.all(
            capabilities.map(async capability => {
                const type = capability.type;
                const instance = capability.state.instance;
                const converter = this.converters[`${type},${instance}`];
                if (!converter) return;

                const values = converter.setState(capability.state.value);
                const actionValues = Object.entries(values);
                const actionResult: any = await Promise
                    .all(actionValues.map(async ([capabilityId, value]) => value !== null && handler(capabilityId, value)))
                    .then(() => ({ status: "DONE" }))
                    .catch(error => {
                        const result = {
                            status: "ERROR",
                            error_code: "DEVICE_UNREACHABLE"
                        };
                        
                        const message = error?.message;
                        if (message) {
                            if (message.startsWith("Not Found: Device with ID"))
                                result.error_code = "DEVICE_NOT_FOUND";
                            if (message.startsWith("Power on in progress..."))
                                result.error_code = "DEVICE_BUSY";
                        }
                        
                        console.log(error?.message);
                        return result;
                    });

                response.capabilities.push({ type, state: { instance, action_result: actionResult } });
            })
        );

        return response;
    }
}

type ParamsHandler<Params> = (capabilities: Record<string, any>) => Partial<Params>;

class Converter<Params, SetValue> {
    readonly category: string;
    private parameters: any;
    private parametersRaw: any;
    private handleParams: ParamsHandler<Params>;
    private handleGet: (capabilities: Record<string, any>) => any;
    private handleSet: (value: any) => Record<string, any>;

    constructor(readonly type: string, readonly instance: string) {
        this.category = type.split(".")[1];
        this.parameters = {
            type,
            retrievable: true, reportable: false,
            parameters: {}
        };
        this.parametersRaw = {};
        this.handleParams = () => ({});
        this.handleGet = () => null;
        this.handleSet = () => ({});
    }

    setParams(params: Params & { parse?: ParamsHandler<Params> }) {
        const { parse, ...parameters } = params;
        const prevHandler = this.handleParams;
        
        this.parametersRaw = parameters;
        parse && (this.handleParams = function (capabilities) {
            const prevValue = prevHandler(capabilities);
            const value = parse(capabilities);
            return { ...prevValue, ...value };
        })

        return this;
    }

    getHomey(capabilityId: string, handler?: (capability: any) => SetValue | null) {
        const prevHandler = this.handleGet;
        handler = handler ?? (capability => capability.value);

        this.handleGet = function (capabilities) {
            const capability = capabilities[capabilityId];

            let capabilityValue = capability?.value ?? null;
            if (capability?.getable === false && capability?.type === "boolean")
                capabilityValue = false;

            const prevValue = prevHandler(capabilities);
            const value = capabilityValue !== null ? handler(capability) : null;

            if (value === null) return prevValue;
            if (typeof value === "number") return Math.abs(value);
            if (typeof value === "object" && typeof prevValue === "object") return { ...prevValue, ...value };
            return value;
        }
        
        return this;
    }

    setHomey(capabilityId: string, handler?: (value: Required<SetValue>) => any | null) {
        const prevHandler = this.handleSet;
        handler = handler ?? (value => value);

        this.handleSet = function (capabilityValue) {
            capabilityValue = capabilityValue ?? null;
            const prevValue = prevHandler(capabilityValue);
            const value = handler(capabilityValue);
            prevValue[capabilityId] = value;
            return prevValue;
        }
        
        return this;
    }

    getParams(capabilities: any) {
        const parametersRaw: Record<string, any> = {
            ...this.parametersRaw,
            ...this.handleParams(capabilities)
        };
        
        const parameters = this.parameters;
        parameters.parameters = {
            ...parameters.parameters,
            ...(["devices.capabilities.mode",
                 "devices.capabilities.range",
                 "devices.capabilities.toggle",
                 "devices.properties.float",
                 "devices.properties.event"].includes(this.type) && {
                instance: this.instance
            }),
            ...(("devices.capabilities.color_setting" === this.type) && {
                color_model: this.instance
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
                range: {
                    min: parametersRaw.range[0],
                    max: parametersRaw.range[1],
                    precision: parametersRaw.range[2],
                }
            })
        };

        return parameters;
    }

    getState(capabilities: any) {
        return this.handleGet(capabilities);
    }

    setState(value: any) {
        return this.handleSet(value);
    }
}