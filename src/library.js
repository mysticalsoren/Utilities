class MysticalSorenUtilities {
    static #Private = {
        Debugger: this.Debugger("MysticalSorenUtilities")
    }
    // #region Debugger
    /**
     * @typedef {Object} Debugger
     * @property {String} namespace dasd
     * @property {String} separator
     * @property {boolean} enabled
     * @property {(...any) => void} log
     */
    /**
     * A class for everything related to troubleshooting and logging.
     * @param {String} namespace 
     * @param {String} separator 
     * @returns {Debugger} Debugger. A class.
     */
    static Debugger(namespace = "", separator = " ") {
        return {
            namespace: namespace,
            separator: separator,
            enabled: true,
            log(...values) {
                if (!this.enabled) {
                    return
                }
                let apex = typeof namespace === "string" ? `${namespace}:` : "UnnamedDebugger:"
                const composeString = (value) => {
                    let result = ""
                    if (MysticalSorenUtilities.hasItems(value)) {
                        result += "["
                        value.forEach(item => {
                            result += `${composeString(item)},`
                        });
                        result = result.substring(0, result.length - 1) + "]"
                        return result
                    }
                    if (MysticalSorenUtilities.hasKeys(value)) {
                        result += "{"
                        for (const [k, v] of value.entries()) {
                            result += `${k}: ${composeString(v)},`
                        }
                        result = result.substring(0, result.length - 1) + "}"
                        return result
                    }
                    return `${value}`
                }
                for (const value of values) {
                    apex += separator + composeString(value)
                }
                console.log(apex)
            }
        }
    }
    //  #endregion
    /*
    static TOML = {
        composeObject(jsObject = {}) {
            let tomlResult = ""
            if (!MysticalSorenUtilities.hasKeys(jsObject)) {
                if (MysticalSorenUtilities.isPlainObject(jsObject)) {
                    MysticalSorenUtilities.#Private.debug("TOML Warning: Empty Object.")
                    return {}
                }
                return tomlResult
            }
            for (const [key, value] of Object.entries(jsObject)) {
                if (MysticalSorenUtilities.isPlainObject(value)) {
                    tomlResult += `[${key}]`
                    this.composeObject(value)
                    continue
                } else if (typeof value === "string") {
                    tomlResult += `${key} = "${value}"`
                    continue
                } else if (typeof value === "number" || typeof value === "boolean") {
                    tomlResult += `${key} = ${value}`
                    continue
                }
            }
        }
    }
    */
    static getTurnOrder() {
        return info.actionCount || 0;
    }
    static hasItems(arr) {
        return Array.isArray(arr) && arr.length > 0
    }
    static isPlainObject(obj) {
        return obj && obj.constructor === Object
    }
    static hasKeys(obj) {
        return this.isPlainObject(obj) && Object.keys(obj).length > 0
    }
    static randomItem(arr) {
        if (!this.hasItems(arr)) {
            this.#Private.Debugger.log("Could not get random item from array.")
        }
        return arr[Math.floor(Math.random() * arr.length)]
    }
    static getRecentAction(context) {
        if (!this.hasItems(history)) {
            this.#Private.Debugger.log("Could not get recent action. There are no actions.")
            return {}
        }
        if (typeof context != "string") {
            this.#Private.Debugger.log("Could not get recent action. context is not a string.")
            return {}
        }
        if (context.toLowerCase() in ["context", "output"]) {
            this.#Private.Debugger.log("Could not get recent action. It isn't ran in the Context Hook!")
            if (context.toLowerCase() === "input") {
                this.#Private.Debugger.log('Use "text" instead to get the recent action!')
                return {}
            }
            return {}
        }
        return history[history.length - 1]
    }
    /**
     * Gets the storyCards index given an storycard.id
     * @param {number | String} id storycard.id
     * @returns {number} number. If not found, returns -1.
     */
    static getStoryCardIndexById(id) {
        if (typeof id in ["number", "string"]) {
            this.#Private.Debugger.log("Could not get story card by id. id is not a number!")
            return -1
        }
        id = String(id)
        for (const [index, storyCard] of storyCards.entries()) {
            if (storyCard.id === id) {
                return index
            }
        }
        this.#Private.Debugger.log(`Could not get story card by id with the search id of "${id}"`)
        return -1
    }
    static getStoryCardIdsByName(name) {
        const result = []
        if (typeof name !== "string") {
            this.#Private.Debugger.log("Could not get story card id by name. name is not a number!")
            return result
        }
        for (const storyCard of storyCards) {
            if (storyCard.title === name) {
                result.push(storyCard.id)
            }
        }
        return result
    }
    static getStoryCardsByIds(ids) {
        const result = []
        if (!this.hasItems(ids)) {
            this.#Private.Debugger.log("Could not get story cards. There are no ids to go through.")
            return result
        }
        for (const id of ids) {
            const idx = this.getStoryCardIndexById(id)
            if (idx < 0) {
                continue
            }
            result.push(storyCards[idx])
        }
        return result
    }
    static getStoryCardsByNames(names) {
        const result = new Set()
        if (!this.hasItems(names)) {
            this.#Private.Debugger.log("Could not get story cards. There are no names to go through.")
            return Array.from(result)
        }
        for (const name of names) {
            const ids = this.getStoryCardIdsByName(name)
            const _storyCards = this.getStoryCardsByIds(ids)
            for (const storyCard of _storyCards) {
                result.add(storyCard)
            }
        }
        return Array.from(result)
    }
    static getStoryCardsAsMap(_storyCards) {
        let __storyCards = _storyCards
        if (!this.hasItems(_storyCards)) {
            this.#Private.Debugger.log("Given storyCards has no items. Defaulting to global storyCards")
            __storyCards = storyCards
        }
        const result = new Map()
        for (const storyCard of __storyCards) {
            result.set(storyCard.id, storyCard)
        }
        return result

    }
    static setState(stateName, stateObject) {
        state[stateName] = stateObject
    }
    static getState(stateName, alternative = {}) {
        return state[stateName] || alternative
    }
    static removeState(stateName) {
        state[stateName] = undefined
    }
    static addStoryCard(title = "", entry = "", description = "", type = "class", keys = "") {
        const card = storyCards[addStoryCard(keys, entry, type) - 1]
        card.title = title
        card.description = description
        return card
    }
    static addStoryCardConfig(namespace = "", type = "class", description = "") {
        const card = this.addStoryCard(namespace, JSON.stringify(this.getState(namespace), (_, value) => { return value }, 1), description, type)
        return card
    }
}