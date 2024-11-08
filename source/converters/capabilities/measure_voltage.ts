import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_voltage")
    .createFloat("voltage", run => run
        .setParameters({ unit: "volt" })
        .getCapability<number>("measure_voltage"));