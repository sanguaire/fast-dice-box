import {CONST} from "./CONST.js";
import {DiceConfig} from "./dice-config.js";
import {debounce} from "./utils.js";

export const registerSettings = () => {
    game.settings.register(CONST.MODULE_NAME, "diceColor", {
        name: game.i18n.localize("fdb.dice-color"),
        hint: game.i18n.localize("fdb.dice-color-hint"),
        scope: "client",
        type: String,
        default: "#ff0000",
        config: true,
        onChange: async () => debounce(await ui.fastDiceBox.render(true), 100)
    });

    game.settings.register(CONST.MODULE_NAME, "notification", {
        name: game.i18n.localize("fdb.notification"),
        hint: game.i18n.localize("fdb.notification-hint"),
        scope: "client",
        type: Boolean,
        default: true,
        config: true
    });

    game.settings.register(CONST.MODULE_NAME, "top", {
        name: game.i18n.localize("fdb.top"),
        scope: "client",
        type: Number,
        default: 100,
        config: true,
    });

    game.settings.register(CONST.MODULE_NAME, "left", {
        name: game.i18n.localize("fdb.left"),
        scope: "client",
        type: Number,
        default: 100,
        config: true,
    });

    game.settings.register(CONST.MODULE_NAME, "columnDirection", {
        name: game.i18n.localize("fdb.column-direction"),
        hint: game.i18n.localize("fdb.column-direction-hint"),
        scope: "client",
        type: Boolean,
        default: true,
        config: true,
        onChange: async () => debounce(await ui.fastDiceBox.render(true), 100)
    });

    game.settings.register(CONST.MODULE_NAME, "dice-configuration", {
        name: "dice-configuration",
        scope: "world",
        type: Object,
        default: CONST.DEFAULT_DICE,
        config: false,
        onChange: async () => debounce(await ui.fastDiceBox.render(true), 100)
    });

    game.settings.registerMenu(CONST.MODULE_NAME, "dice-configuration-menu", {
        name: "My Settings Submenu",
        label: "Settings Menu Label",
        hint: "A description of what will occur in the submenu dialog.",
        icon: "fas fa-bars",
       type: DiceConfig,
       restricted: true
    });
}