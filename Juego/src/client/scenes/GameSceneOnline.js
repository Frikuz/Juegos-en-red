import Phaser from "phaser";
import { GameScene } from "./GameScene.js";
import { Car } from "../entities/Car.js";

export class GameSceneOnline extends GameScene {
  constructor() {
    super("GameSceneOnline");
  }

  init() {
    super.init(); // Inicializa variables de GameScene
    this.myRole = null; // 'player1' o 'player2'
    this.opponentRole = null;
    this.waitingText = null;
    this.gameStarted = false;
  }

  create() {
    // 1. Cargar fondo y mapa
    this.createBackground();
    this.createCollisionMap();
    this.createCheckPoint();
    this.createFinishLine();

     this.powerUps = this.physics.add.group();

    this.createPowerUp(400, 350, this.poderes[0]);
    this.createPowerUp(1050, 150, this.poderes[2]);
    this.createPowerUp(250, 75,this.poderes[1]);
    this.createPowerUp(250, 700, this.poderes[0]);
    this.createPowerUp(1100, 650,this.poderes[0]);

    


    // --- CORRECCIÓN: Definir la tecla ESC para evitar el error en super.update() ---
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    // ------------------------------------------------------------------------------

    this.sound.stopAll();
    this.music = this.sound.add("bgm", { loop: true });
    this.music.play();

    this.waitingText = this.add.text(640, 480, "Conectando al servidor...", {
      fontSize: "40px",
      color: "#ffffff",
      backgroundColor: "#000000"
    }).setOrigin(0.5).setDepth(2000);

    // 3. Iniciar conexión WebSocket
    this.setupSocket();
  }

