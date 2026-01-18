class MysticalSorenUtilities {
    static #Private = {
        Debugger: this.Debugger("MysticalSorenUtilities")
    }
    // #region Debugger
    /**
     * @typedef {Object} Debugger
     * @property {String} namespace
     * @property {String} separator
     * @property {boolean} enabled
     * @property {(...any) => void} log
     */
    /**
     * A class for everything related to troubleshooting and logging.
     * @param {String} namespace  Default value: "UnnamedDebugger"
     * @param {String} separator Default value: " "
     * @returns {Debugger} Debugger. A class.
     */
    static Debugger(namespace = "", separator = " ") {
        return {
            namespace: typeof namespace === "string" ? namespace : "UnnamedDebugger",
            separator: separator,
            enabled: true,
            log(...values) {
                if (!this.enabled) {
                    return
                }
                let apex = namespace + ":"
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
                        for (const [k, v] of Object.entries(value)) {
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
    // #region AIDungeon
    static AIDungeon = {
        /**
         * @typedef {Object} HistoryEntry
         * @property {String} text
         * @property {String} rawText deprecated, use text.
         * @property {"start" | "continue" | "do" | "say" | "story" | "see"} type
         */
        /**
         * @typedef {Object} StoryCard
         * @property {String} id
         * @property {String} createdAt
         * @property {String} updatedAt
         * @property {String} keys also known as Triggers
         * @property {String} entry
         * @property {String} type
         * @property {String} title
         * @property {String} description also known as Notes
         * @property {boolean} useForCharacterCreation
         */
        /**
         * Gets the current turn order.
         * @returns {number} number. The current turn order
         */
        getTurnOrder() {
            return info.actionCount || 0
        },
        /**
         * Returns the latest action taken by the player.
         * @param {"input" | "context" | "output"} context the current context it is running on
         * @returns {HistoryEntry | {}} HistoryEntry. On fail, it returns a empty object.
         */
        getRecentAction(context) {
            if (!MysticalSorenUtilities.hasItems(history)) {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get recent action. There are no actions.")
                return {}
            }
            if (typeof context != "string") {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get recent action. context is not a string.")
                return {}
            }
            if (context.toLowerCase() in ["context", "output"]) {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get recent action. It isn't ran in the Context Hook!")
                if (context.toLowerCase() === "input") {
                    MysticalSorenUtilities.#Private.Debugger.log('Use "text" instead to get the recent action!')
                    return {}
                }
                return {}
            }
            return history[history.length - 1]
        },
        /**
         * Gets the storyCards index given an storycard.id
         * @param {number | String} id storycard.id
         * @returns {number} number. If not found, returns -1.
         */
        getStoryCardIndexById(id) {
            if (typeof id in ["number", "string"]) {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get story card by id. id is not a number!")
                return -1
            }
            id = String(id)
            for (const [index, storyCard] of storyCards.entries()) {
                if (storyCard.id === id) {
                    return index
                }
            }
            MysticalSorenUtilities.#Private.Debugger.log(`Could not get story card by id with the search id of "${id}"`)
            return -1
        },
        /**
         * Gets StoryCards given a list of storycard.id
         * @param {String[] | number[]} ids a list of storycard.id
         * @returns {StoryCard[]} A array of StoryCards
         */
        getStoryCardsByIds(ids) {
            const result = []
            if (!MysticalSorenUtilities.hasItems(ids)) {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get story cards. There are no ids to go through.")
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
        },
        /**
         * Gets a list of storycard ids matching the name given.
         * @param {String} name storycard.title
         * @returns {String[]} An array of storycard.id, if any.
         */
        getStoryCardIdsByName(name) {
            const result = []
            if (typeof name !== "string") {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get story card id by name. name is not a number!")
                return result
            }
            for (const storyCard of storyCards) {
                if (storyCard.title === name) {
                    result.push(storyCard.id)
                }
            }
            return result
        },
        /**
         * Gets StoryCards matching the name(s) given.
         * @param {String[]} names a Array of storycard.title
         * @returns {StoryCard[]}
         */
        getStoryCardsByNames(names) {
            const result = new Set()
            if (!MysticalSorenUtilities.hasItems(names)) {
                MysticalSorenUtilities.#Private.Debugger.log("Could not get story cards. There are no names to go through.")
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
        },
        /**
         * Converts a array of StoryCards into a Map with the storycard.id
         * being the key to the StoryCard
         * @param {StoryCard[]} _storyCards An array of StoryCards
         * @returns {Map<string,StoryCard>} an map of storycard.id keys to StoryCard values
         */
        getStoryCardsAsMap(_storyCards) {
            let __storyCards = _storyCards
            if (!MysticalSorenUtilities.hasItems(_storyCards)) {
                MysticalSorenUtilities.#Private.Debugger.log("Given storyCards has no items. Defaulting to global storyCards")
                __storyCards = storyCards
            }
            const result = new Map()
            for (const storyCard of __storyCards) {
                result.set(storyCard.id, storyCard)
            }
            return result
        },
        /**
         * Adds a StoryCard.
         * @param {String} title the name of the story card
         * @param {String} entry the contents of the story card
         * @param {String} description the description of the story card
         * @param {String} type the category of the story card
         * @param {String} keys the triggers of the story card
         * @returns {StoryCard}
         */
        addStoryCard(title = "", entry = "", description = "", type = "class", keys = "") {
            const card = storyCards[addStoryCard(keys, entry, type) - 1]
            card.title = title
            card.description = description
            return card
        },
        /**
         * Sets the state to the global state.
         * @param {String} stateName the state name
         * @param {Object} stateObject the state object
         */
        setState(stateName, stateObject) {
            state[stateName] = stateObject
        },
        /**
         * Gets the state.
         * @param {String} stateName the state name
         * @param {Object} alternative the given result if the given stateName is undefined.
         * @returns {Object}
         */
        getState(stateName, alternative = {}) {
            return state[stateName] || alternative
        },
        /**
         * Removes the state.
         * @param {String} stateName the state name
         */
        removeState(stateName) {
            state[stateName] = undefined
        },
    }
    // #endregion

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
    // #region Deprecated
    /**
     * Gets the current turn order.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @returns {number} number
     */
    static getTurnOrder() {
        return this.AIDungeon.getTurnOrder()
    }
    /**
     * @typedef {Object} HistoryEntry
     * @property {String} text
     * @property {String} rawText deprecated, use text.
     * @property {"start" | "continue" | "do" | "say" | "story" | "see"} type
     */
    /**
     * Returns the latest action taken by the player.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {"input" | "context" | "output"} context the current context it is running on
     * @returns {HistoryEntry | {}} HistoryEntry. On fail, it returns a empty object.
     */
    static getRecentAction(context) {
        return this.AIDungeon.getRecentAction(context)
    }
    /**
     * Gets the storyCards index given an storycard.id
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {number | String} id storycard.id
     * @returns {number} number. If not found, returns -1.
     */
    static getStoryCardIndexById(id) {
        return this.AIDungeon.getStoryCardIndexById(id)
    }
    /**
     * Gets a list of storycard ids matching the name given.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String} name storycard.title
     * @returns {String[]} An array of storycard.id, if any.
     */
    static getStoryCardIdsByName(name) {
        return this.AIDungeon.getStoryCardIdsByName(name)
    }
    /**
     * @typedef {Object} StoryCard
     * @property {String} id
     * @property {String} createdAt
     * @property {String} updatedAt
     * @property {String} keys also known as Triggers
     * @property {String} entry
     * @property {String} type
     * @property {String} title
     * @property {String} description also known as Notes
     * @property {boolean} useForCharacterCreation
     */
    /**
     * Gets StoryCards given a list of storycard.id
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String[] | number[]} ids a list of storycard.id
     * @returns {StoryCard[]} A array of StoryCards
     */
    static getStoryCardsByIds(ids) {
        return this.AIDungeon.getStoryCardsByIds(ids)
    }
    /**
     * Gets StoryCards matching the name(s) given.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String[]} names a Array of storycard.title
     * @returns {StoryCard[]}
     */
    static getStoryCardsByNames(names) {
        return this.AIDungeon.getStoryCardsByNames(names)
    }
    /**
     * Converts a array of StoryCards into a Map with the storycard.id
     * being the key to the StoryCard
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {StoryCard[]} _storyCards An array of StoryCards
     * @returns {Map<string,StoryCard>} an map of storycard.id keys to StoryCard values
     */
    static getStoryCardsAsMap(_storyCards) {
        return this.AIDungeon.getStoryCardsAsMap(_storyCards)
    }
    /**
     * Sets the state to the global state.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String} stateName the state name
     * @param {Object} stateObject the state object
     */
    static setState(stateName, stateObject) {
        this.AIDungeon.setState(stateName, stateObject)
    }
    /**
     * Gets the state.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String} stateName the state name
     * @param {Object} alternative the given result if the given stateName is undefined.
     * @returns {Object}
     */
    static getState(stateName, alternative = {}) {
        return this.AIDungeon.getState(stateName, alternative)
    }
    /**
     * Removes the state.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String} stateName the state name
     */
    static removeState(stateName) {
        this.AIDungeon.removeState(stateName)
    }
    /**
     * Adds a StoryCard.
     * @deprecated Moved to MysticalSorenUtilities.AIDungeon
     * @param {String} title the name of the story card
     * @param {String} entry the contents of the story card
     * @param {String} description the description of the story card
     * @param {String} type the category of the story card
     * @param {String} keys the triggers of the story card
     * @returns {StoryCard}
     */
    static addStoryCard(title = "", entry = "", description = "", type = "class", keys = "") {
        return this.AIDungeon.addStoryCard(title, entry, description, type, keys)
    }
    /**
     * Adds the configuration.
     * @deprecated
     * @param {String} namespace the state name
     * @param {String} type the category of the story card
     * @param {String} description the description of the story card
     * @returns {StoryCard}
     */
    static addStoryCardConfig(namespace = "", type = "class", description = "") {
        const card = this.addStoryCard(namespace, JSON.stringify(this.getState(namespace), (_, value) => { return value }, 1), description, type)
        return card
    }
    // #endregion
}