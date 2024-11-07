import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("valve_position")
    .createRange("open", run => run
        .setParams({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .getHomey<number>("valve_position", value => value * 100)
        .setHomey<number>("valve_position", value => value / 100));