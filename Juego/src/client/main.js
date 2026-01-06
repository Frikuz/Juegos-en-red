import Phaser from "phaser";
import { HistoriaScene } from "./scenes/HistoriaScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { PauseScene } from "./scenes/PauseScene.js";
import { WinningScene } from "./scenes/WinningScene.js";
import { CreditosScene } from "./scenes/CreditosScene.js";
import {PreHistoriaScene} from "./scenes/PreHistoriaScene.js";
import { HistoriaScene2 } from "./scenes/HistoriaScene2.js";

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
  scene: [PreHistoriaScene, MenuScene, HistoriaScene, GameScene, PauseScene, WinningScene, CreditosScene, HistoriaScene2],
  backgroundColor: "#1a1a2e"
};

const game = new Phaser.Game(config);
