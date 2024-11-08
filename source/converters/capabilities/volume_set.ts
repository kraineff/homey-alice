import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("volume_set")
    .createRange("volume", run => run
        .setParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .getCapability<number>("volume_set", value => value * 100)
        .setCapability<number>("volume_set", value => value / 100));