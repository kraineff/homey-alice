import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("target_temperature")
    .createRange("temperature", run => run
        .setParameters({
            unit: "temperature.celsius",
            parse: ({ target_temperature }) => ({
                range: {
                    min: target_temperature.min ?? 4,
                    max: target_temperature.max ?? 35,
                    precision: target_temperature.step ?? 0.5
                }
            }),
        })
        .getCapability<number>("target_temperature")
        .setCapability<number>("target_temperature"));