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
  * [setLayout()](#setlayout)
  * [setStyle()](#setstyle)
  * [createPage()](#createpage)

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

## listen
```ts
.listen(<name>, <callback>) // Listen to an event
```
* `name <string>` | The name of the event.
* `callback <function>` | The function that triggers when the event is called.

**- Events -**
| name       | callback data                | description                         |
| ---        | ---                          | ---                                 |
| scroll     | ({ page, cursorY, scrollY }) | Triggered when user scrolls.        |
| switchPage | (pageID)                     | Triggered when user switches pages. |
| enter      | (input)                      | Triggered when user press enter.    |
| input      | (key)                        | Triggered when user input.          |

> `return <undefined>`
