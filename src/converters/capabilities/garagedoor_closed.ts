import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("garagedoor_closed")
    .createState(run => run
        .getHomey<boolean>("garagedoor_closed", value => !value)
        .setHomey<boolean>("garagedoor_closed", value => !value));