import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("volume_mute")
    .createToggle("mute", run => run
        .getHomey<boolean>("volume_mute")
        .setHomey<boolean>("volume_mute"));