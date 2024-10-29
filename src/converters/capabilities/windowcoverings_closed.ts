import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("windowcoverings_closed")
    .createState(run => run
        .getHomey<boolean>("windowcoverings_closed", value => !value)
        .setHomey<boolean>("windowcoverings_closed", value => !value));