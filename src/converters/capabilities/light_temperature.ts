import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("light_temperature")
    .createColor("temperature_k", run => run
        .setParams({ temperature_k: { min: 1500, max: 9000 } })
        .getHomey<number>("light_temperature", value => Math.round(((((1 - value) - 0) * (9000 - 1500)) / (1 - 0)) + 1500))
        .getHomey<string>("light_mode", value => value === "temperature" && "@prev" || "@break")
        .setHomey<number>("light_temperature", value => 1 - ((((value - 1500) * (1 - 0)) / (9000 - 1500)) + 0))
        .setHomey<string>("light_mode", () => "temperature"));