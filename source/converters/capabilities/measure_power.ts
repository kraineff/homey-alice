import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_power")
    .createFloat("power", run => run
        .setParameters({ unit: "watt" })
        .getCapability<number>("measure_power"));