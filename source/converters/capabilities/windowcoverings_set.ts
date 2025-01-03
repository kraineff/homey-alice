import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("windowcoverings_set")
    .createRange("open", run => run
        .onGetParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .onGetCapability<number>("windowcoverings_set", value => value * 100)
        .onSetCapability<number>("windowcoverings_set", value => value / 100));