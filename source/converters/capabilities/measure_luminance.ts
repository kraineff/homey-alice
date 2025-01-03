import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_luminance")
    .createFloat("illumination", run => run
        .onGetParameters({ unit: "illumination.lux" })
        .onGetCapability<number>("measure_luminance"));