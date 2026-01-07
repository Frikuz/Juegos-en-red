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

    // --- CORRECCIÓN: Definir la tecla ESC para evitar el error en super.update() ---
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    // ------------------------------------------------------------------------------

    this.sound.stopAll();
    this.music = this.sound.add("bgm", {loop: true});
    this.music.play();

    this.waitingText = this.add.text(640, 480, "Conectando al servidor...", {
      fontSize: "40px", 
      color: "#ffffff",
      backgroundColor: "#000000"
    }).setOrigin(0.5).setDepth(2000);

    // 3. Iniciar conexión WebSocket
    this.setupSocket();
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

      case 'gameOver':
        // Determinar quién es el objeto ganador
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

    // Crear los coches usando la lógica base
    // NOTA: Creamos los coches manualmente para controlar los inputs
    const car1 = new Car(this, "player1", 740, 715, "coche");
    const car2 = new Car(this, "player2", 750, 745, "car_red");
    this.players.set("player1", car1);
    this.players.set("player2", car2);

    // Habilitar colisiones
    this.setupCollisions();

    // CONFIGURAR INPUTS: Solo controlo MI coche
    this.setupMyInput();
  }

  setupMyInput() {
    // Definir teclas (WASD o Flechas, da igual, usaremos unas estándar para mí)
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

    // 1. Mover MI coche localmente
    this.handleLocalMovement(myCar);

    // 2. Enviar MI posición al servidor
    this.socket.send(JSON.stringify({
      type: 'playerMove',
      x: myCar.x,
      y: myCar.y,
      angle: myCar.angle,
      speed: myCar.currentSpeed
    }));

    // 3. Comprobar condiciones de carrera (Checkpoints/Meta)
    // Esto se maneja en setupCollisions heredado, 
    // PERO debemos avisar al server si ganamos.
    if (myCar.laps >= this.MAX_LAPS) {
        this.socket.send(JSON.stringify({ type: 'raceFinish' }));
    }
    
    // Actualizar lógica de terreno (césped/pista)
    super.update(); 
  }

  handleLocalMovement(car) {
    // Lógica simple de movimiento sin CommandProcessor para evitar líos online por ahora
    const speed = car.currentSpeed;
    let dirY = 0;
    let dirX = 0;

    // Usamos flechas O wasd para controlar MI coche
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
    if (opponent) {
      // Interpolación básica: movemos el sprite a donde dice el server
      opponent.x = data.x;
      opponent.y = data.y;
      opponent.setRotation(Phaser.Math.DegToRad(data.angle));
    }
  }
}