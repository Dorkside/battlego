<script setup>
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import PhaserGame from './game/PhaserGame.vue';

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();

const changeScene = () => {

    const scene = toRaw(phaserRef.value.scene);

    if (scene)
    {
        //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
        scene.changeScene();
    }

}

//  This event is emitted from the PhaserGame component:
const currentScene = (scene) => {


}
</script>

<template>
    <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
    <div>
        <div>
            <button class="button" @click="changeScene">Change Scene</button>
        </div>
    </div>
</template>
