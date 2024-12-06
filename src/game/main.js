import { Boot } from './scenes/Boot'
import { Game } from './scenes/Game'
import { MainMenu } from './scenes/MainMenu'
import Phaser from 'phaser'
import { Preloader } from './scenes/Preloader'

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: Phaser.AUTO,
  width: 20 * 32,
  height: 20 * 32,
  parent: 'game-container',
  backgroundColor: 'black',
  scene: [Boot, Preloader, MainMenu, Game]
}

const StartGame = (parent) => {
  return new Phaser.Game({ ...config, parent })
}

export default StartGame

