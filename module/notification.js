import {CONST} from "./CONST.js";

export const newDiceRoll = async (rollMessage) => {
    if(game.settings.get(CONST.MODULE_NAME, "notification")) {
        const html = await rollMessage.getHTML();

        html.find(".dice-tooltip").get(0).classList.add("expanded");

        toastr.info(`${html[0].innerHTML}`);
    }
};

export const initializeToastr = () => {
    toastr.options.closeMethod = "slideUp";
    toastr.options.closeDuration = 300;
    toastr.options.timeOut = 8000;
    toastr.options.extendedTimeOut = 13000;
    toastr.options.closeEasing = 'swing'
    toastr.options.newestOnTop = true;
    toastr.options.positionClass = "toast-top-right";
    toastr.options.escapeHtml = false;
    toastr.options.target = "#ui-middle";
    toastr.options.showMethod = "slideDown";
    toastr.options.hideMethod = "fadeOut"

};
