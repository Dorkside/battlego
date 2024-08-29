<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { EventBus } from './EventBus'
import StartGame from './main'

import { state, findGroup, getGroupLiberties } from '../shared';

// Save the current scene instance
const scene = ref()
const game = ref()

const emit = defineEmits(['current-active-scene'])

const switchTurn = () => {
    state.updateCurrentPlayer(state.currentPlayer === 'white' ? 'black' : 'white')
}

const resolveAction = (action) => {
    if (state) {
        const opponent = state.currentPlayer === 'white' ? 'black' : 'white'

        let isMoveIllegal = state.currentPlayer === 'black' ? !state.blackPossibleMoves[action.y][action.x] : !state.whitePossibleMoves[action.y][action.x]

        if (isMoveIllegal) {
            console.warn('Illegal move')
            return false
        }

        state.updateGridState(action.x, action.y, state.currentPlayer)

        const adjacentOpponentGroups = [
            findGroup(state.gridState, action.x - 1, action.y, opponent),
            findGroup(state.gridState, action.x + 1, action.y, opponent),
            findGroup(state.gridState, action.x, action.y - 1, opponent),
            findGroup(state.gridState, action.x, action.y + 1, opponent)
        ].filter((g) => g.length)

        for (const group of adjacentOpponentGroups) {
            if (getGroupLiberties(group, state.libertiesState) === 0) {
                for (const { x, y } of group) {
                    state.updateGridState(x, y, null)
                }
            }
        }
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
    <h2 class="turn">{{ currentPlayer }}'s turn</h2>
</template>

<style scoped>
.turn {
    position: absolute;
    top: 0;
    right: 0;
}
</style>
