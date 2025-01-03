import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("volume_set")
    .createRange("volume", run => run
        .onGetParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .onGetCapability<number>("volume_set", value => value * 100)
        .onSetCapability<number>("volume_set", value => value / 100));