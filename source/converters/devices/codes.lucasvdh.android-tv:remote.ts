import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("codes.lucasvdh.android-tv:remote")
    .createRange("channel", run => run
        .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .setCapability<boolean>("key_channel_up", value => value === 1 && true || "@break")
        .setCapability<boolean>("key_channel_down", value => value === 0 && true || "@break"))
    .createToggle("pause", run => run
        .setParameters({ retrievable: false })
        .setCapability<boolean>("key_pause", value => value === true && true || "@break")
        .setCapability<boolean>("key_play", value => value === false && true || "@break"));