import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("channel_up")
    .createRange("channel", run => run
        .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .setCapability<boolean>("channel_up", value => value === 1 && true || "@break")
        .setCapability<boolean>("channel_down", value => value === 0 && true || "@break"));