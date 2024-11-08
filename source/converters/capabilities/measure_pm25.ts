import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_pm25")
    .createFloat("pm2.5_density", run => run
        .setParameters({ unit: "density.mcg_m3" })
        .getCapability<number>("measure_pm25"));