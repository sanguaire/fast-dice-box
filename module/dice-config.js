import {CONST} from "./CONST.js";

export class DiceConfig extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 700,
            height: 500,
            classes: ["config-menu"],
            id: "fdb-dice-config",
            template: `modules/${CONST.MODULE_NAME}/templates/apps/dice-configuration.html`,
            popOut: true,
            resizable: true,
            closeOnSubmit: true
        });
    }

    activateListeners(html) {
        html.find(".img-path").change(function (ev) {
            ev.target.previousElementSibling.src = ev.target.value;
        });

        return super.activateListeners(html);
    }

    getData(options) {
        const diceSettings = game.settings.get(CONST.MODULE_NAME, "dice-configuration");
        const diceConfig = [];

        for (const [key, value] of Object.entries(diceSettings)) {
            value.slot = key;
            if (value.localization !== "") {
                value.label = game.i18n.localize(value.localization);
            }

            diceConfig.push(value)
        }

        return foundry.utils.mergeObject(options,
            {
                diceConfig: diceConfig
            });
    }

    async _updateObject(event, formData) {
        let configObject = {};

        for (let idx = 0; idx < 11; idx++) {
            configObject[idx + 1] = {
                active: formData.active[idx],
                label: formData.label[idx],
                localization: formData.localization[idx],
                img: formData["img." + (idx + 1)],
                formula: formData.formula[idx]
            }
        }

        await game.settings.set(CONST.MODULE_NAME, "dice-configuration", configObject);
    }
}
