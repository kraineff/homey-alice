import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_power")
    .createFloat("power", run => run
        .setParams({ unit: "watt" })
        .getHomey<number>("measure_power"));