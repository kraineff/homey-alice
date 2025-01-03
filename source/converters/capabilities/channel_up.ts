import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("channel_up")
    .createRange("channel", run => run
        .onGetParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .onSetCapability<boolean>("channel_up", value => value === 1 && true || "@break")
        .onSetCapability<boolean>("channel_down", value => value === 0 && true || "@break"));