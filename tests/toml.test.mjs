import { MysticalSorenUtilities } from "../src/library.js";

console.log(MysticalSorenUtilities.TOML.parse(`
# TOML Comment
# Another TOML Comment

level0str = "hello world"
level0num = 3
level0LargeNum = 1_000_000
level0mstr = """
BeginningLine
NextLine

  Whitespace  """
level0ConditionT = true
level0ConditionF = false
`))