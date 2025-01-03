import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("dim")
    .createRange("brightness", run => run
        .onGetParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 },
        })
        .onGetCapability<number>("dim", value => value * 100)
        .onSetCapability<number>("dim", value => value / 100));