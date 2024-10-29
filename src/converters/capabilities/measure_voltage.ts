import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_voltage")
    .createFloat("voltage", run => run
        .setParams({ unit: "volt" })
        .getHomey<number>("measure_voltage"));