import { Command } from "./Command.js";

export class PauseGameCommand extends Command {
  constructor(gameScene, isPaused) {
    super();
    this.gameScene = gameScene;
    this.isPaused = isPaused;
  }

  execute() {
    this.gameScene.setPauseState(this.isPaused);
  }
}
