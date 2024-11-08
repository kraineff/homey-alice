import { HomeyConverter } from "../converter";

export default () => HomeyConverter
    .create("light_hue")
    .createColor("hsv", run => run
        .getCapability<number>("light_hue", value => ({ h: Math.round(value * 360), s: 100, v: 100 }))
        .getCapability<number>("light_saturation", value => ({ s: Math.round(value * 100), v: 100 }))
        .getCapability<string>("light_mode", value => value === "color" && "@prev" || "@break")
        .setCapability<number>("light_hue", value => value.h / 360)
        .setCapability<number>("light_saturation", value => value.s / 100)
        .setCapability<string>("light_mode", () => "color"));