import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("com.sensibo:Sensibo")
    .createState(run => run
        .onGetCapability<boolean>("se_onoff")
        .onSetCapability<boolean>("se_onoff"))
    .createMode("thermostat", run => run
        .onGetParameters({ modes: ["auto", "heat", "cool"] })
        .onGetCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
        .onSetCapability<string>("thermostat_mode"))
    .createMode("fan_speed", run => run
        .onGetParameters({ modes: ["quiet", "auto", "low", "medium", "high"] })
        .onGetCapability<string>("se_fanlevel", value => ["quiet", "auto", "low", "medium", "high"].includes(value) && value || "@break")
        .onSetCapability<string>("se_fanlevel"));