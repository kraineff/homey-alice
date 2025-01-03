import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("volume_mute")
    .createToggle("mute", run => run
        .onGetCapability<boolean>("volume_mute")
        .onSetCapability<boolean>("volume_mute"));