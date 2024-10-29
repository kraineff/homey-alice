import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_co")
    .createFloat("co2_level", run => run
        .setParams({ unit: "ppm" })
        .getHomey<number>("measure_co"));