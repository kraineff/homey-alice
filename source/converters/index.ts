import { readdir } from "node:fs/promises";
import { HomeyConverter } from "./converter";

export class HomeyConverters {
    async get(converterName: string) {
        converterName = converterName.replace("homey:app:", "");
        const directory = import.meta.dir + (!converterName.includes(":") ? "/capabilities/" : "/devices/");
        const converterFile = converterName + ".ts";
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

export * from "./converter";
export * from "./utils";