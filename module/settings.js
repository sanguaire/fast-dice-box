export const initializeSettings = () => {
    game.settings.register("fast-dice-box", "diceColor", {
        name: game.i18n.localize("fdb.dice-color"),
        hint: game.i18n.localize("fdb.dice-color-hint"),
        scope: "user",
        type: String,
        default: "#ff0000",
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    game.settings.register("fast-dice-box", "notification", {
        name: game.i18n.localize("fdb.notification"),
        hint: game.i18n.localize("fdb.notification-hint"),
        scope: "user",
        type: Boolean,
        default: true,
        config: true
    });

    game.settings.register("fast-dice-box", "notification-auto-fade-out", {
        name: game.i18n.localize("fdb.notification-auto-fade-out"),
        hint: '',
        scope: "user",
        type: Boolean,
        default: true,
        config: true
    })

    game.settings.register("fast-dice-box", "notification-fade-out-timeout", {
        name: game.i18n.localize("fdb.notification-fade-out-timeout"),
        hint: '',
        scope: "user",
        type: Number,
        default: 5000,
        config: true
    })
}
