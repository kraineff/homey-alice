import { readdir } from "node:fs/promises";
import { HomeyConverter } from "./converter";

class Converters {
    async get(converterName: string) {
        const directory = import.meta.dir + (!converterName.includes(":") ? "/capabilities/" : "/devices/");
        const converterFile = converterName.replace("homey:app:", "") + ".ts";
        const converterPath = directory + converterFile;
        const converters = await readdir(directory);

        if (converters.includes(converterFile))
            return (await import(converterPath)).default as HomeyConverter;
        return HomeyConverter.create("unknown");
    }

    async merge(converterNames: string[]) {
        const mergeConverter = HomeyConverter.create("merge");
        
        await Promise.all(converterNames.map(async converterName => {
            const converter = await this.get(converterName);
            mergeConverter.use(converter);
        }));
        return mergeConverter;
    }
}

export const HomeyConverters = new Converters();
export * from "./converter";
export * from "./utils";