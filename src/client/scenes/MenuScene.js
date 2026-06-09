import Phaser from "phaser";
import { connectionManager } from "../services/ConnectionManager.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("fondo", "/assets/images/Menu.png");
    this.load.image("logo", "/assets/images/logo.png");
    this.load.image("boton", "/assets/images/boton.png");
  }

  create() {
    this.createBackground();
    this.createBoton();
    this.createConnectionIndicator();

    this.add
      .text(350, 660, "J1: WASD   J2: Flechas   ESC: Pausa", {
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
    const escenas = ["GameScene", "LoginScene", "CreditosScene", "ConfiguracionScene"];

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

  createConnectionIndicator() {
    this.connectionText = this.add.text(25, 625, "Servidor: comprobando...", {
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 6 }
    }).setDepth(1000);

    this.connectedText = this.add.text(25, 665, "Usuarios conectados: 0", {
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 6 }
    }).setDepth(1000);

    this.connectionListener = (data) => {
      if (data.connected) {
        this.connectionText.setText("Servidor: conectado");
        this.connectionText.setColor("#00ff88");
        this.connectedText.setText(`Usuarios conectados: ${data.count}`);
      } else {
        this.connectionText.setText("Servidor: desconectado");
        this.connectionText.setColor("#ff5555");
        this.connectedText.setText("Usuarios conectados: 0");
      }
    };

    connectionManager.addListener(this.connectionListener);
    connectionManager.checkConnection();

    this.events.once("shutdown", () => {
      connectionManager.removeListener(this.connectionListener);
    });
  }
}
