import {registerSettings} from "./settings.js";
import {initializeToastr, newDiceRoll} from "./notification.js";
import {FastDiceBox} from "./fast-dice-box.js";
import {CONST} from "./CONST.js";

let socket;

export const registerHookHandlers = () =>{
    Hooks.once('init',
        async () => {
            console.log(`${CONST.MODULE_NAME} | Initializing`);

            registerSettings();

            // Preload Handlebars templates
            await preloadTemplates();

            CONFIG.ui.fastDiceBox = FastDiceBox;

            initializeToastr();

            libWrapper.register(CONST.MODULE_NAME, "game.settings.set", async (wrapped, ...args) => {
                const result = await wrapped(...args)

                Hooks.call(`${args[0]}-${args[1]}-changed`, args[2]);

                return result;
            }, "MIXED")

        });

    Hooks.once('ready', async () => {
        if(!game.settings.get(CONST.MODULE_NAME, "renderDiceBox")) {
            return;
        }
       await ui.fastDiceBox.render(true);
       Hooks.on("core-rollMode-changed", ui.fastDiceBox["rollModeChanged"].bind(ui.fastDiceBox))
    });

    Hooks.on("renderSettingsConfig", (app, html) => {
        let name, colour;
        name = `${CONST.MODULE_NAME}.diceColor`;
        colour = game.settings.get("fast-dice-box", "diceColor");
        $("<input>")
            .attr("type", "color")
            .attr("data-edit", name)
            .val(colour)
            .insertAfter($(`input[name="${name}"]`, html).addClass("color"));
    });

    Hooks.once("socketlib.ready", () => {
        socket = socketlib.registerModule(CONST.MODULE_NAME);
        socket.register("newDiceRoll", newDiceRoll);

        game[CONST.MODULE_NAME] = {
            socket: socket
        }

    });
};

async function preloadTemplates() {
    const templatePaths = [
        `modules/${CONST.MODULE_NAME}/templates/apps/fast-dice-box.html`,
        `modules/${CONST.MODULE_NAME}/templates/apps/dice-configuration.html`,
    ];

    return loadTemplates(templatePaths);
}



