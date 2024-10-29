import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("onoff")
    .createState(run => run
        .getHomey<boolean>("onoff")
        .setHomey<boolean>("onoff"));