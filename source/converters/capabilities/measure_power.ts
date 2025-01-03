import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_power")
    .createFloat("power", run => run
        .onGetParameters({ unit: "watt" })
        .onGetCapability<number>("measure_power"));