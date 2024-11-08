import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("volume_mute")
    .createToggle("mute", run => run
        .getCapability<boolean>("volume_mute")
        .setCapability<boolean>("volume_mute"));