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
* [DynamicCLI](#dynamiccli)
  * [Getters](#getters)
  * [stop()](#stop)
  * [setLayout()](#setlayout)
  * [setStyle()](#setstyle)
  * [createPage()](#createpage)
  * [deletePage()](#deletepage)
  * [setInput()](#setinput)
  * [simulateInput()](#simulateinput)
  * [switchPage()](#switchpage)
  * [listen()](#listen)
* [Component](#component)
* [TextColor](#textcolor)
* [BackgroundColor](#backgroundcolor)

# DynamicCLI
```ts
import { DynamicCLI } from './DynamicCLI'

new DynamicCLI(<options>) // Create a CLI
```
* `options <undefined | object>` | Options for the CLI.
  * `render <boolean>` | Should the CLI render stuff onto the console. `Default: true`
  * `renderInterval <number>` | The interval(ms) between each render. `Default: 50`

## Getters
 * `.pages <string[]>` | Get IDs of all the pages.
 * `.input <string>` | Get user input.
 * `.currentPage <string>` | Get the ID of current page.

## Stop()
```ts
.stop() // Stop the CLI
```

> `return <undefined>`

## setLayout()
```ts
.setLayout(<layout>) // Set the layout of the CLI
```
* `layout <any[]>` | An <array> contains components.

> `return <DynamicCLI>`

## setStyle()
```ts
.setStyle(<style>) // Set the style of the CLI
```
* `style <object>`

**- Default Style -**
```ts
{
  background: BackgroundColor.reset,

  selectBackground: BackgroundColor.white,
  selectFont: TextColor.gray,
  notSelectBackground: BackgroundColor.gray,
  notSelectFont: TextColor.white
}
```

> `return <DynamicCLI>`

## createPage()
```ts
.createPage(<id>, <name>, <callback>) // Create a page
```
* `id <string>` | The ID of the page.
* `name <string>` | The name of the page.
* `callback <function>` | The render function of the page, the function must return `<string[]>`.

> `return <DynamicCLI>`

## deletePage()
```ts
.deletePage(<id>) // Delete a page
```
* `id <string>` | The ID of the page.

> `return <DynamicCLI>`

## setInput
```ts
.setInput(<string>) // Set the input
```
* `string <string>` | The content of the input.

> `return <undefined>`

## simulateInput
```ts
.simulateInput(<data>) // Simulate user input
```
* `data <Buffer>` | The input you want to simulate.

> `return <undefined>`

## switchPage
```ts
.switchPage(<id>) // Switch page
```
* `id <string>` | The id of the page.

> `return <undefined>`

## listen
```ts
.listen(<name>, <callback>) // Listen to an event
```
* `name <string>` | The name of the event.
* `callback <function>` | The function that triggers when the event is called.

**- All Events -**
| name       | callback data                | description                         |
| ---        | ---                          | ---                                 |
| scroll     | ({ page, cursorY, scrollY }) | Triggered when user scrolls.        |
| switchPage | (pageID)                     | Triggered when user switches pages. |
| enter      | (input)                      | Triggered when user press enter.    |
| input      | (key)                        | Triggered when user input.          |

> `return <undefined>`

# Component
```ts
import { Component } from './DynamicCLI'

Component.<name>(<parameters>)
```
**- All Components -**

| name        | parameters    | description                                                         |
| ---         | ---           | ---                                                                 |
| blank       | ()            | A blank line.                                                       |
| text        | (callback)    | A line of text, callback must be a function that return a <string>. |
| pageTabs    | ()            | A line of page tabs.                                                |
| pageContent | ()            | Multiple lines of page content.                                     |
| input       | (placeholder) | A line of input.                                                    |

# TextColor
```ts
import { TextColor } from './DynamicCLI'

TextColor.<name>
```

**- All Colors -**

`reset`, `red`, `brightRed`, `yellow`, `brightYellow`, `green`, `brightGreen`, `cyan`, `brightCyan`, `blue`, `brightBlue`, `purple`, `brightPurple`, `white`, `black`, `gray`

# BackgroundColor
```ts
import { BackgroundColor } from './DynamicCLI'

BackgroundColor.<name>
```

**- All Colors -**

`reset`, `red`, `brightRed`, `yellow`, `brightYellow`, `green`, `brightGreen`, `cyan`, `brightCyan`, `blue`, `brightBlue`, `purple`, `brightPurple`, `white`, `black`, `gray`
