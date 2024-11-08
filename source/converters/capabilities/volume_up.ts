import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("volume_up")
    .createRange("volume", run => run
        .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .setCapability<boolean>("volume_up", value => value === 1 && true || "@break")
        .setCapability<boolean>("volume_down", value => value === 0 && true || "@break"));