import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("target_temperature")
    .createRange("temperature", run => run
        .onGetParameters({
            unit: "temperature.celsius",
            parse: ({ target_temperature }) => ({
                range: {
                    min: target_temperature.min ?? 4,
                    max: target_temperature.max ?? 35,
                    precision: target_temperature.step ?? 0.5
                }
            }),
        })
        .onGetCapability<number>("target_temperature")
        .onSetCapability<number>("target_temperature"));