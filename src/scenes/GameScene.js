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
    this.load.image("coche", "/assets/images/Coche1.png");
    this.load.image("car_red", "/assets/images/Coche2.png");

    // Power Ups
    this.load.image("power_ice", "/assets/images/slow_enemigo.png");
    this.load.image("power_speed", "/assets/images/turbo.png");
    this.load.image("power_slow", "/assets/images/slow.png");

    //Musica
    this.load.audio("bgm", "assets/music/Waluigi Pinball 8-BIT - Mario Kart DS (Smash Bros. Version).mp3")

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
    this.MAX_LAPS = 3;
  }




  create() {
    this.sound.stopAll();
    this.music = this.sound.add("bgm", {loop: true});
    this.music.play();
    this.isPaused = false;
    this.escWasDown = false;
    this.physics.world.resume();

    this.powerUps = this.physics.add.group();

    this.createBackground();
    this.createCheckPoint();
    this.createFinishLine();
    this.createCollisionMap();
    this.setUpPlayers();
    this.setupCollisions();
    

    this.createPowerUp(400, 350, "speed");
    this.createPowerUp(1050, 150, "slow");
    this.createPowerUp(250, 75, "ice");

    this.add
      .text(640, 15, "¡El primero en dar 3 vueltas gana!", {
        fontSize: "bold 24px",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.lapText = this.add.text(16, 40, "", {
  fontSize: "18px",
  color: "#ffffff",
  backgroundColor: "#000000"
}).setDepth(1000);
  }

  createPowerUp(x, y, type) {
  const sprite = this.powerUps.create(x, y, `power_${type}`);
  sprite.type = type;

  sprite.setScale(0.5);
  sprite.body.allowGravity = false;
}
  createCollisionMap(){
    this.collisionMap = this.add.image(0, 0, "mapaColision");
    this.collisionMap.setOrigin(0, 0);
    this.collisionMap.setVisible(false);

  }
  createBackground() {
    this.background = this.add.image(640, 480, "game_background");
    
    this.background.setDisplaySize(1280, 960);
  }

createFinishLine() {
  const x = 800;
  const y = 680;
  const width = 10;
  const height = 120;

  // DEBUG visual
  const g = this.add.graphics();
  g.fillStyle(0xff0000, 0.4);
  g.fillRect(x, y, width, height);

  this.finishLine = this.physics.add
    .staticImage(x + width / 2, y + height / 2, null)
    .setDisplaySize(width, height)
    .setVisible(false);

  this.finishLine.body.setSize(width, height);
  this.finishLine.body.updateFromGameObject();
}

  createCheckPoint() {
  const startX = 700;
  const startY = 30;

  const width = 10;
  const height = 120;

  // DEBUG visual
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 0.4);
  graphics.fillRect(startX, startY, width, height);

  this.CheckPointLine = this.physics.add
    .staticImage(startX + width / 2, startY + height / 2, null)
    .setDisplaySize(width, height)
    .setVisible(false);

  this.CheckPointLine.body.setSize(width, height);
  this.CheckPointLine.body.updateFromGameObject();
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
    if (this.escKey.isDown && !this.escWasDown) {
      this.togglePause();
    }
    
  this.players.forEach((car) => {
     console.log(
  `Jugador: ${car.id} | Vueltas: ${car.laps}/${this.MAX_LAPS}  Paso meta: ${car.passedCheckpoint}`
);
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
applyPowerUp(car, powerUp) {
  switch (powerUp.type) {

    case "speed":

      car.currentSpeed += 80;

      this.time.delayedCall(3000, () => {
        car.currentSpeed = car.isOffRoad
          ? car.offRoadSpeed
          : car.baseSpeed;
      });
      break;

    case "slow":

      car.currentSpeed -= 80;

      this.time.delayedCall(2000, () => {
        car.currentSpeed = car.isOffRoad
          ? car.offRoadSpeed
          : car.baseSpeed;
      });
      break;
      case "ice":

      const otherCar = this.getOtherCar(car);
      if (!otherCar) return;

      const originalSpeed = otherCar.currentSpeed;

      otherCar.currentSpeed -= originalSpeed * 0.4;

      this.time.delayedCall(3000, () => {
        // Restaurar según estado real
        otherCar.currentSpeed = otherCar.isOffRoad
          ? otherCar.offRoadSpeed
          : otherCar.baseSpeed;
      });

      break;
  }
}
  setupCollisions() {
    const car1 = this.players.get("player1");
    const car2 = this.players.get("player2");
    this.physics.add.collider(car1, car2);

    this.players.forEach((car) => {
  this.physics.add.overlap(
    car,
    this.powerUps,
    (car, powerUp) => {
      this.applyPowerUp(car, powerUp);
      powerUp.destroy();
    }
  );
});

    this.players.forEach((player) => {
  this.physics.add.overlap(player, this.CheckPointLine, () => {
    if (!player.passedCheckpoint) {
      player.passedCheckpoint = true;
    }
  });
});

  this.players.forEach((player) => {
  this.physics.add.overlap(player, this.finishLine, () => {
    if (player.passedCheckpoint && player.laps < this.MAX_LAPS) {
      player.passedCheckpoint = false;
      player.laps++;
    }
    if(player.passedCheckpoint && player.laps === this.MAX_LAPS){
      this.physics.pause();
      player.setTint(0x00ff00);
      this.scene.start("WinningScene", { winner: player});
      }
  });
});

  };
getOtherCar(currentCar) {
  for (const car of this.players.values()) {
    if (car !== currentCar) return car;
  }
  return null;
}
};



