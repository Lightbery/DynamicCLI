import readline from 'readline'
import wcwidth from 'wcwidth'

// Dynamic CLI
class DynamicCLI {
  private _layout: any[] = [Component.pageTabs(), Component.blank(), Component.pageContent(), Component.blank(), Component.input()]
  private _style: Style = {
    background: BackgroundColor.reset,

    selectBackground: BackgroundColor.white,
    selectFont: TextColor.gray,
    notSelectBackground: BackgroundColor.gray,
    notSelectFont: TextColor.white
  }

  public interval!: any
  public interface!: readline.Interface

  private _pages: { [key: string]: Page } = {}
  private _data: { input: string, currentPage: undefined | string } = { input: '', currentPage: undefined }
  private _listeners: { [key: string]: { (...args: any): any }[] } = {}

  constructor (options?: DynamicCliOptions) {
    options = Object.assign({
      render: true,
      renderInterval: 50
    }, (options === undefined) ? {} : options)

    if (options.render) this.interval = setInterval(() => this._render(), options.renderInterval)

    this.interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    process.stdin.on('data', (data) => this._handleInput(data))
  }

  public get pages () {return Object.keys(this._pages)}
  public get input () {return this._data.input}
  public get currentPage () {return this._data.currentPage}

  // Set Layout
  public setLayout (layout: any[]): DynamicCLI {
    layout.forEach((component) => {
      const allComponentsID = Object.keys(Component).map((name) => Component[name]().type)

      if (!allComponentsID.includes(component.type)) throw new Error(`Component Not Found: "${component.type}"`)
    }) 

    return this
  }

  // Set Style
  public setStyle (style: Style): DynamicCLI {
    this._style = style

    return this
  }

  // Create Page
  public createPage (id: string, name: string, callback: () => string[]): DynamicCLI {
    if (this._pages[id] !== undefined) throw new Error(`Page Already Exist: "${id}"`)

    this._pages[id] = {
      name,
      callback,

      content: [],

      cursorY: 0,
      scrollY: 0
    }

    if (this._data.currentPage === undefined) this._data.currentPage = id

    return this
  }

  // Delete Page
  public deletePage (id: string): void {
    if (this._pages[id] === undefined) throw new Error(`Page Not Found: "${id}"`)

    if (this._data.currentPage !== undefined) {
      const currentPageIndex = Object.keys(this._pages).indexOf(this._data.currentPage)

      delete this._pages[id]

      const pages = Object.keys(this._pages)

      if (pages.length === 0) this._data.currentPage = undefined
      else if (currentPageIndex >= pages.length) this._data.currentPage = pages[pages.length - 1]
    } else delete this._pages[id]
  }

  // Set Input
  public setInput (string: string): void {
    this._data.input = string
  }

  // Simulate Input
  public simulateInput (data: Buffer): void {
    this._handleInput(data)
  }

  // Switch Page
  public switchPage (id: string): void {
    if (this._pages[id] === undefined) throw new Error(`Page Not Found: "${id}"`)

    this._data.currentPage = id
  }

  // Listen To Event
  public listen (name: string, callback: (...args: any) => any): void {
    if (this._listeners[name] === undefined) this._listeners[name] = []

    this._listeners[name].push(callback)
  }

  // Render
  private _render (): void {
    let lines: any[] = []

    this._layout.forEach((component) => lines = lines.concat(this._renderComponent(component)))

    while (lines.length < process.stdout.rows - 1) lines.push('')

    lines = lines.slice(0, process.stdout.rows - 1).map((line) => {
      let characters = this._sperateColor(line.replaceAll('\n', '\\n'))
      let planText = characters.map((character) => character.text).join('')

      if (wcwidth(planText) < process.stdout.columns) characters.push({ color: this._style.background, text: ' '.repeat(process.stdout.columns - wcwidth(planText)) })
      else {
        while (wcwidth(planText) > process.stdout.columns) {
          characters = characters.slice(0, characters.length-1)
          planText = planText.substring(0, planText.length-1)
        }
      }

      return `${this._style.background}${characters.map((character) => `${(character.color === undefined) ? '' : character.color}${character.text}`).join('')}`
    })

    process.stdout.write(`\x1B[2J\x1B[3J\x1B[H\x1Bc${lines.join('\n')}\n${TextColor.reset}`)
  }