   createPowerUp(x, y, type) {
  const sprite = this.powerUps.create(x, y, `power_${type}`);
  sprite.type = type;

  sprite.setScale(0.5);
  sprite.body.allowGravity = false;
}
  setupSocket() {
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onopen = () => {
      this.waitingText.setText("Buscando oponente...");
      this.socket.send(JSON.stringify({ type: 'joinQueue' }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleServerMessage(data);
    };

    this.socket.onclose = () => {
      this.waitingText.setText("Desconectado del servidor").setVisible(true);
    };
  }

  handleServerMessage(data) {
    switch (data.type) {
      case 'gameStart':
        this.myRole = data.role;
        this.opponentRole = this.myRole === 'player1' ? 'player2' : 'player1';

        this.startGame();
        break;

      case 'playerUpdate':
        if (this.gameStarted) {
          this.updateOpponent(data);
        }
        break;

      case 'playerHit':
        const myCar = this.players.get(this.myRole);
        if (myCar) {
          // Aplicamos la fuerza del golpe recibido
          myCar.setVelocity(data.velocityX, data.velocityY);

          console.log("¡Me han golpeado!");
          // Feedback visual
          myCar.setTint(0xff0000);
          this.time.delayedCall(200, () => myCar.clearTint());
        }
        break;

      case 'gameOver':
        const winnerCar = data.winner === this.myRole
          ? this.players.get(this.myRole)
          : this.players.get(this.opponentRole);
        this.scene.start("WinningScene", { winner: winnerCar });
        this.socket.close();
        break;

      case 'opponentDisconnected':
        this.waitingText.setText("Oponente desconectado").setVisible(true);
        this.physics.pause();
        break;
    }
  }

  startGame() {
    this.waitingText.setVisible(false);
    this.gameStarted = true;

    // Crear coches
    const car1 = new Car(this, "player1", 740, 715, "coche");
    const car2 = new Car(this, "player2", 750, 745, "car_red");

    // Activar físicas
    this.physics.world.enable([car1, car2]);
    car1.setCollideWorldBounds(true);
    car2.setCollideWorldBounds(true);

    this.players.set("player1", car1);
    this.players.set("player2", car2);

    // Configurar colisiones
    this.setupCollisions();

    // Inputs
    this.setupMyInput();
  }

  setupCollisions() {
    // 1. Recuperamos los coches
    const myCar = this.players.get(this.myRole);
    const opponentCar = this.players.get(this.opponentRole);

    this.lastHitTime = 0;

    // --- COLISIÓN ENTRE COCHES (CORREGIDO: Solo un bloque) ---
    this.physics.add.collider(myCar, opponentCar, () => {
      const now = Date.now();

      // Solo procesamos el golpe si han pasado 500ms desde el último y voy rápido
      // Esto evita el "spam" de mensajes
      if (now - this.lastHitTime > 500 && myCar.body.speed > 20) {

        this.lastHitTime = now; // Resetear timer

        // Enviamos el golpe al servidor
        this.socket.send(JSON.stringify({
          type: 'playerHit',
          velocityX: myCar.body.velocity.x * 1.2, // Fuerza extra
          velocityY: myCar.body.velocity.y * 1.2
        }));

        // Rebote local inmediato
        myCar.setVelocity(myCar.body.velocity.x * -0.5, myCar.body.velocity.y * -0.5);
      }
    });

    // --- OTRAS COLISIONES (PowerUps, Checkpoints, Meta) ---
    this.players.forEach((car) => {
      
      // PowerUps con Respawn
      this.physics.add.overlap(car, this.powerUps, (car, powerUp) => {
          if (!powerUp.active) return; // Si está invisible, no hacer nada

          this.applyPowerUp(car, powerUp);

          // Desactivar y ocultar (en lugar de destroy)
          powerUp.disableBody(true, true);

          // Reaparecer a los 2.5 segundos
          this.time.delayedCall(2500, () => {           
            powerUp.enableBody(true, powerUp.x, powerUp.y, true, true);
          });
        });

      // Checkpoints
      this.physics.add.overlap(car, this.CheckPointLine, () => {
        if (!car.passedCheckpoint) car.passedCheckpoint = true;
      });

      // Meta
      this.physics.add.overlap(car, this.finishLine, () => {
        if (car.passedCheckpoint && car.laps < this.MAX_LAPS) {
          car.passedCheckpoint = false;
          car.laps++;
          // Si es mi coche, aviso de que he cruzado o ganado
          if (car === myCar && car.laps >= this.MAX_LAPS) {
            this.socket.send(JSON.stringify({ type: 'raceFinish' }));
          }
        }
      });
    });
  }

  setupMyInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update() {
    if (!this.gameStarted) return;

    const myCar = this.players.get(this.myRole);
    if (!myCar) return;

    // 1. Movimiento local
    this.handleLocalMovement(myCar);

    // 2. Enviar posición al servidor
    this.socket.send(JSON.stringify({
      type: 'playerMove',
      x: myCar.x,
      y: myCar.y,
      angle: myCar.angle,
      speed: myCar.currentSpeed
    }));

    // 3. Chequeo de victoria redundante por seguridad
    if (myCar.laps >= this.MAX_LAPS) {
      this.socket.send(JSON.stringify({ type: 'raceFinish' }));
    }

    super.update();
  }

  handleLocalMovement(car) {
    const speed = car.currentSpeed;
    let dirY = 0;
    let dirX = 0;

    if (this.cursors.up.isDown || this.keys.w.isDown) dirY = 1;
    else if (this.cursors.down.isDown || this.keys.s.isDown) dirY = -1;

    if (this.cursors.left.isDown || this.keys.a.isDown) dirX = -1;
    else if (this.cursors.right.isDown || this.keys.d.isDown) dirX = 1;

    // Aplicar física
    if (dirX !== 0) car.angle += dirX * 1.5;

    if (dirY !== 0) {
      this.physics.velocityFromRotation(
        Phaser.Math.DegToRad(car.angle),
        speed * dirY,
        car.body.velocity
      );
    }
  }

  updateOpponent(data) {
    const opponent = this.players.get(this.opponentRole);
    if (!opponent) return;

    // Rotación directa
    opponent.setRotation(Phaser.Math.DegToRad(data.angle));

    // Interpolación de posición para evitar que se atraviesen
    const distance = Phaser.Math.Distance.Between(opponent.x, opponent.y, data.x, data.y);

    if (distance > 150) {
      // Si está muy lejos (lag), teletransportar
      opponent.setPosition(data.x, data.y);
    } else if (distance > 10) {
      // Si está cerca, moverse hacia allá físicamente
      this.physics.moveTo(opponent, data.x, data.y, data.speed + 100);
    } else {
      // Si está en su sitio, parar
      opponent.body.setVelocity(0);
      if (distance < 2) opponent.setPosition(data.x, data.y);
    }
  }
}