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
    }, 1)
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
    }, step ?? 1)
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

    EventBus.on('game-winner', (winner) => {
        console.log('game-winner', winner)
        state.updateVictories(winner.toLowerCase())
        setTimeout(() => {
            state.newGame()
            EventBus.emit('new-game')
        }, 1)
    })

    EventBus.on('new-game', () => {
        gameOver.value = false
        window.testGameLoop()
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
        <div class="player-info">
            Captured:
            <div class="player white">
                <span>White</span>
                <span>{{ state.whiteCaptured }}</span>
            </div>
            <div class="player black">
                <span>Black</span>
                <span>{{ state.blackCaptured }}</span>
            </div>
        </div>
        <div class="player-info">
            Victories:
            <div class="player white">
                <span>White</span>
                <span>{{ state.whiteVictories }}</span>
            </div>
            <div class="player black">
                <span>Black</span>
                <span>{{ state.blackVictories }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
#game-container {
    width: 480px;
    height: 480px;
    position: relative;
    border: solid 2px white;
}

.ui {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #333;
    color: white;
}
</style>