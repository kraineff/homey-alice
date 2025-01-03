import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_humidity")
    .createFloat("humidity", run => run
        .onGetParameters({ unit: "percent" })
        .onGetCapability<number>("measure_humidity"));