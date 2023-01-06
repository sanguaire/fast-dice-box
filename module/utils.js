export function debounce(callback, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(this, args)
        }, delay);
    }
}

export async function sendMessage({message, rollMode}) {
    const socket = game["fast-dice-box"].socket;

    if (rollMode === "publicroll") {
        await socket.executeForEveryone("newDiceRoll", message);
    }

    if (rollMode === "gmroll") {
        const gmUids = game.users.filter(u => u.isGM && u.id !== game.userId).map(u => u.id);
        await socket.executeForUsers("newDiceRoll", [game.userId, ...gmUids], message)
    }

    if (rollMode === "blindroll") {
        await socket.executeForAllGMs("newDiceRoll", message);
    }

    if (rollMode === "selfroll") {
        await socket.executeForUsers("newDiceRoll", [game.userId], message)
    }
}
