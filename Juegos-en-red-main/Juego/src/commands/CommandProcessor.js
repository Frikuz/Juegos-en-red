export class CommandProcessor {
  constructor() {
    this.players = new Map();
    this.gameScene = null;
  }

  setPlayers(players) {
    this.players = players;
  }

  setGameScene(gameScene) {
    this.gameScene = gameScene;
  }

  process(command) {
    command.execute();
    // En un futuro, aquí se podría enviar el comando por red.
  }
}
