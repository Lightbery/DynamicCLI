# DynamicCLI
A tool for building "dynamic" CLI.

## Example
```ts
import { DynamicCLI } from './DynamicCLI'

new DynamicCLI()
  .createPage('Page1', 'A Page', () => ['This', 'Is', 'A', 'Page'])
  .createPage('Page2', 'Another Page', () => ['This', 'Is', 'Another', 'Page'])
```

> [!Note]
> DynamicCLI need `@types/wcwidth` and `wcwidth` as dependencies.

## Contents
* [DynamicCLI](dynamiccli)
  * [Getters](getters)

# DynamicCLI
```ts
import { DynamicCLI } from './DynamicCLI'

new DynamicCLI(<options>)
```
* `options <undefined | object>` | Options for the CLI.
  * `render <boolean>` | Should the CLI render stuff onto the console. `Default: true`
  * `renderInterval <number>` | The interval(ms) between each render. `Default: 50`

 ## Getters
 * `.pages <string[]>` | Get IDs of all the pages.
 * `.input <string>` | Get user input.
 * `.currentPage <string>` | Get the ID of current page.
