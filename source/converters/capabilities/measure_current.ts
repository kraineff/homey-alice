import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_current")
    .createFloat("amperage", run => run
        .setParameters({ unit: "ampere" })
        .getCapability<number>("measure_current"));