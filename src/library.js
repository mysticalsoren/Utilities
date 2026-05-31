/*export */class MysticalSorenUtilities {
  static #Private = {
    Debugger: this.Debugger("MysticalSorenUtilities")
  }
  // #region Debugger
  /**
   * @typedef {Object} Debugger
   * @property {String} namespace
   * @property {String} separator
   * @property {boolean} enabled
   * @property {(values: any) => void} log
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
        let message = namespace + ":"
        /**
         * Recursivly go through the number of values, stringifying the value.
         * @param {any} value Any datatype is accepted.
         * @returns the stringified value
         */
        const composeString = (value) => {
          let component = ""
          if (MysticalSorenUtilities.hasItems(value)) {
            component += "["

            /** @param {any} item */
            const vCallback = (item) => {
              component += `${composeString(item)},`
            }
            value.forEach(vCallback);

            component = component.substring(0, component.length - 1) + "]"
            return component
          }
          if (MysticalSorenUtilities.hasKeys(value)) {
            component += "{"
            for (const [k, v] of Object.entries(value)) {
              component += `${k}: ${composeString(v)},`
            }
            component = component.substring(0, component.length - 1) + "}"
            return component
          }
          return `${value}`
        }
        for (const value of values) {
          message += separator + composeString(value)
        }
        console.log(message)
      }
    }
  }
  //  #endregion
  // #region AIDungeon
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
   * @typedef {Object} Placeholder
   * @property {string} question The prompt that asks the user.
   * @property {string} answer The given response to the corresponding question.
   */
  static AIDungeon = {
    /**
     * Gets the current turn order.
     * @returns {number} number. The current turn order
     */
    getTurnOrder() {
      return info.actionCount || 0
    },
    /**
     * Detects if it is running under retry context. Works on Context and Output.
     * @returns {boolean} Returns true if it is a retry action
     */
    isRetryTurn() {
      return this.getTurnOrder() === (history.length + 1)
    },
    /**
     * Returns the latest action taken by the player.
     * @param {"input" | "context" | "output"} context the current context it is running on
     * @returns {HistoryEntry?} HistoryEntry.
     */
    getRecentAction(context) {
      if (!MysticalSorenUtilities.hasItems(history)) {
        MysticalSorenUtilities.#Private.Debugger.log("Could not get recent action. There are no actions.")
        return null
      }
      if (typeof context != "string") {
        MysticalSorenUtilities.#Private.Debugger.log("Could not get recent action. context is not a string.")
        return null
      }
      if (context.toLowerCase() in ["context", "output"]) {
        MysticalSorenUtilities.#Private.Debugger.log("Could not get recent action. It isn't ran in the Context Hook!")
        if (context.toLowerCase() === "input") {
          MysticalSorenUtilities.#Private.Debugger.log('Use "text" instead to get the recent action!')
          return null
        }
        return null
      }
      return history[history.length - 1]
    },
    /**
     * Gets the storyCards index given an storycard.id
     * @param {number | string} id storycard.id
     * @returns {number} number. If not found, returns -1.
     */
    getStoryCardIndexById(id) {
      if (typeof id === "string" || typeof id === "number") {
        id = id.toString()
        for (const [index, storyCard] of storyCards.entries()) {
          if (storyCard.id === id) {
            return index
          }
        }
        MysticalSorenUtilities.#Private.Debugger.log(`Could not get story card by id with the search id of "${id}"`)
        return -1
      }
      MysticalSorenUtilities.#Private.Debugger.log("Could not get story card by id. id is not a number!")
      return -1


    },
    /**
     * Gets StoryCards given a list of storycard.id
     * @param {string[] | number[]} ids a list of storycard.id
     * @returns {StoryCard[]} A array of StoryCards
     */
    getStoryCardsByIds(ids) {
      /** @type {StoryCard[]} */
      const cards = []
      if (!MysticalSorenUtilities.hasItems(ids)) {
        MysticalSorenUtilities.#Private.Debugger.log("Could not get story cards. There are no ids to go through.")
        return cards
      }
      for (const id of ids) {
        const idx = this.getStoryCardIndexById(id)
        if (idx < 0) {
          continue
        }
        cards.push(storyCards[idx])
      }
      return cards
    },
    /**
     * Gets StoryCards matching the name(s) given.
     * @param {string[]} names A array of storycard.title
     * @returns {StoryCard[]}
     */
    getStoryCardsByNames(names) {
      /** @type {StoryCard[]} */
      const cards = []
      if (!MysticalSorenUtilities.hasItems(names)) {
        MysticalSorenUtilities.#Private.Debugger.log("Could not get story cards. There are no names to go through.")
        return cards
      }
      for (const name of names) {
        for (const storyCard of storyCards) {
          if (storyCard.title === name) {
            cards.push(storyCard)
          }
        }
      }
      return cards
    },
    /**
     * Gets a list of storycard ids matching the name given.
     * @param {string} name storycard.title
     * @returns {string[]} An array of storycard.id, if any.
     */
    getStoryCardIdsByName(name) {
      /** @type {string[]} */
      const cards = []
      for (const storyCard of this.getStoryCardsByNames([name])) {
        cards.push(storyCard.id)
      }
      return cards
    },
    /**
     * Converts a array of StoryCards into a Map with the storycard.id
     * being the key to the StoryCard
     * @param {StoryCard[]?} _storyCards An array of StoryCards. If left empty, it defaults to the global storyCards.
     * @returns {Map<string,StoryCard>} an map of storycard.id keys to StoryCard values
     */
    getStoryCardsAsMap(_storyCards = null) {
      if (!MysticalSorenUtilities.hasItems(_storyCards)) {
        MysticalSorenUtilities.#Private.Debugger.log(`\
          Given storyCards has no items. Defaulting to global storyCards\
        `)
        _storyCards = storyCards
      }
      const result = new Map()
      // @ts-ignore
      for (const storyCard of _storyCards) {
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
      if (typeof stateName !== "string") {
        MysticalSorenUtilities.#Private.Debugger.log(`\
          Couldn't set state. The name isn't type of "string", found "${typeof stateName}"\
        `)
        return
      }
      if (!MysticalSorenUtilities.isPlainObject(stateObject)) {
        MysticalSorenUtilities.#Private.Debugger.log(`\
          Couldn't set state. The stateObject isn't a plain Object.\
        `)
        return
      }
      // @ts-ignore
      state[stateName] = stateObject
    },
    /**
     * Gets the state.
     * @param {String} stateName the state name
     * @param {Object} alternative Returns this object if it fails. If left out, it gives an empty Object.
     * @returns {Object}
     */
    getState(stateName, alternative = {}) {
      alternative = !MysticalSorenUtilities.isPlainObject(alternative) ? alternative : {}
      if (typeof stateName !== "string") {
        MysticalSorenUtilities.#Private.Debugger.log(`\
          Couldn't get state. The name isn't type of "string", found "${typeof stateName}. Returning with alternative..."\
        `)
        return alternative
      }
      // @ts-ignore
      return state[stateName] || alternative
    },
    /**
     * Removes the state.
     * @param {String} stateName the state name
     */
    removeState(stateName) {
      if (typeof stateName !== "string") {
        MysticalSorenUtilities.#Private.Debugger.log(`\
          Couldn't remove state. The name isn't type of "string", found "${typeof stateName}"\
        `)
        return
      }
      // @ts-ignore
      state[stateName] = undefined
    }
  }
  // #endregion

  /**
   * Checks if the given parameter is a Array and isn't empty.
   * @param {any} arr The given Array object
   * @returns {boolean}
   */
  static hasItems(arr) {
    return Array.isArray(arr) && arr.length > 0
  }
  /**
   * Checks if the given Object is a basic Object.
   * @param {Object} obj The given Object
   * @returns {boolean}
   */
  static isPlainObject(obj) {
    return obj && obj.constructor === Object
  }
  /**
   * Checks if the given Object is a basic Object and isn't empty.
   * @param {Object} obj the given Object
   * @returns {boolean}
   */
  static hasKeys(obj) {
    return this.isPlainObject(obj) && Object.keys(obj).length > 0
  }
  /**
   * Picks a randomized value in the given Array.
   * @template T
   * @param {Array<T>} arr the loot table
   * @returns {T}
   */
  static randomItem(arr) {
    if (!this.hasItems(arr)) {
      this.#Private.Debugger.log("Could not get random item from array.")
    }
    return arr[Math.floor(Math.random() * arr.length)]
  }
  /**
   * Converts a string to its primitive.
   * @param {string} str 
   * @returns {string | number | boolean}
   */
  static convertString(str) {
    if (str.length === 0) {
      return str
    }
    const truthy = new Set(["true", "yes"])
    const falsy = new Set(["false", "no"])
    const numConversion = Number(str)
    const lower = str.toLowerCase()
    if (!Number.isNaN(numConversion)) {
      return numConversion
    }
    if (truthy.has(lower)) {
      return true
    }
    if (falsy.has(lower)) {
      return false
    }
    return str
  }
  /**
   * Capitalizes the first letter with a preceding ".?!"
   * @param {string} str the string to sentence-case
   * @returns The sentence-cased form
   */
  static toSentenceCase(str) {
    return str.replaceAll(/(?:^|[.!?])\s*[a-z]/g, (match) => {
      return match.toUpperCase()
    })
  }
  /**
   * Escapes a character with a preceding "\\"
   * @param {string} str the string to begin the escaping
   * @returns {string} The escaped form
   */
  static escapeCharacter(str) {
    return str.replaceAll(/\\(.)/g, "$1")
  }
}