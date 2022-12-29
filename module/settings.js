export const registerSettings = () => {
    game.settings.register("fast-dice-box", "diceColor", {
        name: game.i18n.localize("fdb.dice-color"),
        hint: game.i18n.localize("fdb.dice-color-hint"),
        scope: "client",
        type: String,
        default: "#ff0000",
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    game.settings.register("fast-dice-box", "notification", {
        name: game.i18n.localize("fdb.notification"),
        hint: game.i18n.localize("fdb.notification-hint"),
        scope: "client",
        type: Boolean,
        default: true,
        config: true
    });

    game.settings.register("fast-dice-box", "top", {
        name: game.i18n.localize("fdb.top"),
        scope: "client",
        type: Number,
        default: 100,
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    game.settings.register("fast-dice-box", "left", {
        name: game.i18n.localize("fdb.left"),
        scope: "client",
        type: Number,
        default: 100,
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    game.settings.register("fast-dice-box", "columnDirection", {
        name: game.i18n.localize("fdb.column-direction"),
        hint: game.i18n.localize("fdb.column-direction-hint"),
        scope: "client",
        type: Boolean,
        default: true,
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });
}