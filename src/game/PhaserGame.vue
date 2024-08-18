<script setup>
import { onMounted, onUnmounted, ref, reactive, watch, computed } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';

// Save the current scene instance
const scene = ref();
const game = ref();

const emit = defineEmits(['current-active-scene']);

const gridState = reactive(Array(5)
    .fill(null)
    .map(() => Array(5).fill(null)))

const libertiesState = computed(() => {
    const liberties = Array(5)
        .fill(null)
        .map(() => Array(5).fill(null))

    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            let libertiesCount = 0
            if (gridState[y][x] !== null) {
                const p = gridState[y][x]
                if (y > 0 && gridState[y - 1][x] === null) {
                    libertiesCount++
                }
                if (y < 4 && gridState[y + 1][x] === null) {
                    libertiesCount++
                }
                if (x > 0 && gridState[y][x - 1] === null) {
                    libertiesCount++
                }
                if (x < 4 && gridState[y][x + 1] === null) {
                    libertiesCount++
                }
                liberties[y][x] = libertiesCount
            }
        }
    }

    return liberties
})

const dfs = (x, y, visited, group, player) => {
    if (x < 0 || x >= 5 || y < 0 || y >= 5) {
        return
    }
    if (visited[y][x]) {
        return
    }
    visited[y][x] = true
    if (gridState[y][x] === null) {
        return
    }
    if (gridState[y][x] === player) {
        group.push({ x, y })
        dfs(x - 1, y, visited, group, player)
        dfs(x + 1, y, visited, group, player)
        dfs(x, y - 1, visited, group, player)
        dfs(x, y + 1, visited, group, player)
    }
}

const findGroup = (x, y, player) => {
    const group = []
    const visited = Array(5)
        .fill(null)
        .map(() => Array(5).fill(false))

    dfs(x, y, visited, group, player)
    return group
}

const debugState = () => {
    console.debug(gridState.map(row => row.map(cell => {
        switch (cell) {
            case 'white':
                return 'w'
            case 'black':
                return 'b'
            default:
                return '-'
        }
    }).join(' ')).join('\n'))
    console.debug(libertiesState.value.map(row => row.map(cell => cell !== null ? cell : '-').join(' ')).join('\n'))
}

const currentPlayer = ref('black')

const resolveAction = (action) => {
    // Check if the cell is already occupied
    if (gridState[action.y][action.x] !== null) {
        alert("Illegal move")
        return // Cell is occupied, do nothing
    }
    gridState[action.y][action.x] = currentPlayer.value
}

watch(gridState, (newGridState) => {
    debugState()
    EventBus.emit('current-grid-state', newGridState);
})

onMounted(() => {
    game.value = StartGame('game-container');

    EventBus.on('current-scene-ready', (currentScene) => {
        emit('current-active-scene', currentScene);
        scene.value = currentScene;
    });

    EventBus.on('player-action', ({ action }) => {
        resolveAction(action);
        const group = findGroup(action.x, action.y, currentPlayer.value);
        console.debug("group", group);
        currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
    });
});

onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }
});

defineExpose({ scene, game });
</script>

<template>
    <div id="game-container"></div>
</template>