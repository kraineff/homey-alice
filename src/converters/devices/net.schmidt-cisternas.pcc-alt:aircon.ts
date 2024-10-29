import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("net.schmidt-cisternas.pcc-alt:aircon")
    .createMode("fan_speed", run => run
        .setParams({ modes: ["auto", "low", "medium", "high"] })
        .getHomey<string>("fan_speed", value => (({ Auto: "auto", Low: "low", Mid: "medium", High: "high" } as any)[value]) ?? "@break")
        .setHomey<string>("fan_speed", value => ({ auto: "Auto", low: "Low", medium: "Mid", high: "High" }[value])!))
    .createMode("program", run => run
        .setParams({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
        .getHomey<string>("operation_mode", value => (({ Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" } as any)[value]) ?? "@break")
        .setHomey<string>("operation_mode", value => ({ auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" }[value])!));