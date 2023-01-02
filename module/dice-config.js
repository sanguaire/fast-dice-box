import {CONST} from "./CONST.js";

export class DiceConfig extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 500,
            height: 600,
            id: "fdb-dice-config",
            template: `modules/${CONST.MODULE_NAME}/templates/apps/dice-configuration.html`,
            popOut: true
        });
    }

    async getData() {
        return await game.settings.get(CONST.MODULE_NAME,"dice-configuration");
    }
}