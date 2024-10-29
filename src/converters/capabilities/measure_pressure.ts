import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_pressure")
    .createFloat("pressure", run => run
        .setParams({ unit: "pressure.bar" })
        .getHomey<number>("measure_pressure", value => value / 1000));