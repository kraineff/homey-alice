import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("garagedoor_closed")
    .createState(run => run
        .getCapability<boolean>("garagedoor_closed", value => !value)
        .setCapability<boolean>("garagedoor_closed", value => !value));