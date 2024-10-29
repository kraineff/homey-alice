import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_pm1")
    .createFloat("pm1_density", run => run
        .setParams({ unit: "density.mcg_m3" })
        .getHomey<number>("measure_pm1"));