import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_tvoc")
    .createFloat("tvoc", run => run
        .setParameters({ unit: "density.mcg_m3" })
        .getCapability<number>("measure_tvoc"));