import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("com.aqara:aqara.feeder.acn001")
    .createState(run => run
        .onGetParameters({ split: true, retrievable: false })
        .onGetCapability<boolean>("feeder_action", () => false)
        .onSetCapability<boolean>("feeder_action", value => value === true && value || "@break"))
    .createToggle("controls_locked", run => run
        .onGetSetting<boolean>("control_lock"));