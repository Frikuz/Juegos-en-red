import Phaser from "phaser";
import { Car } from "../entities/Car.js";
import { CommandProcessor } from "../commands/CommandProcessor.js";
import { MoveCarCommand } from "../commands/MoveCarCommand.js";
import { PauseGameCommand } from "../commands/PauseGameCommand.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.obstacles = [];
    this.obstacleGroup = null;
  }

  preload() {
    console.log("🔄 Cargando recursos...");

    // Fondo
    this.load.image("game_background", "/assets/images/fondo.png");

    //Colisiones
    this.load.image('mapaColision', '/assets/images/fondo_colisiones.jpeg');
    
    // Coches
    this.load.image("coche", "/assets/images/coche.png");
    this.load.image("car_red", "/assets/images/coche2.png");

    // Evento de carga fallida
    this.load.on('loaderror', (file) => {
      console.warn(`⚠️ No se pudo cargar: ${file.key} (${file.src})`);
    });
  }


  init() {
    this.players = new Map();
    this.inputMappings = [];
    this.isPaused = false;
    this.escWasDown = false;
    this.processor = new CommandProcessor();
  }




  create() {
    this.isPaused = false;
    this.escWasDown = false;
    this.physics.world.resume();

    this.createBackground();
    this.createCollisionMap();
    this.createCheckPoint();
    this.setUpPlayers();
    this.setupCollisions();

    this.add
      .text(640, 64, "Llega primero a la meta", {
        fontSize: "24px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
  }
  createCollisionMap(){
    this.collisionMap = this.add.image(0, 0, "mapaColision");
    this.collisionMap.setOrigin(0, 0);
    this.collisionMap.setVisible(true);

  }
  createBackground() {
    // CORREGIR: usar el mismo nombre que en preload
    this.background = this.add.image(640, 480, "game_background");
    
    this.background.setDisplaySize(1280, 960);

    // Si la imagen no carga, crear fondo de respaldo
    if (!this.textures.exists("game_background")) {
      this.createFallbackBackground();
    }
  }

  createFinishLine() {
  const lineHeight = 10;
  const startX = 800;
  const startY = 680;

  // DIBUJO VISUAL
  const g = this.add.graphics();
  g.fillStyle(0xffffff);

  for (let i = 0; i < 4; i++) {
    g.fillRect(startX, startY + i * 25, 15, lineHeight);
  }

  
  const sensorWidth = 3;      
  const sensorHeight = 25 * 4; 

  this.finishLine = this.add.rectangle(
    startX + sensorWidth / 2,
    startY + sensorHeight / 2,
    sensorWidth,
    sensorHeight,
  );

  this.physics.add.existing(this.finishLine);
  this.finishLine.body.setImmovable(true);
}
  createCheckPoint() {
  const lineHeight = 10;
  const startX = 700;
  const startY = 30;
  
  const sensorWidth = 3;      
  const sensorHeight = 25 * 4; 

  this.CheckPointLine = this.add.rectangle(
    startX + sensorWidth / 2,
    startY + sensorHeight / 2,
    sensorWidth,
    sensorHeight,
  );

  this.physics.add.existing(this.CheckPointLine);
  this.CheckPointLine.body.setImmovable(true);
}
  setUpPlayers() {
    const car1 = new Car(this, "player1", 740, 715, "coche");
    const car2 = new Car(this, "player2", 750, 745, "car_red");

    this.players.set("player1", car1);
    this.players.set("player2", car2);

    const InputConfig = [
      {
        playerId: "player1",
        upKey: "W",
        downKey: "S",
        leftKey: "A",
        rightKey: "D"
      },
      {
        playerId: "player2",
        upKey: "UP",
        downKey: "DOWN",
        leftKey: "LEFT",
        rightKey: "RIGHT"
      }
    ];

    this.inputMappings = InputConfig.map((config) => ({
      playerId: config.playerId,
      upKeyObj: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes[config.upKey]
      ),
      downKeyObj: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes[config.downKey]
      ),
      leftKeyObj: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes[config.leftKey]
      ),
      rightKeyObj: this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes[config.rightKey]
      )
    }));
  }


  setPauseState(isPaused) {
    this.isPaused = isPaused;
    if (isPaused) {
      this.scene.launch("PauseScene", { originalScene: "GameScene" });
      this.scene.pause();
    } else {
      this.isPaused = false;
      this.physics.resume();
    }
  }

  resume() {
    this.isPaused = false;
    this.physics.resume();
  }

  togglePause() {
    const newPauseState = !this.isPaused;
    this.processor.process(new PauseGameCommand(this, newPauseState));
  }

  update() {
  this.players.forEach((car) => {
    const x = Math.floor(car.x);
    const y = Math.floor(car.y);

    const color = this.textures.getPixel(x, y, "mapaColision");
    if (!color) return;

    // BLANCO = fuera de pista
    if (color.r === 247 && color.g === 247 && color.b === 247) {
      car.setOffRoad(true);
    }
    // NEGRO = pista
    else {
      car.setOffRoad(false);
    }
  });

  // INPUT
  this.inputMappings.forEach((mapping) => {
    const car = this.players.get(mapping.playerId);
    if (!car) return;

    let dirX = 0;
    let dirY = 0;

    if (mapping.upKeyObj.isDown) dirY = 1;
    else if (mapping.downKeyObj.isDown) dirY = -1;

    if (mapping.leftKeyObj.isDown) dirX = -1;
    else if (mapping.rightKeyObj.isDown) dirX = 1;

    this.processor.process(
      new MoveCarCommand(this, car, dirX, dirY)
    );
  });
}
  setupCollisions() {
    const car1 = this.players.get("player1");
    const car2 = this.players.get("player2");
    this.physics.add.collider(car1, car2);

    this.players.forEach(player => {
      this.physics.add.collider(player, this.obstacles, () => {

        player.setVelocity(0, 0);
        player.setTint(0xff0000);
        this.time.delayedCall(150, () => player.clearTint());
      });
    });
    this.players.forEach((player, playerId) => {
      this.physics.add.overlap(player, this.CheckPointLine, () => {
        this.createFinishLine();
        delete(this.CheckPointLine);
        this.setupCollisions();
      });
    });

    this.players.forEach((player, playerId) => {
      this.physics.add.overlap(player, this.finishLine, () => {
        this.physics.pause();

        const winner = playerId;

        player.setTint(0x00ff00);

        this.scene.start("WinningScene", { winner: winner });
      });
    });
  };

};



