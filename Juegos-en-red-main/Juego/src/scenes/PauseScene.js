import Phaser from "phaser";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create(data) {
    this.add.rectangle(640, 480, 1280, 960, 0x000000, 0.7);

    this.add
      .text(640, 320, "Juego en pausa", {
        fontSize: "48px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    const resumeBtn = this.add
      .text(640, 512, "Reanudar", {
        fontSize: "32px",
        color: "#00ff00"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => resumeBtn.setColor("#00ff88"))
      .on("pointerout", () => resumeBtn.setColor("#00ff00"))
      .on("pointerdown", () => {
        this.scene.stop();
        this.scene.resume(data.originalScene);
        this.scene.get(data.originalScene).resume();
      });

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
        this.scene.stop(data.originalScene);
        this.scene.start("MenuScene");
      });
  }
}
