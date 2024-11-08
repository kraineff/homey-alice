import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.aqara:aqara.feeder.acn001")
    .createState(run => run
        .setParameters({ split: true, retrievable: false })
        .getCapability<boolean>("feeder_action", () => false)
        .setCapability<boolean>("feeder_action", value => value === true && value || "@break"))
    .createToggle("controls_locked", run => run
        .getSetting<boolean>("control_lock"));