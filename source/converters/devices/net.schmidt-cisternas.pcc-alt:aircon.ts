import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("net.schmidt-cisternas.pcc-alt:aircon")
    .createMode("fan_speed", run => run
        .onGetParameters({ modes: ["auto", "low", "medium", "high"] })
        .onGetCapability<string>("fan_speed", value => (({ Auto: "auto", Low: "low", Mid: "medium", High: "high" } as any)[value]) ?? "@break")
        .onSetCapability<string>("fan_speed", value => ({ auto: "Auto", low: "Low", medium: "Mid", high: "High" }[value])!))
    .createMode("program", run => run
        .onGetParameters({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
        .onGetCapability<string>("operation_mode", value => (({ Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" } as any)[value]) ?? "@break")
        .onSetCapability<string>("operation_mode", value => ({ auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" }[value])!));