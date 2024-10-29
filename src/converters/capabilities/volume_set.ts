import { HomeyConverter } from "../converter";

export default  HomeyConverter
    .create("volume_set")
    .createRange("volume", run => run
        .setParams({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .getHomey<number>("volume_set", value => value * 100)
        .setHomey<number>("volume_set", value => value / 100));