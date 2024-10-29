import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("measure_battery")
    .createFloat("battery_level", run => run
        .setParams({ unit: "percent" })
        .getHomey<number>("measure_battery"));