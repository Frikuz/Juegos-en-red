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
      .text(650, 400, "David Santos, Jorge Sanchez, ", {
        fontSize: "48px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

      this.add
      .text(640, 450, "Mario Rodrigo, Jiajie Liu. ", {
        fontSize: "48px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
      this.add
      .text(640, 555, "Musica cortesía de: ", {
        fontSize: "48px",
        color: "#ffffff"
      }).setOrigin(0.5);
      this.add
      .text(640, 630, "F1 theme 8-bit version, de Victoresto 99 en YouTube", {
        fontSize: "40px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
      this.add
      .text(640, 680, "Waluigi Pinball 8-BIT - Mario Kart DS", {
        fontSize: "40px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
      this.add
      .text(640, 710, "(Smash Bros. Version) de Loeder en Youtube", {
        fontSize: "40px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
      
    const menuBtn = this.add
      .text(640, 900, "Volver al menú principal", {
        fontSize: "32px",
        color: "#00ff00"
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
