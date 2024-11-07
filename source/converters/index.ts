import { readdir } from "node:fs/promises";
import { HomeyConverter } from "./converter";

class Converters {
    #converters: Record<string, HomeyConverter> = {};

    async get(converterName: string) {
        converterName = converterName.replace("homey:app:", "");
        if (this.#converters[converterName]) return this.#converters[converterName];

        const directory = import.meta.dir + (!converterName.includes(":") ? "/capabilities/" : "/devices/");
        const converterFile = converterName + ".ts";
        const converterPath = directory + converterFile;
        const converters = await readdir(directory);

        if (converters.includes(converterFile)) {
            const converter = (await import(converterPath)).default() as HomeyConverter;
            this.#converters[converterName] = converter
            return this.#converters[converterName];
        }
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