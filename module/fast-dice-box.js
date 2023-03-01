import {CONST} from "./CONST.js";
import {sendMessage} from "./utils.js";

export class FastDiceBox extends Application {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            left: 0,
            top: 0,
            id: CONST.MODULE_NAME,
            template: `modules/${CONST.MODULE_NAME}/templates/apps/fast-dice-box.html`,
            popOut: false
        });
    }

    async _injectHTML(html) {
        $("#interface")
            .after(html);

        this._element = html;

        html.hide().fadeIn(200);
    }

    getData(options = {}) {
        const diceSettings = game.settings.get(CONST.MODULE_NAME, "dice-configuration");
        const diceConfig = [];

        for (const [, value] of Object.entries(diceSettings)) {
            if (!value.active) {
                continue;
            }

            if (value.localization !== "") {
                value.label = game.i18n.localize(value.localization);
            }
            diceConfig.push(value);
        }

        return foundry.utils.mergeObject(super.getData(options), {diceConfig});
    }

    render(force = false, options = {}) {
        const e = this._element;
        const that = this;
        const f = force;
        const o = options;

        const initElement = function (element) {
            const color = game.settings.get(CONST.MODULE_NAME, "diceColor");
            const reversed = game.settings.get(CONST.MODULE_NAME, "reversed");
            const top = game.settings.get(CONST.MODULE_NAME, "top");
            const left = game.settings.get(CONST.MODULE_NAME, "left");
            const directionColumn = game.settings.get(CONST.MODULE_NAME, "columnDirection");
            const iconSize = game.settings.get(CONST.MODULE_NAME, "iconSize");
            const rollMode = that.getRollModeConstantName(game.settings.get("core", "rollMode"));
            const rollModeReversed = game.settings.get(CONST.MODULE_NAME, "rmReversed");
            const noRollMode = game.settings.get(CONST.MODULE_NAME, "noRollMode");

            const fontSize = (iconSize / 48) * 18;

            element.get(0).style.setProperty("--fdb-dice-color", color);
            element.get(0).style.setProperty("--fdb-icon-size", iconSize + "px");
            element.get(0).style.setProperty("--fdb-font-size", fontSize + "px");

            element.get(0).style.setProperty("top", top + "px");
            element.get(0).style.setProperty("left", left + "px");

            if (noRollMode) {
                element.get(0).classList.add("no-roll-modes");
            }
            if (reversed) {
                element.get(0).classList.add("reversed");
            }
            element.get(0).classList.add(directionColumn ? "column" : "row");
            element.get(0).classList.remove(directionColumn ? "row" : "column");

            element.find(".roll-mode-content > i").removeClass();
            element.find(".roll-mode-content > i").addClass("fa-solid");

            if (!directionColumn) {
                if (rollModeReversed) {
                    element.find(".roll-mode-content > i").addClass("fa-arrow-down");

                } else {
                    element.find(".roll-mode-content > i").addClass("fa-arrow-up");
                }
            } else {
                if (rollModeReversed) {
                    element.find(".roll-mode-content > i").addClass("fa-arrow-right");

                } else {
                    element.find(".roll-mode-content > i").addClass("fa-arrow-left");
                }
            }

            element.find(`.roll-modes > i`).removeClass("active");
            element.find(`.roll-modes > i[data-rm=${rollMode}]`).addClass("active");

            if (rollModeReversed) {
                element.addClass("rm-reversed");
            } else {
                element.removeClass("rm-reversed");
            }
        };

        if (!this.rendered) super._render(force, options).then(() => that.render(f, o));
        else initElement(e);

        return this;
    }

    activateListeners(html) {
        html.find(".collapsible").mousedown(this.onCollapse);
        html.find(".roll").mousedown(this.onFastRoll);

        html.find("#orientation").mousedown(this.onOrientationChange)

        html.find(".roll-mode-content > i").mousedown(this.onChangeRollModePosition)
        html.find(".roll-modes > i").mousedown(this.onChangeRollMode);

        this.dragElement(html.get(0), html.find("#drag").get(0));
    }

    getRollModeConstantName(rm) {
        return Object.entries(CONFIG.Dice.rollModes).find(e => e[1] === rm || e[0] === rm)[0];
    }

    async onChangeRollMode(ev) {
        const target = ev.target;
        const rollMode = target.dataset.rm;

        await game.settings.set("core", "rollMode", rollMode);
    };

    async onCollapse(ev) {
        const btn = $(ev.currentTarget);
        const fdb = $("#fast-dice-box");
        btn.toggleClass("active");

        const reversed = game.settings.get(CONST.MODULE_NAME, "reversed");
        const directionColumn = game.settings.get(CONST.MODULE_NAME, "columnDirection");
        const top = game.settings.get(CONST.MODULE_NAME, "top");
        const left = game.settings.get(CONST.MODULE_NAME, "left");

        const content = btn.next();

        if(btn.hasClass("active")){
            content.css("display", "flex");

            if(reversed) {
                if(directionColumn) {
                    fdb.css("top", (top - content.outerHeight()) + "px");
                    fdb.css("left", left + "px");
                } else {
                    fdb.css("top", top + "px");
                    fdb.css("left", (left - content.outerWidth()) + "px");
                }
            }
        } else
        {
            content.css("display", "none");
            fdb.css("top", top + "px");
            fdb.css("left", left + "px");
        }
    }

    async onFastRoll(ev) {
        const target = ev.currentTarget;
        const character = game.user.character;
        const rollMode = game.settings.get("core", "rollMode");
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

            modifier = Number.parseInt(result.mod);
            noOfDice = Number.parseInt(result.noOfDice);
        }

        if (/^[^d]/.test(target.dataset.roll)) noOfDice = '';

        const formula = modifier === 0
            ? `${noOfDice}${target.dataset.roll}`
            : modifier < 0
                ? `${noOfDice}${target.dataset.roll}-${Math.abs(modifier)}`
                : `${noOfDice}${target.dataset.roll}+${modifier}`

        const roll = await new Roll(formula).roll({async: true});

        const message = await roll.toMessage({
            speaker: {actor: character},
            rollMode
        });

        await sendMessage({message, rollMode});

    }

    dragElement = (element, dragZone) => {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;

        //MouseUp occurs when the user releases the mouse button
        const dragMouseUp = async () => {
            document.onmouseup = null;
            //onmousemove attribute fires when the pointer is moving while it is over an element.
            document.onmousemove = null;

            const coords = this.getCoords(element);

            await game.settings.set(CONST.MODULE_NAME, "top", coords.top);
            await game.settings.set(CONST.MODULE_NAME, "left", coords.left);

            element.classList.remove("drag");
        };

        const dragMouseMove = (event) => {

            event.preventDefault();

            //clientX property returns the horizontal coordinate of the mouse pointer
            pos1 = pos3 - event.clientX;
            //clientY property returns the vertical coordinate of the mouse pointer
            pos2 = pos4 - event.clientY;

            pos3 = event.clientX;
            pos4 = event.clientY;

            //offsetTop property returns the top position relative to the parent

            const coords = this.getCoords(element);

            element.style.top = `${coords.top - pos2}px`;
            element.style.left = `${coords.left - pos1}px`;

        };

        dragZone.onmousedown = (event) => {
            event.preventDefault();

            pos3 = event.clientX;
            pos4 = event.clientY;

            element.classList.add("drag");

            document.onmouseup = dragMouseUp;
            document.onmousemove = dragMouseMove;
        };

    };

    getCoords(elem) {
        let box = elem.getBoundingClientRect();

        return {
            top: box.top + window.scrollY,
            right: box.right + window.scrollX,
            bottom: box.bottom + window.scrollY,
            left: box.left + window.scrollX
        };
    }

    async onOrientationChange() {
        const currentOrientation = game.settings.get(CONST.MODULE_NAME, "columnDirection");

        await game.settings.set(CONST.MODULE_NAME, "columnDirection", !currentOrientation);
    }

    rollModeChanged(newRollMode) {
        this.element.find(`.roll-modes > i`).removeClass("active");
        this.element.find(`.roll-modes > i[data-rm=${this.getRollModeConstantName(newRollMode)}]`).addClass("active");
    }

    async onChangeRollModePosition() {
        await game.settings.set(CONST.MODULE_NAME, "rmReversed", !game.settings.get(CONST.MODULE_NAME, "rmReversed"));
    }
}


