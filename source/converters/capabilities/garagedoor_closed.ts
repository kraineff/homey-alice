import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("garagedoor_closed")
    .createState(run => run
        .onGetCapability<boolean>("garagedoor_closed", value => !value)
        .onSetCapability<boolean>("garagedoor_closed", value => !value));