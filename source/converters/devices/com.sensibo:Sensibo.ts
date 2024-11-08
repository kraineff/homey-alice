import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("com.sensibo:Sensibo")
    .createState(run => run
        .getCapability<boolean>("se_onoff")
        .setCapability<boolean>("se_onoff"))
    .createMode("thermostat", run => run
        .setParameters({ modes: ["auto", "heat", "cool"] })
        .getCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
        .setCapability<string>("thermostat_mode"))
    .createMode("fan_speed", run => run
        .setParameters({ modes: ["quiet", "auto", "low", "medium", "high"] })
        .getCapability<string>("se_fanlevel", value => ["quiet", "auto", "low", "medium", "high"].includes(value) && value || "@break")
        .setCapability<string>("se_fanlevel"));