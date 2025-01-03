import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_pm10")
    .createFloat("pm10_density", run => run
        .onGetParameters({ unit: "density.mcg_m3" })
        .onGetCapability<number>("measure_pm10"));