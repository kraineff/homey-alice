import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("dim")
    .createRange("brightness", run => run
        .setParams({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 },
        })
        .getHomey<number>("dim", value => value * 100)
        .setHomey<number>("dim", value => value / 100));