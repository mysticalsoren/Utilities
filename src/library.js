class MysticalSorenUtilities {
    static PrivateStatic = {
        DEBUG: true,
        debug(msg) {
            if (this.DEBUG) {
                console.log(`MysticalSorenUtilities: ${msg}`)
            }
        }
    }
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
            this.PrivateStatic.debug("Could not get random item from array.")
        }
        return arr[Math.floor(Math.random() * arr.length)]
    }
    static getRecentAction(context) {
        if (!this.hasItems(history)) {
            this.PrivateStatic.debug("Could not get recent action. There are no actions.")
            return {}
        }
        if (typeof context != "string") {
            this.PrivateStatic.debug("Could not get recent action. context is not a string.")
            return {}
        }
        if (context.toLowerCase() in ["context", "output"]) {
            this.PrivateStatic.debug("Could not get recent action. It isn't ran in the Context Hook!")
            if (context.toLowerCase() === "input") {
                this.PrivateStatic.debug('Use "text" instead to get the recent action!')
                return {}
            }
            return {}
        }
        return history[history.length - 1]
    }
    static getStoryCardIndexById(id) {
        if (typeof id in ["number", "string"]) {
            this.PrivateStatic.debug("Could not get story card by id. id is not a number!")
            return -1
        }
        id = String(id)
        for (const [index, storyCard] of storyCards.entries()) {
            if (storyCard.id === id) {
                return index
            }
        }
        this.PrivateStatic.debug(`Could not get story card by id with the search id of "${id}"`)
        return -1
    }
    static getStoryCardIdsByName(name) {
        const result = []
        if (typeof name !== "string") {
            this.PrivateStatic.debug("Could not get story card id by name. name is not a number!")
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
            this.PrivateStatic.debug("Could not get story cards. There are no ids to go through.")
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
            this.PrivateStatic.debug("Could not get story cards. There are no names to go through.")
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
            this.PrivateStatic.debug("Given storyCards has no items. Defaulting to global storyCards")
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
}