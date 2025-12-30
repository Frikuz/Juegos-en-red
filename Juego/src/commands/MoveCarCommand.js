import { Command } from "./Command.js";

export class MoveCarCommand extends Command {
  constructor(scene, car, dirX, dirY, posX, posY) {
    super();
    this.scene = scene;
    this.car = car;
    this.dirX = dirX; // izquierda/derecha
    this.dirY = dirY; // adelante/atrás
    this.x = posX;
    this.y = posY;
  }

  execute() {
    const speed = 200;

    // Girar el coche
    if (this.dirX !== 0) {
      this.car.sprite.angle += this.dirX * 1; // grados por frame
    }

    const body = this.car.sprite.body;

    if (this.dirY !== 0) {
      // Movimiento hacia adelante o atrás
      this.scene.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.car.sprite.angle),
        speed * this.dirY,
        body.velocity
      );
    } else {
      // Frenado progresivo
      body.velocity.x = Phaser.Math.Linear(body.velocity.x, 0, 0.00001);
      body.velocity.y = Phaser.Math.Linear(body.velocity.y, 0, 0.00001);
    }
  }
}
