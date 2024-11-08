import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("windowcoverings_closed")
    .createState(run => run
        .getCapability<boolean>("windowcoverings_closed", value => !value)
        .setCapability<boolean>("windowcoverings_closed", value => !value));