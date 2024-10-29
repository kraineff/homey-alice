import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_temperature")
    .createFloat("temperature", run => run
        .setParams({ unit: "temperature.celsius" })
        .getHomey<number>("measure_temperature"));