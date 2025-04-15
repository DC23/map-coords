// Coordinate display states
const COORDINATE_DISPLAY_STATES = {
    HIDDEN: 1,
    ROW_COLUMN: 2,
    CELL: 3,
}

class Coord {
    // Render margin coordinates
    coords (rows, cols) {
        /*
        Since the count of rows and columns includes padding, and was always problematic on hex grids 
        since the dimensions are funky in one direction, I'll switch to the algorithm used on
        individual coordinates: keep iterating until the coordinate position crosses the 
        relevant threshold.
        For the horizontal row of column coordinates, the threshold is pos[1] >= this.internal.right
        For the vertical column of row coordinates, the threshold is is pos[0] >= this.internal.bottom
        */
        let pos = [0, 0]
        let i = 0
        let name = null
        // The horizontal row of column coordinates
        do {
            const adjustedColumnIndex = this.applyHexColumnAdjustment(i)
            let label = this.labelGen(this.xValue, adjustedColumnIndex)
            name = new PreciseText(label, this.style)
            name.resolution = 4
            name.anchor.set(0.5)
            pos = this.top(this.row0, i + this.col0)
            name.position.set(pos[0], pos[1])

            // don't render coordinates for the first hex columns when it's been adjusted into a negative value.
            // It looks funky and isn't required.
            // Also don't render when the name is outside the left or right bounds
            if (
                pos[0] >= this.internal.left &&
                pos[0] <= this.internal.right &&
                adjustedColumnIndex >= 0
            ) {
                this.marginCoords.addChild(name)
            }
            i += 1
        } while (pos[0] + name.width < this.internal.right) // stop when the label will exceed the right edge

        // The vertical column of row coordinates
        i = 0
        do {
            const adjustedRowIndex = this.applyHexRowAdjustment(i)
            let label = this.labelGen(this.yValue, adjustedRowIndex)
            name = new PreciseText(label, this.style)
            name.resolution = 4
            name.anchor.set(0.5, 0.5)
            pos = this.left(i + this.row0, this.col0)
            name.position.set(pos[0], pos[1])

            // don't render coordinates for the first hex row when it's been adjusted into a negative value.
            // It looks funky and isn't required.
            if (
                pos[1] >= this.internal.top &&
                pos[1] <= this.internal.bottom &&
                adjustedRowIndex >= 0
            ) {
                this.marginCoords.addChild(name)
            }
            i += 1
        } while (pos[1] + name.height < this.internal.bottom)
    }

    // Render grid cell coordinates
    individual () {
        let tinyStyle = this.style.clone()
        const fontScale = Math.max(10, game.settings.get('map-coords', 'internalCoordSize')) / 100
        tinyStyle.fontSize = this.size * fontScale
        const alpha = game.settings.get('map-coords', 'internalCoordAlpha')
        let c = 0
        let pos = [this.internal.x, this.internal.y]
        do {
            let colName = this.labelGen(this.xValue, this.applyHexColumnAdjustment(c))
            let r = 0
            do {
                let rowName = this.labelGen(this.yValue, this.applyHexRowAdjustment(r))
                let name = new PreciseText(Coord.formatCoordPair(rowName, colName), tinyStyle)
                name.resolution = 4
                name.alpha = alpha
                const tl = canvas.grid.getTopLeftPoint({ i: r + this.row0, j: c + this.col0 })
                pos = [tl.x, tl.y]

                if (canvas.grid.isHexagonal) {
                    // centre the text horizontally by adding half the width of the hex cell
                    // the subtracting half the width of the text
                    pos[0] += this.w / 2 - name.width / 2

                    // nudge the text down only for row grids since it gets crowded in the vertex
                    // by trial and error, 1/3 of the text height is enough
                    if (!canvas.grid.columns) pos[1] += name.height / 3
                }

                // it looks neater if we only render those internal coordinates that are inside the scene boundary
                if (this.internal.contains(pos[0], pos[1])) {
                    name.position.set(pos[0], pos[1])
                    this.cellCoords.addChild(name)
                }

                r += 1
            } while (pos[1] < this.internal.bottom)
            c += 1
        } while (pos[0] < this.internal.right)
    }

