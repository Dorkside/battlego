<script setup>
import { onMounted, onUnmounted, ref, watch, reactive, computed } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'
import { useGameState } from '../stores/gameState'

const state = useGameState()

let test = reactive(false);

window.play = (x, y) => {
    EventBus.emit('player-action', { action: { x, y } })
}

window.testGame = () => {
    test = true;
    setTimeout(() => {
        if (!state.gameOver) {
            try {
                const possibleMoves = state.currentPlayer === 'white' ? state.whitePossibleMoves : state.blackPossibleMoves
                const possibleMoveList = possibleMoves.flatMap((row, y) => row.map((cell, x) => cell ? { x, y } : null).filter(Boolean))
                const randomMove = possibleMoveList[Math.floor(Math.random() * possibleMoveList.length)]
                window.play(randomMove.x, randomMove.y)
                window.testGame()
            } catch (e) {
                window.testGame()
            }
        } else {
            state.newGame()
            window.testGame()
        }
    }, 0)
}

// check for win conditions
watch(() => state.whitePossibleMoves, (newValue) => {
    if (newValue.every(row => row.every(cell => !cell))) {
        state.gameOver = true
    }
})
watch(() => state.blackPossibleMoves, (newValue) => {
    if (newValue.every(row => row.every(cell => !cell))) {
        state.gameOver = true
    }
})

watch(() => state.gameOver, (newValue) => {
    if (newValue) {
        const winner = state.whiteScore > state.blackScore ? 'white' : 'black'
        console.log("White:", state.whiteScore, "Black:", state.blackScore)
        state.updateVictories(winner)
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
            Score:
            <div class="player white">
                <span>White</span>
                <span>{{ state.whiteScore }}</span>
            </div>
            <div class="player black">
                <span>Black</span>
                <span>{{ state.blackScore }}</span>
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
    flex-direction: column;
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