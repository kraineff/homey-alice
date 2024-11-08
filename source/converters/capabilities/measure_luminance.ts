import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_luminance")
    .createFloat("illumination", run => run
        .setParameters({ unit: "illumination.lux" })
        .getCapability<number>("measure_luminance"));