    labelGen (val, i) {
        switch (val) {
            case 'num':
                return `${(i + 1).toString().padStart(this.coordinatePadding, '0')}` // convert to 1-based
            case 'let': {
                if (i < 26) return String.fromCharCode(65 + i)
                else {
                    return Coord.numToSSColumn(i + 1) // 1-based
                }
            }
        }
    }

    static formatCoordPair (row, col) {
        return `${col}${row}`
    }

    static numToSSColumn (num) {
        var s = '',
            t
        while (num > 0) {
            t = (num - 1) % 26
            s = String.fromCharCode(65 + t) + s
            num = ((num - t) / 26) | 0
        }
        return s || undefined
    }

    top (row, col) {
        const tl = canvas.grid.getTopLeftPoint({ i: row, j: col })
        return [tl.x + this.w / 2, this.internal.top - this.off - this.size / 4]
    }

    // Here's the thing that had me confused when taking over maintenance on this:
    // `top` and `left` here are not top and left corners of a display rect, but offsets for the
    // top and left coordinate rows. Thus the value returned from `left`
    // appears to control the start position of the left-hand column of coordinates for
    // that display mode.
    left (row, col) {
        const tl = canvas.grid.getTopLeftPoint({ i: row, j: col })
        let yOffset = this.h / 2
        return [this.internal.left - this.off - this.size / 4, tl.y + yOffset]
    }

    // Apply the -1 adjustment for Hex Row Even layouts, so that the top-left complete hex is numbered as the first on the map
    applyHexRowAdjustment (row) {
        return canvas.grid.isHexagonal && canvas.grid.even && !canvas.grid.columns ? row - 1 : row
    }

    // Apply the -1 adjustment for Hex Column Even layouts, so that the top-left complete hex is numbered as the first on the map
    applyHexColumnAdjustment (col) {
        return canvas.grid.isHexagonal && canvas.grid.even && canvas.grid.columns ? col - 1 : col
    }

    mouseCoords () {
        const pos = canvas.mousePosition
        const offset = canvas.grid.getOffset({ x: pos.x, y: pos.y })
        const row = this.applyHexRowAdjustment(offset.i - this.row0)
        const col = this.applyHexColumnAdjustment(offset.j - this.col0)
        const rowName = this.labelGen(this.yValue, row)
        const colName = this.labelGen(this.xValue, col)
        let name = new PreciseText(Coord.formatCoordPair(rowName, colName), this.style)
        name.resolution = 4
        name.anchor.set(0.2)
        name.position.set(pos.x, pos.y)
        let label = canvas.controls.addChild(name)
        setTimeout(() => {
            label.destroy()
        }, this.timeOut)
    }

    addListener () {
        canvas.stage.addListener(
            'click',
            function (event) {
                if (game.keyboard.isModifierActive(game.settings.get('map-coords', 'keybind'))) {
                    return this.mouseCoords()
                }
            }.bind(this)
        )
    }

    addContainer () {
        this.marginCoords = canvas.controls.addChild(new PIXI.Container())
        this.cellCoords = canvas.controls.addChild(new PIXI.Container())
        this.marginCoords.visible = false
        this.cellCoords.visible = false
    }

    // switch to the next coordinate display state
    toggle () {
        switch (this.#displayState) {
            case COORDINATE_DISPLAY_STATES.HIDDEN:
                this.#displayState = COORDINATE_DISPLAY_STATES.ROW_COLUMN
                break
            case COORDINATE_DISPLAY_STATES.ROW_COLUMN:
                this.#displayState = COORDINATE_DISPLAY_STATES.CELL
                break
            case COORDINATE_DISPLAY_STATES.CELL:
                this.#displayState = COORDINATE_DISPLAY_STATES.HIDDEN
                break
        }
    }

