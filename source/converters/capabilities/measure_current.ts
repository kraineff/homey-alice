import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_current")
    .createFloat("amperage", run => run
        .onGetParameters({ unit: "ampere" })
        .onGetCapability<number>("measure_current"));