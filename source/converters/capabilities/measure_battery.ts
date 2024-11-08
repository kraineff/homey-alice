import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("measure_battery")
    .createFloat("battery_level", run => run
        .setParameters({ unit: "percent" })
        .getCapability<number>("measure_battery"));