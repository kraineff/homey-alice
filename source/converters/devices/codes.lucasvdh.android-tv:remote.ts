import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("codes.lucasvdh.android-tv:remote")
    .createRange("channel", run => run
        .onGetParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .onSetCapability<boolean>("key_channel_up", value => value === 1 && true || "@break")
        .onSetCapability<boolean>("key_channel_down", value => value === 0 && true || "@break"))
    .createToggle("pause", run => run
        .onGetParameters({ retrievable: false })
        .onSetCapability<boolean>("key_pause", value => value === true && true || "@break")
        .onSetCapability<boolean>("key_play", value => value === false && true || "@break"));