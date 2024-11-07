import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("volume_up")
    .createRange("volume", run => run
        .setParams({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .setHomey<boolean>("volume_up", value => value === 1 && true || "@break")
        .setHomey<boolean>("volume_down", value => value === 0 && true || "@break"));