import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("speaker_playing")
    .createState(run => run
        .getCapability<boolean>("speaker_playing")
        .setCapability<boolean>("speaker_playing"));