<script setup>
import { onMounted, onUnmounted, ref, reactive, watch, computed } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'

import { checkPossibleMoves, findGroup, getGroupLiberties } from './shared';

// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits(['current-active-scene'])

// following grid contains the current state of the game
// null means empty, 'white' means white player, 'black' means black player
const gridState = reactive(
    Array(5)
        .fill(null)
        .map(() => Array(5).fill(null))
)

// following grid contains the current state of the immediate
// liberties of each cell
const libertiesState = computed(() => {
    const liberties = Array(5)
        .fill(null)
        .map(() => Array(5).fill([]))

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            let libertiesItems = []
            if (gridState[y][x] !== null) {
                const p = gridState[y][x]
                if (y > 0 && gridState[y - 1][x] === null) {
                    libertiesItems.push(`${y - 1},${x}`)
                }
                if (y < 4 && gridState[y + 1][x] === null) {
                    libertiesItems.push(`${y + 1},${x}`)
                }
                if (x > 0 && gridState[y][x - 1] === null) {
                    libertiesItems.push(`${y},${x - 1}`)
                }
                if (x < 4 && gridState[y][x + 1] === null) {
                    libertiesItems.push(`${y},${x + 1}`)
                }
                liberties[y][x] = libertiesItems
            }
        }
    }

    return liberties
})

// following grids contains the current state of possible moves for each
// player. It is a computed tracking whether a cell is a possible move
// for the player
const whitePossibleMoves = computed(() => {
    const possibleMoves = Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))

    // Loop over all cells
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            possibleMoves[y][x] = checkPossibleMoves(gridState, x, y, 'white')
        }
    }

    return possibleMoves
})
const blackPossibleMoves = computed(() => {
    const possibleMoves = Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))

    // Loop over all cells
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            possibleMoves[y][x] = checkPossibleMoves(gridState, x, y, 'black')
        }
    }

    return possibleMoves
})

const debugState = () => {
    console.debug('Current state:')
    console.debug(
        gridState
            .map((row) =>
                row
                    .map((cell) => {
                        switch (cell) {
                            case 'white':
                                return 'w'
                            case 'black':
                                return 'b'
                            default:
                                return '-'
                        }
                    })
                    .join(' ')
            )
            .join('\n')
    )
    console.debug('Liberties:')
    console.debug(
        libertiesState.value
            .map((row) => row.map((cell) => (cell !== null ? cell.length : '-')).join(' '))
            .join('\n')
    )
    console.log(`Current player: ${currentPlayer.value}`)
    console.debug(
        (currentPlayer.value === 'black' ? blackPossibleMoves : whitePossibleMoves).value
            .map((row) => row.map((cell) => (cell ? 'o' : 'x')).join(' '))
            .join('\n')
    )
}

const currentPlayer = ref('black')

const switchTurn = () => {
    currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
}

const resolveAction = (action) => {
    const opponent = currentPlayer.value === 'white' ? 'black' : 'white'

    console.log(currentPlayer.value === 'black' ? blackPossibleMoves.value : whitePossibleMoves.value)
    let isMoveIllegal = currentPlayer.value === 'black' ? !blackPossibleMoves.value[action.y][action.x] : !whitePossibleMoves.value[action.y][action.x]

    if (isMoveIllegal) {
        alert('Illegal move')
        return false
    }

    gridState[action.y][action.x] = currentPlayer.value

    const adjacentOpponentGroups = [
        findGroup(gridState, action.x - 1, action.y, opponent),
        findGroup(gridState, action.x + 1, action.y, opponent),
        findGroup(gridState, action.x, action.y - 1, opponent),
        findGroup(gridState, action.x, action.y + 1, opponent)
    ].filter((g) => g.length)

    for (const group of adjacentOpponentGroups) {
        if (getGroupLiberties(group) === 0) {
            for (const { x, y } of group) {
                gridState[y][x] = null
            }
        }
    }
    return true
}

watch(gridState, (newGridState) => {
    debugState()
    EventBus.emit('current-grid-state', newGridState)
})

onMounted(() => {
    game.value = StartGame('game-container')

    EventBus.on('current-scene-ready', (currentScene) => {
        emit('current-active-scene', currentScene)
        scene.value = currentScene
    })

    EventBus.on('player-action', ({ action }) => {
        if (resolveAction(action)) {
            switchTurn()
        }
    })

    debugState()

    console.log(currentPlayer.value === 'black' ? blackPossibleMoves.value : whitePossibleMoves.value)
})

onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true)
        game.value = null
    }
})

defineExpose({ scene, game })
</script>

<template>
    <div id="game-container"></div>
    <h2 class="turn">{{ currentPlayer }}'s turn</h2>
</template>

<style scoped>
.turn {
    position: absolute;
    top: 0;
    right: 0;
}
</style>
