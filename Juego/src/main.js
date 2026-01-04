import Phaser from "phaser";
import { HistoriaScene } from "./scenes/HistoriaScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { PauseScene } from "./scenes/PauseScene.js";
import { WinningScene } from "./scenes/WinningScene.js";
import { CreditosScene } from "./scenes/CreditosScene.js";
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 960,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [HistoriaScene, MenuScene, GameScene, PauseScene, WinningScene, CreditosScene],
  backgroundColor: "#1a1a2e"
};

const game = new Phaser.Game(config);
