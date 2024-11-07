import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_luminance")
    .createFloat("illumination", run => run
        .setParams({ unit: "illumination.lux" })
        .getHomey<number>("measure_luminance"));