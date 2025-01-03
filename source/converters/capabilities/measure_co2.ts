import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_co2")
    .createFloat("co2_level", run => run
        .onGetParameters({ unit: "ppm" })
        .onGetCapability<number>("measure_co2"));