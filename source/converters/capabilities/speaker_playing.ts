import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("speaker_playing")
    .createState(run => run
        .onGetCapability<boolean>("speaker_playing")
        .onSetCapability<boolean>("speaker_playing"));