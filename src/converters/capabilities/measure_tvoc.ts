import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_tvoc")
    .createFloat("tvoc", run => run
        .setParams({ unit: "density.mcg_m3" })
        .getHomey<number>("measure_tvoc"));