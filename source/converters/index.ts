import { HomeyConverter } from "./converter";

export class HomeyConverters {
    private converterCache: Map<string, HomeyConverter> = new Map();
    private mergeCache: Map<string, HomeyConverter> = new Map();
    private readonly CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;

    constructor() {
        setInterval(() => {
            this.converterCache.clear();
            this.mergeCache.clear();
        }, this.CACHE_CLEANUP_INTERVAL);
    }

    async get(converterName: string) {
        converterName = converterName.replace("homey:app:", "");
        if (this.converterCache.has(converterName))
            return this.converterCache.get(converterName)!;

        const directory = import.meta.dir + (!converterName.includes(":") ? "/capabilities/" : "/devices/");
        const converterFile = converterName + ".ts";
        const converterPath = directory + converterFile;

        if (await Bun.file(converterPath).exists()) {
            const converter = (await import(converterPath)).default as HomeyConverter;
            this.converterCache.set(converterName, converter);
            return converter;
        }
        return HomeyConverter.create("unknown");
    }

    async merge(converterNames: string[]) {
        const cacheKey = [...new Set(converterNames)].sort().join(",");
        if (this.mergeCache.has(cacheKey))
            return this.mergeCache.get(cacheKey)!;

        const mergeConverter = HomeyConverter.create("merge");
        await Promise.all(
            converterNames.map(async converterName => {
                const converter = await this.get(converterName);
                mergeConverter.use(converter);
            })
        );

        this.mergeCache.set(cacheKey, mergeConverter);
        return mergeConverter;
    }
}

export * from "./converter";
export * from "./utils";