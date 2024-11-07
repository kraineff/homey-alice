import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.fibaro:FGR-223")
    .createRange("open", run => run
        .setParams({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .getHomey<number>("windowcoverings_set", value => value * 100)
        .getHomey<number>("dim", value => value * 100)
        .setHomey<number>("windowcoverings_set", value => value / 100)
        .setHomey<number>("dim", value => value / 100));