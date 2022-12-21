async function preloadTemplates() {
    const templatePaths = [
        'modules/fast-dice-box/templates/apps/fast-dice-box.html',
    ];

    return loadTemplates(templatePaths);
}

class FastDiceBox extends Application {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 100,
            left: 50,
            id: "fast-dice-box",
            template: "modules/fast-dice-box/templates/apps/fast-dice-box.html",
            popOut: false
        });
    }

    _injectHTML(html) {
        $("#ui-top")
            .after(html);
        this._element = html;
        html.hide().fadeIn(200);
    }

    getData(options = {}) {
        return super.getData(options);
    }

    async render(force = false, options = {}) {
        if (!this.rendered) await super._render(force, options);

        const color = game.settings.get("fast-dice-box", "diceColor");

        this._element.get(0).style.setProperty("--dice-color", color);

    }

    activateListeners(html) {
        html.find(".roll").mousedown(this.onFastRoll);

    }

    async onFastRoll(ev) {
        const target = ev.currentTarget;
        const character = game.user.character;
        let modifier = 0;
        let noOfDice = 1;

        if (ev.button === 2) {
            const result = await Dialog.prompt({
                title: "Modifier?",
                content: `<form>
                    <label for="no-of-dice">${game.i18n.localize("fdb.no-of-dice")}</label>
                    <div class="quantity"><input id="no-of-dice" value="1" min="1" step="1" type="number" /></div>
                    <label for="mod">${game.i18n.localize("fdb.modifier")}</label>
                    <div class="quantity"><input id="mod" value="0" step="1" type="number" autofocus/></div>
                 </form>`,
                callback: async (html) => {
                    const mod = html.find("input#mod").val();
                    const noOfDice = html.find("input#no-of-dice").val();
                    return {mod, noOfDice}
                },
                rejectClose: false,
                options: {
                    classes: ["fast-dice-box"]
                }
            });

            if (!result) return;

            modifier = result.mod;
            noOfDice = result.noOfDice;
        }

        const formula = modifier === 0
            ? `${noOfDice}${target.dataset.roll}`
            : modifier < 0
                ? `${noOfDice}${target.dataset.roll}-${Math.abs(modifier)}`
                : `${noOfDice}${target.dataset.roll}+${modifier}`

        await new Roll(formula).toMessage({
            speaker: {actor: character},
            rollMode: game.settings.get("core", "rollMode")
        });
    }
}

// Initialize module
Hooks.once('init', async () => {
    console.log('fast-dice-box | Initializing');

    game.settings.register("fast-dice-box", "diceColor", {
        name: game.i18n.localize("fdb.dice-color"),
        hint: game.i18n.localize("fdb.dice-color-hint"),
        scope: "user",
        type: String,
        default: "#ff0000",
        config: true,
        onChange: async () => await ui.fastDiceBox.render(true)
    });

    // Preload Handlebars templates
    await preloadTemplates();

    // Register custom sheets (if any)
    CONFIG.ui.fastDiceBox = FastDiceBox;
});

// When ready
Hooks.once('ready', async () => {
    await ui.fastDiceBox.render(true);
});

Hooks.on("renderSettingsConfig", (app, html, data) => {
    let name, colour;
    name = `fast-dice-box.diceColor`;
    colour = game.settings.get("fast-dice-box", "diceColor");
    $("<input>")
        .attr("type", "color")
        .attr("data-edit", name)
        .val(colour)
        .insertAfter($(`input[name="${name}"]`, html).addClass("color"));
});
