import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_voltage")
    .createFloat("voltage", run => run
        .onGetParameters({ unit: "volt" })
        .onGetCapability<number>("measure_voltage"));