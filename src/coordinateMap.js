class Coord {
    // Render margin coordinates
    coords (rows, cols) {
        for (let i = 0; i < cols; i++) {
            let label = this.labelGen(this.xValue, this.applyHexColumnAdjustment(i))
            const name = new PreciseText(label, this.style)
            name.resolution = 4
            name.anchor.set(0.5)
            let pos = this.top(this.row0, i + this.col0)
            name.position.set(pos[0], pos[1])
            this.marginCoords.addChild(name)
        }
        for (let i = 0; i < rows; i++) {
            let label = this.labelGen(this.yValue, this.applyHexRowAdjustment(i))
            const name = new PreciseText(label, this.style)
            name.resolution = 4
            name.anchor.set(0.5, 0.5)
            let pos = this.left(i + this.row0, this.col0)
            name.position.set(pos[0], pos[1])
            this.marginCoords.addChild(name)
        }
    }

    // Render grid cell coordinates
    individual (rows, cols) {
        let tinyStyle = this.style.clone()
        tinyStyle.fontSize = this.size / 8
        let c = 0
        let pos = [0, 0]
        do {
            let colName = this.labelGen(this.xValue, this.applyHexColumnAdjustment(c))
            let r = 0
            do {
                let rowName = this.labelGen(this.yValue, this.applyHexRowAdjustment(r))
                let name = new PreciseText(Coord.formatCoordPair(rowName, colName), tinyStyle)
                name.resolution = 4
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
            } while (pos[1] < this.internal.height)
            c += 1
        } while (pos[0] < this.internal.width)
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

    toggle () {
        switch (this.state) {
            case 1:
                {
                    this.marginCoords.visible = false
                    this.cellCoords.visible = false
                    this.state = 2
                }
                break
            case 2:
                {
                    this.marginCoords.visible = true
                    this.cellCoords.visible = false
                    this.state = 3
                }
                break
            case 3:
                {
                    this.marginCoords.visible = false
                    this.cellCoords.visible = true
                    this.state = 1
                }
                break
        }
    }

    constructor () {
        this.internal = canvas.dimensions.sceneRect
        this.shiftX = canvas.dimensions.shiftX
        this.shiftY = canvas.dimensions.shiftY
        this.padX = canvas.dimensions.padX
        this.padY = canvas.dimensions.padY
        this.size = canvas.dimensions.size
        this.style = CONFIG.canvasTextStyle.clone()
        this.style.fill = game.settings.get('map-coords', 'coordColour')
        this.style.fontSize = this.size / 2
        const topLeft = canvas.grid.getOffset({ x: this.internal.left, y: this.internal.top })
        const bottomRight = canvas.grid.getOffset({
            x: this.internal.right,
            y: this.internal.bottom,
        })
        this.row0 = topLeft.i
        this.col0 = topLeft.j
        this.off = game.settings.get('map-coords', 'offset')
        this.xValue = game.settings.get('map-coords', 'xValue')
        this.yValue = game.settings.get('map-coords', 'yValue')
        this.start = game.settings.get('map-coords', 'startPoint')
        this.timeOut = game.settings.get('map-coords', 'timeOut')
        this.h = canvas.grid.sizeY
        this.w = canvas.grid.sizeX
        this.type = canvas.grid.type
        this.state = 2

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
        this.individual(canvas.dimensions.rows, canvas.dimensions.columns)

        this.addListener()
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
