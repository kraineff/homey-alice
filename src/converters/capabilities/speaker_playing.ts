import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("speaker_playing")
    .createState(run => run
        .getHomey<boolean>("speaker_playing")
        .setHomey<boolean>("speaker_playing"));