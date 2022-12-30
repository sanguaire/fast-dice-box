import {newDiceRoll} from "./notification.js";
import {CONST} from "./CONST.js";

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
        return super.getData(options);
    }

    async render(force = false, options = {}) {
        if (!this.rendered) await super._render(force, options);

        const color = await game.settings.get(CONST.MODULE_NAME, "diceColor");
        const top = await game.settings.get(CONST.MODULE_NAME, "top");
        const left = await game.settings.get(CONST.MODULE_NAME, "left");
        const directionColumn = await game.settings.get(CONST.MODULE_NAME, "columnDirection");

        this._element.get(0).style.setProperty("--dice-color", color);
        this._element.get(0).style.setProperty("top", top + "px");
        this._element.get(0).style.setProperty("left", left + "px");

        this._element.get(0).classList.add(directionColumn ? "column" : "row");
        this._element.get(0).classList.remove(directionColumn ? "row" : "column");

        return this;
    }

    activateListeners(html) {
        html.find(".collapsible").mousedown(this.onCollapse);
        html.find(".roll").mousedown(this.onFastRoll);

        this.dragElement(html.get(0), html.find("#drag").get(0));
    }

    async onCollapse(ev) {
        const btn =  ev.target;
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

        if(/^\d/.test(target.dataset.roll)) noOfDice = '';

        const formula = modifier === 0
            ? `${noOfDice}${target.dataset.roll}`
            : modifier < 0
                ? `${noOfDice}${target.dataset.roll}-${Math.abs(modifier)}`
                : `${noOfDice}${target.dataset.roll}+${modifier}`

        const roll = await new Roll(formula).roll({async: true});

        const message = await roll.toMessage({
            speaker: {actor: character},
            rollMode: game.settings.get("core", "rollMode")
        });

        await game["fast-dice-box"].socket.executeForEveryone("newDiceRoll", message);
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
}


