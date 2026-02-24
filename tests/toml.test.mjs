import { MysticalSorenUtilities } from "../src/library.js";

console.log(MysticalSorenUtilities.TOML.parse(`
# TOML Comment
# Another TOML Comment

level0str = "hello world"
level0num = 3
level0mstr = """
BeginningLine
NextLine

  Whitespace  """
`))