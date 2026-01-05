import Phaser from "phaser";

export class WinningScene extends Phaser.Scene {
  constructor() {
    super("WinningScene");
  }
  init(data) {
    // data.winner es el jugador que pasamos desde GameScene
    this.winner = data.winner;
  }
  create() {
    
    this.add.rectangle(640, 480, 1280, 960, 0x000000, 0.7);
    this.add.text(640, 400, `${this.winner.id} gana la carrera!`, {
        fontSize: "40px",
        color: "#00ff00"
      })
      .setOrigin(0.5);

    const menuBtn = this.add
      .text(640, 640, "Volver al menú principal", {
        fontSize: "32px",
        color: "#ffffff"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => menuBtn.setColor("#ff8888"))
      .on("pointerout", () => menuBtn.setColor("#ffffff"))
      .on("pointerdown", () => {
        this.scene.start("MenuScene");
      });
  }

}
