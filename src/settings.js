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

    game.settings.register('map-coords', 'startPoint', {
        name: game.i18n.format('settings.startPoint.name'),
        hint: game.i18n.format('settings.startPoint.hint'),
        scope: 'world',
        requiresReload: true,
        type: String,
        choices: {
            left: 'settings.startPoint.left',
            center: 'settings.startPoint.center',
            right: 'settings.startPoint.right',
        },
        default: 'left',
        config: false,
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
})
