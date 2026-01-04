import Phaser from "phaser";

export class HistoriaScene extends Phaser.Scene {
  constructor() {
    super("HistoriaScene");
  }
  preload(){
    this.load.image("logo", "/assets/images/logo.png");
  }
  create() {
    
    this.createBackground();
    const localBtn = this.add
      .text(640, 750, "Jugar en local", {
        fontSize: "24px",
        color: "#00ff00"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => localBtn.setColor("#00ff88"))
      .on("pointerout", () => localBtn.setColor("#00ff00"))
      .on("pointerdown", () => {
        this.scene.start("GameScene");
      });

       const buttonCredits = this.add
      .text(100, 900, "Creditos", {
        fontSize: "24px",
        color: "#00ff00"
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => localBtn.setColor("#00ff88"))
      .on("pointerout", () => localBtn.setColor("#00ff00"))
      .on("pointerdown", () => {
        this.scene.start("CreditosScene");
      });

    this.add
      .text(640, 820, "J1: WASD   J2: Flechas   ESC: Pausa", {
        fontSize: "30px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
  }
  createBackground() {
    this.background = this.add.image(640, 400, "logo");
    this.background.setDisplaySize(1024, 786);
  }
}
