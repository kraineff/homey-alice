import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_current")
    .createFloat("amperage", run => run
        .setParams({ unit: "ampere" })
        .getHomey<number>("measure_current"));