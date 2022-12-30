import {CONST} from "./CONST.js";

export const registerSettings = () => {
    game.settings.register(CONST.MODULE_NAME, "diceColor", {
        name: game.i18n.localize("fdb.dice-color"),
        hint: game.i18n.localize("fdb.dice-color-hint"),
        scope: "client",
        type: String,
        default: "#ff0000",
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
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
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    game.settings.register(CONST.MODULE_NAME, "left", {
        name: game.i18n.localize("fdb.left"),
        scope: "client",
        type: Number,
        default: 100,
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    game.settings.register(CONST.MODULE_NAME, "columnDirection", {
        name: game.i18n.localize("fdb.column-direction"),
        hint: game.i18n.localize("fdb.column-direction-hint"),
        scope: "client",
        type: Boolean,
        default: true,
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });
}