import {newDiceRoll} from "./notification.js";
import {CONST} from "./CONST.js";
import {sendMessage} from "./utils.js";

export class FastDiceBox extends Application {

    msgIds = {};

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

        for(const [key, value] of Object.entries(diceSettings)) {
            if(!value.active) {
                continue;
            }

            if(value.localization !== "") {
                value.label = game.i18n.localize(value.localization);
            }
            diceConfig.push(value);
        }


        return foundry.utils.mergeObject(super.getData(options),{diceConfig});
    }

    render(force = false, options = {}) {
        const e = this._element;
        const that = this;
        const f = force;
        const o = options;

        const initElement = function (element) {
            const color =  game.settings.get(CONST.MODULE_NAME, "diceColor");
            const top =  game.settings.get(CONST.MODULE_NAME, "top");
            const left =  game.settings.get(CONST.MODULE_NAME, "left");
            const directionColumn =  game.settings.get(CONST.MODULE_NAME, "columnDirection");
            const iconSize = game.settings.get(CONST.MODULE_NAME, "iconSize");
            const rollMode = that.getRollModeConstantName(game.settings.get("core", "rollMode"));
            const rollModeReversed = game.settings.get(CONST.MODULE_NAME, "rmReversed");


            const fontSize = (iconSize / 48) * 18;

            element.get(0).style.setProperty("--dice-color", color);
            element.get(0).style.setProperty("--fdb-icon-size", iconSize + "px");
            element.get(0).style.setProperty("--fdb-font-size", fontSize + "px");
            element.get(0).style.setProperty("top", top + "px");
            element.get(0).style.setProperty("left", left + "px");

            element.get(0).classList.add(directionColumn ? "column" : "row");
            element.get(0).classList.remove(directionColumn ? "row" : "column");

            element.find(`.roll-mode-content > i`).removeClass("active");
            element.find(`.roll-mode-content > i[data-rm=${rollMode}]`).addClass("active");

            if(rollModeReversed){
                element.addClass("reversed");
            } else {
                element.removeClass("reversed");
            }
        };

        if (!this.rendered) super._render(force, options).then(()=>that.render(f, o));
        else initElement(e);

        return this;
    }

    activateListeners(html) {
        html.find(".collapsible").mousedown(this.onCollapse);
        html.find(".roll").mousedown(this.onFastRoll);

        html.find("#orientation").mousedown(this.onOrientationChange)

        html.find(".roll-mode-content > i").mousedown(this.onChangeRollMode);

        this.dragElement(html.get(0), html.find("#drag").get(0));
    }

    getRollModeConstantName(rm) {
        return Object.entries(CONFIG.Dice.rollModes).find(e => e[1] === rm || e[0] === rm)[0];
    }

    async onChangeRollMode(ev){
        const target = ev.target;
        const rollMode = target.dataset.rm;

        await game.settings.set("core", "rollMode", rollMode);
    };

    async onCollapse(ev) {
        const btn =  ev.currentTarget;
        btn.classList.toggle("active");

        const content = btn.nextElementSibling;

        if (content.style.display === "flex"){
            content.style.display = "none";
        } else {
            content.style.display = "flex";
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

        if(/^\d/.test(target.dataset.roll)) noOfDice = '';

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

    dragElement = (element, dragzone) => {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        //MouseUp occurs when the user releases the mouse button
        const dragMouseUp = async () => {
            document.onmouseup = null;
            //onmousemove attribute fires when the pointer is moving while it is over an element.
            document.onmousemove = null;

            await game.settings.set(CONST.MODULE_NAME, "top", Number.parseInt(element.style.top.replace("px", "")));
            await game.settings.set(CONST.MODULE_NAME, "left", Number.parseInt(element.style.left.replace("px", "")));

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
            element.style.top = `${element.offsetTop - pos2}px`;
            element.style.left = `${element.offsetLeft - pos1}px`;
        };

        const dragMouseDown = (event) => {
            event.preventDefault();

            pos3 = event.clientX;
            pos4 = event.clientY;

            element.classList.add("drag");

            document.onmouseup = dragMouseUp;
            document.onmousemove = dragMouseMove;
        };

        dragzone.onmousedown = dragMouseDown;
    };

    async onOrientationChange() {
        const currentOrientation = game.settings.get(CONST.MODULE_NAME, "columnDirection");

        await game.settings.set(CONST.MODULE_NAME, "columnDirection", !currentOrientation);
    }

    rollModeChanged(newRollMode) {
        this.element.find(`.roll-mode-content > i`).removeClass("active");
        this.element.find(`.roll-mode-content > i[data-rm=${this.getRollModeConstantName(newRollMode)}]`).addClass("active");
    }
}


