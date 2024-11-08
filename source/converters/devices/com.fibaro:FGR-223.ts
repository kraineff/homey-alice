import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.fibaro:FGR-223")
    .createRange("open", run => run
        .setParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 }
        })
        .getCapability<number>("windowcoverings_set", value => value * 100)
        .getCapability<number>("dim", value => value * 100)
        .setCapability<number>("windowcoverings_set", value => value / 100)
        .setCapability<number>("dim", value => value / 100));