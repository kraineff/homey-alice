import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_pm1")
    .createFloat("pm1_density", run => run
        .onGetParameters({ unit: "density.mcg_m3" })
        .onGetCapability<number>("measure_pm1"));