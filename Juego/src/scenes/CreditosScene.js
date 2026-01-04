import Phaser from "phaser";

export class CreditosScene extends Phaser.Scene {
  constructor() {
    super("CreditosScene");
  }

  create() {
    this.add.rectangle(640, 480, 1280, 960, 0x000000, 0.7);

    this.add
      .text(640, 320, "Juego hecho por", {
        fontSize: "48px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
    this.add
      .text(650, 500, "David Santos, Jorge Sanchez, ", {
        fontSize: "48px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

      this.add
      .text(640, 570, "Mario Rodrigo, Jiajie Liu. ", {
        fontSize: "48px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
    const menuBtn = this.add
      .text(640, 800, "Volver al menú principal", {
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
