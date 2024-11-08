import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("valve_position")
    .createRange("open", run => run
        .setParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .getCapability<number>("valve_position", value => value * 100)
        .setCapability<number>("valve_position", value => value / 100));