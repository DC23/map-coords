Hooks.on('init', function () {
    game.settings.register('map-coords', 'offset', {
        name: game.i18n.format('settings.offset.name'),
        hint: game.i18n.format('settings.offset.hint'),
        scope: 'client',
        requiresReload: true,
        type: Number,
        default: 0,
        config: true,
    })
    game.settings.register('map-coords', 'xValue', {
        name: game.i18n.format('settings.xValue.name'),
        hint: game.i18n.format('settings.xValue.hint'),
        scope: 'world',
        requiresReload: true,
        type: String,
        choices: {
            num: 'settings.value.number',
            let: 'settings.value.letter',
        },
        default: 'let',
        config: true,
    })
    game.settings.register('map-coords', 'yValue', {
        name: game.i18n.format('settings.yValue.name'),
        hint: game.i18n.format('settings.yValue.hint'),
        scope: 'world',
        requiresReload: true,
        type: String,
        choices: {
            num: 'settings.value.number',
            let: 'settings.value.letter',
        },
        default: 'num',
        config: true,
    })

    // Make the keybind into a fixed choice corresponding to Foundry.KeyboardManager modifier codes.
    // Having it as free text makes it too error prone
    game.settings.register('map-coords', 'keybind', {
        name: game.i18n.format('settings.keybind.name'),
        hint: game.i18n.format('settings.keybind.hint'),
        scope: 'client',
        requiresReload: false,
        type: new foundry.data.fields.StringField({
            choices: {
                Control: 'Control',
                Shift: 'Shift',
                Alt: 'Alt',
            },
            required: true,
        }),
        default: 'Alt',
        config: true,
    })

    game.settings.register('map-coords', 'timeOut', {
        name: game.i18n.format('settings.timeOut.name'),
        hint: game.i18n.format('settings.timeOut.hint'),
        scope: 'client',
        requiresReload: false,
        type: Number,
        default: 1500,
        config: true,
    })

    game.settings.register('map-coords', 'coordColour', {
        name: 'settings.coordinate.colour.name',
        hint: 'settings.coordinate.colour.hint',
        scope: 'client',
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: '#ffffff',
        requiresReload: true,
    })

    game.settings.register('map-coords', 'internalCoordSize', {
        name: 'settings.internal-coordinate-size.name',
        hint: 'settings.internal-coordinate-size.hint',
        scope: 'client',
        config: true,
        type: new foundry.data.fields.NumberField({ min: 5, max: 60 }),
        default: 14,
        requiresReload: true,
    })

    game.settings.register('map-coords', 'internalCoordAlpha', {
        name: 'settings.internal-coordinate-alpha.name',
        hint: 'settings.internal-coordinate-alpha.hint',
        scope: 'client',
        config: true,
        type: new foundry.data.fields.AlphaField({ min: 0.05, max: 1.0 }),
        default: 0.9,
        requiresReload: true,
    })

    game.settings.register('map-coords', 'leadingZeroes', {
        name: 'settings.leadingzeroes.name',
        hint: 'settings.leadingzeroes.hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
    })
})
