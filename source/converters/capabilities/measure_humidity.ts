import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_humidity")
    .createFloat("humidity", run => run
        .setParameters({ unit: "percent" })
        .getCapability<number>("measure_humidity"));