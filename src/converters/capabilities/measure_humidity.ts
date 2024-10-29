import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_humidity")
    .createFloat("humidity", run => run
        .setParams({ unit: "percent" })
        .getHomey<number>("measure_humidity"));