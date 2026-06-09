import Phaser from "phaser";

export class HistoriaScene extends Phaser.Scene {
  constructor() {
    super("HistoriaScene");
  }
  preload(){
    this.load.image("fondo_hist", "/assets/images/hist.jpeg");
    this.load.image("boton", "/assets/images/boton.png");
    
  }
  create() {
    
    this.createBackground();
    this.add.rectangle(650, 1075, 1000, 600, "#000000").setOrigin(0.5);
    this.add.text(650, 800, "El famoso piloto Leonardo Sonso se encuentra cerca de su 33º copa",{
      fontSize: "bold 25px",
      color: "#00FFFF"
    }).setOrigin(0.5)
    this.add.text(650, 830, "Tras cambiar a una nueva carrocería, el triunfo parece inevitable",{
      fontSize: "bold 25px",
      color: "#00FFFF"
    }).setOrigin(0.5)

    this.add.text(650, 900, "Pulsa para continuar",{
            fontSize: "bold 75px",
            color: "#00FF00"
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true}).on("pointerdown", () => {
            this.scene.start("HistoriaScene2");
        })
  }
  createBackground() {
    this.background = this.add.image(640, 480, "fondo_hist");
    this.background.setDisplaySize(1280, 960);
  }

}

