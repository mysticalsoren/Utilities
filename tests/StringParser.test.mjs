import { MysticalSorenUtilities } from "../src/library.js";

let StringParser = MysticalSorenUtilities.StringParser(`\
a=cde==cde\\??tr\\:ue:false

b=efg==efg?true:false

c=zxc!=zxc?true:false
`, '=,==,!=,?,:')

console.log("Document:\n\"\"\"\n", StringParser.document, '\n"""')
console.log("Delimiters:", StringParser.delimiters)
console.log("loop:", StringParser.loop)

while (StringParser.hasLines()) {
    console.log(StringParser.readLine(false))
}

console.log(StringParser)