import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_pm25")
    .createFloat("pm2.5_density", run => run
        .onGetParameters({ unit: "density.mcg_m3" })
        .onGetCapability<number>("measure_pm25"));