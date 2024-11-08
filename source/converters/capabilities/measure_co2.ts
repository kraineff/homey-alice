import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_co2")
    .createFloat("co2_level", run => run
        .setParameters({ unit: "ppm" })
        .getCapability<number>("measure_co2"));