import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_temperature")
    .createFloat("temperature", run => run
        .setParameters({ unit: "temperature.celsius" })
        .getCapability<number>("measure_temperature"));