    // coordinate display state
    get #displayState () {
        // Non-GM users can temporarily override the state from the GM-controlled
        // persistent state. If this has been done, return that value instead of the
        // flag, with a final fallback to the default.
        if (this.overrideDisplayState) return this.overrideDisplayState
        return (
            canvas?.scene.getFlag('map-coords', 'coordinate-state') ||
            COORDINATE_DISPLAY_STATES.HIDDEN
        )
    }

    set #displayState (state) {
        if (canvas.scene) {
            switch (state) {
                default:
                case COORDINATE_DISPLAY_STATES.HIDDEN:
                    {
                        this.marginCoords.visible = false
                        this.cellCoords.visible = false
                    }
                    break
                case COORDINATE_DISPLAY_STATES.ROW_COLUMN:
                    {
                        this.marginCoords.visible = true
                        this.cellCoords.visible = false
                    }
                    break
                case COORDINATE_DISPLAY_STATES.CELL:
                    {
                        this.marginCoords.visible = false
                        this.cellCoords.visible = true
                    }
                    break
            }
            if (game.user.isGM) canvas.scene.setFlag('map-coords', 'coordinate-state', state)
            else this.overrideDisplayState = state
        }
    }

    constructor () {
        this.internal = canvas.dimensions.sceneRect
        this.size = canvas.dimensions.size
        this.style = CONFIG.canvasTextStyle.clone()
        this.style.fill = game.settings.get('map-coords', 'coordColour')
        this.style.fontSize = this.size / 2
        const topLeft = canvas.grid.getOffset({ x: this.internal.left, y: this.internal.top })
        this.row0 = topLeft.i
        this.col0 = topLeft.j
        this.off = game.settings.get('map-coords', 'offset')
        this.xValue = game.settings.get('map-coords', 'xValue')
        this.yValue = game.settings.get('map-coords', 'yValue')
        this.timeOut = game.settings.get('map-coords', 'timeOut')
        this.h = canvas.grid.sizeY
        this.w = canvas.grid.sizeX
        this.type = canvas.grid.type

        // if the setting is true, set the zero padding to the number
        // of digits in the max of the scene columns and rows
        if (game.settings.get('map-coords', 'leadingZeroes')) {
            this.coordinatePadding = String(
                Math.max(canvas.dimensions.columns, canvas.dimensions.rows)
            ).length
        } else {
            this.coordinatePadding = 0
        }

        this.addContainer()
        this.coords(canvas.dimensions.rows, canvas.dimensions.columns)
        this.individual()

        this.addListener()

        // once all the PIXI items are built, we can set the initial display state.
        // This will either set from the current scene flags, or to the default hidden state
        // if it's the first time we've viewed this scene.
        // This implementation also makes it easier to add a keybind later
        this.#displayState = this.#displayState
    }

    finalize () {
        canvas.controls.removeChild(this.marginCoords)
        canvas.controls.removeChild(this.cellCoords)
        this.marginCoords.visible = false
        this.cellCoords.visible = false
    }

    /**
     * @returns {Boolean} true if the current scene has a supported grid type; otherwise false
     */
    static get currentSceneIsSupported () {
        return canvas.grid?.isSquare || canvas.grid?.isHexagonal
    }
}

function getSceneControlButtons (buttons) {
    if (Coord.currentSceneIsSupported) {
        const tokenButton = buttons.find(b => b.name == 'measure')
        if (tokenButton) {
            tokenButton.tools.push({
                name: 'map-coords',
                title: game.i18n.format('button.name'),
                icon: 'far fa-globe',
                visible: true,
                onClick: () => window?.MapCoordinates.toggle(),
                button: true,
            })
        }
    }
}

Hooks.on('canvasReady', () => {
    // if window.MapCoordinates already has a value, deregister it.
    if (window.MapCoordinates) {
        window.MapCoordinates.finalize()
        window.MapCoordinates = null
    }

    if (Coord.currentSceneIsSupported) {
        const map = new Coord()
        window.MapCoordinates = map
    }
})

Hooks.on('getSceneControlButtons', getSceneControlButtons)

Hooks.on('init', registerKeybindings)

function registerKeybindings () {
    game.keybindings.register('map-coords', 'toggle-coordinates', {
        name: 'button.name',
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY,
        restricted: false,
        onDown: () => {
            window?.MapCoordinates.toggle()
            return true
        },
    })
}
