import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_tvoc")
    .createFloat("tvoc", run => run
        .onGetParameters({ unit: "density.mcg_m3" })
        .onGetCapability<number>("measure_tvoc"));