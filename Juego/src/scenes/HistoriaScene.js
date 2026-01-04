import Phaser from "phaser";

export class HistoriaScene extends Phaser.Scene {
  constructor() {
    super("HistoriaScene");
  }
  preload(){
    this.load.image("fondo", "/assets/images/Menu.png");
    this.load.image("logo", "/assets/images/logo.png");
    this.load.image("boton", "/assets/images/boton.png");
  }
  create() {
    
    this.createBackground();
    this.createBoton();

    this.add
      .text(350, 60, "J1: WASD   J2: Flechas   ESC: Pausa", {
        fontSize: "30px",
        color: "#ffffff"
      })
      .setOrigin(0.5);
  }
  createBackground() {
    this.background = this.add.image(640, 480, "fondo");
    this.background.setDisplaySize(1280, 960);
    this.logo = this.add.image(1050, 750, "logo");
    this.logo.setDisplaySize(this.logo.width * 0.4, this.logo.height * 0.4);
  }

 createBoton() {
  this.botones = [];
  const posicionesY = [200, 300, 400, 500];
  const nombres = ["Jugar Local", "Jugar Online", "Creditos", "Configuración"];
  const escenas = ["GameScene", "GameSceneOnline", "CreditosScene", "ConfiguracionScene"];

  posicionesY.forEach((y, i) => {
    const btnImg = this.add.image(1100, y, "boton").setInteractive({ useHandCursor: true });
    const btnText = this.add.text(1100, y, nombres[i], {
      fontSize: "30px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.botones.push({ btnImg, btnText });

    btnImg.on("pointerdown", () => {
      this.scene.start(escenas[i]);
    });

    btnImg.on("pointerover", () => btnText.setColor("#00ff88"));
    btnImg.on("pointerout", () => btnText.setColor("#ffffff"));
  });
}
}
