import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("onoff")
    .createState(run => run
        .onGetCapability<boolean>("onoff")
        .onSetCapability<boolean>("onoff"));