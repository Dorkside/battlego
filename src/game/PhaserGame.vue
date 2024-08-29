<script setup>
import { onMounted, onUnmounted, ref, watch, reactive, computed } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'
import { useGameState } from '../stores/gameState'

const state = useGameState()

let gameOver = ref(false)

window.play = (x, y) => {
    EventBus.emit('player-action', { action: { x, y } })
}

window.testGame = () => {
    setTimeout(() => {
        window.testGameLoop()
    }, 100)
}

window.testGameLoop = (step) => {
    setTimeout(() => {
        if (!gameOver.value) {
            try {
                window.play(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5))
                window.testGameLoop(100)
            } catch (e) {
                window.testGameLoop(0)
            }
        }
    }, step ?? 100)
}

// check for win conditions
watch(() => state.whitePossibleMoves, (newValue) => {
    if (newValue.every(row => row.every(cell => !cell))) {
        EventBus.emit('game-over')
        gameOver.value = true
    }
})
watch(() => state.blackPossibleMoves, (newValue) => {
    if (newValue.every(row => row.every(cell => !cell))) {
        EventBus.emit('game-over')
        gameOver.value = true
    }
})

// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits(['current-active-scene'])

const switchTurn = () => {
    state.updateCurrentPlayer(state.currentPlayer === 'white' ? 'black' : 'white')
}

const resolveAction = (action) => {
    if (state) {
        let isMoveIllegal = state.currentPlayer === 'black' ? !state.blackPossibleMoves[action.y][action.x] : !state.whitePossibleMoves[action.y][action.x]
        if (isMoveIllegal) {
            throw new Error('Illegal move')
        }

        state.updateGridState(action.x, action.y, state.currentPlayer)
        const opponent = state.currentPlayer === 'white' ? 'black' : 'white'
        state.removeDeadGroups(opponent, action)
        return true
    } else {
        throw new Error('State is not defined')
    }
}

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

    EventBus.on('player-hover', (cell) => {
        state.updateHoverState(cell)
    })
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
    <!-- considering #game-container is a 480x480px container for the graphics of the game, the rest here is just static ui elements -->
    <div class="ui">
        <div class="player-turn">
            <span v-if="state.currentPlayer === 'white'">White's turn</span>
            <span v-else>Black's turn</span>
        </div>
        <div class="player-info">
            <div class="player white">
                <span>White</span>
                <span>{{ state.whiteCaptured }}</span>
            </div>
            <div class="player black">
                <span>Black</span>
                <span>{{ state.blackCaptured }}</span>
            </div>
        </div>
    </div>
</template>
