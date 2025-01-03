import { HomeyConverter } from "../converter";

export default HomeyConverter
    .create("light_hue")
    .createColor("hsv", run => run
        .onGetCapability<number>("light_hue", value => ({ h: Math.round(value * 360), s: 100, v: 100 }))
        .onGetCapability<number>("light_saturation", value => ({ s: Math.round(value * 100), v: 100 }))
        .onGetCapability<string>("light_mode", value => value === "color" && "@prev" || "@break")
        .onSetCapability<number>("light_hue", value => value.h / 360)
        .onSetCapability<number>("light_saturation", value => value.s / 100)
        .onSetCapability<string>("light_mode", () => "color"));