  // Render Component
  private _renderComponent (component: any): string[] {
    if (component.type === 'blank') return [this._style.background]
    else if (component.type === 'text') return [component.callback()]

    if (component.type === 'pageTabs') {
      const tabs: string[] = []

      Object.keys(this._pages).forEach((id) => {
        if (id === this._data.currentPage) tabs.push(`${this._style.selectBackground} ${this._style.selectFont}${this._pages[id].name} ${this._style.background}`)
        else tabs.push(`${this._style.notSelectBackground} ${this._style.notSelectFont}${this._pages[id].name} ${this._style.background}`) 
      })

      return [` ${tabs.join(' ')} `]
    } else if (component.type === 'pageContent') {
      const lines: string[] = []

      if (this._data.currentPage !== undefined) {
        const page = this._pages[this._data.currentPage]

        page.content = page.callback()

        for (let i = page.scrollY; i < page.scrollY + (process.stdout.rows - this._layout.length) && i < page.content.length; i++) {
          const lineNumber: string = (i + 1).toString().padStart(2, ' ')

          if (page.cursorY === i) lines.push(`${this._style.selectBackground} ${this._style.selectFont}${lineNumber}${TextColor.reset}${this._style.background} | ${page.content[i]}`) 
          else lines.push(` ${lineNumber} | ${page.content[i]}`)
        }
      }

      while (lines.length < process.stdout.rows - this._layout.length) lines.push('')

      return lines
    }

    if (component.type === 'input') {
      let string: string = ` ${(this._data.input.length > 0) ? `${this._style.selectBackground}${this._style.selectFont}` : `${this._style.notSelectBackground}${this._style.notSelectFont}`} `

      if (this._data.input.length > 0) string += this._data.input
      else {
        if (component.placeholder === undefined) string += `⇧⇩ Scroll | ⇦⇨ Switch Page | Type to give input`
        else string += component.placeholder
      }

      string += ' '.repeat(process.stdout.columns - wcwidth(this._sperateColor(string).map((character) => character.text).join('') + ' ')) + this._style.background

      return [string]
    }

    return []
  }

  // Seperate Color
  private _sperateColor (string: string): { color?: string, text: string }[] {
    const characters: { color?: string, text: string }[] = []

    let color: string = '' 

    for (let i = 0; i < string.length; i++) {
      if (string[i] === '\x1b') {
        const oldIndex = i

        while (string[i] !== 'm' && i < string.length) {
          color += string[i]

          i++
        }

        if (string[i] === 'm') color += 'm'
        else i = oldIndex
      } else {
        if (color === undefined) characters.push({ text: string[i] })
        else {
          characters.push({ color, text: string[i] })

          color = '' 
        }
      }
    }

    return characters
  }

  // Handle Input
  private _handleInput (data: Buffer): void {
    const hex = data.toString('hex')

    if ([keys.upArrow, keys.downArrow, keys.leftArrow, keys.rightArrow].includes(hex)) {
      if (this._data.currentPage !== undefined) {
        const page = this._pages[this._data.currentPage]

        if (hex === keys.upArrow) {
          if (page.cursorY > page.scrollY) page.cursorY--
          else if (page.scrollY > 0) {
            page.cursorY--
            page.scrollY--
          }

          this._callEvent('scroll', { page: this._data.currentPage, cursorY: page.cursorY, scrollY: page.scrollY })
        } else if (hex === keys.downArrow) {
          if (page.cursorY - page.scrollY < (process.stdout.rows - this._layout.length) - 1 && page.cursorY < page.content.length - 1) page.cursorY++
          else if (page.cursorY < page.content.length - 1) {
            page.cursorY++
            page.scrollY++
          }

          this._callEvent('scroll', { page: this._data.currentPage, cursorY: page.cursorY, scrollY: page.scrollY })
        } else if (hex === keys.leftArrow) {
          const pages = Object.keys(this._pages)

          if (pages.indexOf(this._data.currentPage) < 1) this._data.currentPage = pages[pages.length - 1]
          else this._data.currentPage = pages[pages.indexOf(this._data.currentPage)-1]

          this._callEvent('switchPage', this._data.currentPage)
        } else if (hex === keys.rightArrow) {
          const pages = Object.keys(this._pages)

          if (pages.indexOf(this._data.currentPage) > pages.length - 2) this._data.currentPage = pages[0]
          else this._data.currentPage = pages[pages.indexOf(this._data.currentPage) + 1]

          this._callEvent('switchPage', this._data.currentPage)
        }
      }
    } else if (hex === keys.enter) {
      if (this._data.input.length > 0) {
        this._callEvent('enter', this._data.input)

        this._data.input = ''
      } else if (this._data.currentPage !== undefined) this._callEvent('select', { page: this._data.currentPage, cursorY: this._pages[this._data.currentPage].cursorY })
    } else if (hex === keys.backspace) {
      if (this._data.input.length > 0) this._data.input = this._data.input.substring(0, this._data.input.length - 1)

      this._callEvent('input', this._data.input)
    } else {
      const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/

      if (regex.test(data.toString())) this._data.input+=data.toString().replaceAll('\n', '')

      this._callEvent('input', data)
    }
  }

