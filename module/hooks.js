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
        });

    Hooks.once('ready', async () => {
       await ui.fastDiceBox.render(true);
    });


    Hooks.on("renderSettingsConfig", (app, html, data) => {
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

Hooks.once('diceSoNiceReady', () => {
    Hooks.on('diceSoNiceRollComplete', (messageId) => {
        console.log(`fast-dice-box: ${messageId}`);
        if (ui.fastDiceBox.msgIds[messageId]) {
            socket.executeForEveryone("newDiceRoll", ui.fastDiceBox.msgIds[messageId]);
            delete ui.fastDiceBox.msgIds[messageId];
        }
    });
});

