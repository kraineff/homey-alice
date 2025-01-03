import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_battery")
    .createFloat("battery_level", run => run
        .onGetParameters({ unit: "percent" })
        .onGetCapability<number>("measure_battery"));