  // Call Event
  private _callEvent (name: string, data: any): void {
    if (this._listeners[name] !== undefined) this._listeners[name].forEach((callback) => callback(data))
  }
}

// Component 
class Component {
  public static blank () {return { type: 'blank' }}
  public static text (callback: () => string) {return { type: 'text', callback }}
  public static pageTabs () {return { type: 'pageTabs' }}
  public static pageContent () {return { type: 'pageContent' }}
  public static input (placeholder?: string) {return { type: 'input', placeholder }}
}

// Text Color
class TextColor {
  public static get reset () {return '\x1b[0m'}

  public static get red () {return '\x1b[31m'}
  public static get brightRed () {return '\x1b[92m'}

  public static get yellow () {return '\x1b[33m'}
  public static get brightYellow () {return '\x1b[93m'}

  public static get green () {return '\x1b[32m'}
  public static get brightGreen () {return '\x1b[92m'}

  public static get cyan () {return '\x1b[36m'}
  public static get brightCyan () {return '\x1b[96m'}

  public static get blue () {return '\x1b[34m'}
  public static get brightBlue () {return '\x1b[94m'}

  public static get purple () {return '\x1b[35m'}
  public static get brightPurple () {return '\x1b[95m'}

  public static get white () {return '\x1b[97m'}
  public static get black () {return '\x1b[30m'}
  public static get gray () {return '\x1b[90m'}
}

// Background Color
class BackgroundColor {
  public static get reset () {return '\x1b[0m'}

  public static get red () {return '\x1b[41m'}
  public static get brightRed () {return '\x1b[101m'}

  public static get yellow () {return '\x1b[43m'}
  public static get brightYellow () {return '\x1b[103m'}

  public static get green () {return '\x1b[42m'}
  public static get brightGreen () {return '\x1b[102m'}

  public static get cyan () {return '\x1b[46m'}
  public static get brightCyan () {return '\x1b[106m'}

  public static get blue () {return '\x1b[44m'}
  public static get brightBlue () {return '\x1b[104m'}

  public static get purple () {return '\x1b[45m'}
  public static get brightPurple () {return '\x1b[105m'}

  public static get white () {return '\x1b[107m'}
  public static get black () {return '\x1b[40m'}
  public static get gray () {return '\x1b[100m'}
}

// DynamicCliOptions
interface DynamicCliOptions {
  render?: boolean,
  renderInterval?: number
}

// Style
interface Style {
  background: string,

  selectBackground: string,
  selectFont: string,
  notSelectBackground: string,
  notSelectFont: string 
}

// Page
interface Page {
  name: string,
  callback: () => string[],

  content: string[],

  cursorY: number,
  scrollY: number
}

export { DynamicCLI, Component, TextColor, BackgroundColor }

const keys = {
  upArrow: '1b5b41',
  downArrow: '1b5b42',
  leftArrow: '1b5b44',
  rightArrow: '1b5b43',

  enter: '0d',
  backspace: '7f',
  exit: '03'
}
