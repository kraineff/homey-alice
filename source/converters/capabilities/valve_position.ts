import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("valve_position")
    .createRange("open", run => run
        .onGetParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .onGetCapability<number>("valve_position", value => value * 100)
        .onSetCapability<number>("valve_position", value => value / 100));