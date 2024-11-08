import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_pressure")
    .createFloat("pressure", run => run
        .setParameters({ unit: "pressure.bar" })
        .getCapability<number>("measure_pressure", value => value / 1000));