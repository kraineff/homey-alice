import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("windowcoverings_closed")
    .createState(run => run
        .onGetCapability<boolean>("windowcoverings_closed", value => !value)
        .onSetCapability<boolean>("windowcoverings_closed", value => !value));