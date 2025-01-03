import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_pressure")
    .createFloat("pressure", run => run
        .onGetParameters({ unit: "pressure.bar" })
        .onGetCapability<number>("measure_pressure", value => value / 1000));