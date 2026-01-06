import Phaser from "phaser";

export class HistoriaScene2 extends Phaser.Scene {
  constructor() {
    super("HistoriaScene2");
  }
  preload(){
    this.load.image("fondo_hist2", "/assets/images/hist2.jpeg");
    this.load.image("boton", "/assets/images/boton.png");
    
  }
  create() {
    
    this.createBackground();
    this.add.rectangle(650, 1075, 1000, 600, "#000000").setOrigin(0.5);
    this.add.text(650, 800, "Pero su mayor rival, Carlos Santos, le pisa los talones",{
      fontSize: "bold 25px",
      color: "#00FFFF"
    }).setOrigin(0.5)
    this.add.text(650, 830, "¿Qué piloto se lazará con la victoria de la final?",{
      fontSize: "bold 25px",
      color: "#00FFFF"
    }).setOrigin(0.5)

    this.add.text(650, 900, "Pulsa para continuar",{
            fontSize: "bold 75px",
            color: "#00FF00"
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true}).on("pointerdown", () => {
            this.scene.start("MenuScene");
        })
  }
  createBackground() {
    this.background = this.add.image(640, 480, "fondo_hist2");
    this.background.setDisplaySize(1280, 960);
  }

}