import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("channel_up")
    .createRange("channel", run => run
        .setParams({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
        .setHomey<boolean>("channel_up", value => value === 1 && true || "@break")
        .setHomey<boolean>("channel_down", value => value === 0 && true || "@break"));