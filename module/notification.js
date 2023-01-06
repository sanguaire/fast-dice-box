import {CONST} from "./CONST.js";

export const newDiceRoll = async (rollMessage) => {
    if(game.settings.get(CONST.MODULE_NAME, "notification")) {
        if(!game.user.isGM && rollMessage.blind) {
            return;
        }

        const html = await rollMessage.getHTML();
        html.find(".dice-tooltip").addClass("expanded");
        html.find("img.chat-portrait-message-portrait-generic")?.css("display", "none");
        toastr.info(`${html[0].innerHTML}`);
    }
};

export const initializeToastr = () => {
    toastr.options.closeMethod = 'fadeOut';
    toastr.options.closeDuration = 300;
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 10000;
    toastr.options.closeEasing = 'swing'
    toastr.options.newestOnTop = true;
    toastr.options.positionClass = "toast-top-right";
    toastr.options.escapeHtml = false;
    toastr.options.target = "#ui-middle";

};
