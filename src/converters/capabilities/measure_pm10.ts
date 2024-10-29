import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_pm10")
    .createFloat("pm10_density", run => run
        .setParams({ unit: "density.mcg_m3" })
        .getHomey<number>("measure_pm10"));