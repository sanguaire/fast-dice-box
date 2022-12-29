import {registerSettings} from "./settings.js";
import {initializeToastr, newDiceRoll} from "./notification.js";
import {FastDiceBox} from "./fast-dice-box.js";

let socket;

export const registerHookHandlers = () =>{
    Hooks.once('init',
        async () => {
            console.log('fast-dice-box | Initializing');

            registerSettings();

            // Preload Handlebars templates
            await preloadTemplates();

            CONFIG.ui.fastDiceBox = FastDiceBox;

            initializeToastr();
        });

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

    Hooks.once("socketlib.ready", () => {
        socket = socketlib.registerModule("fast-dice-box");
        socket.register("newDiceRoll", newDiceRoll);
    });
};

async function preloadTemplates() {
    const templatePaths = [
        'modules/fast-dice-box/templates/apps/fast-dice-box.html',
    ];

    return loadTemplates(templatePaths);
}

