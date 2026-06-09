import { Command } from "./Command.js";

export class MoveCarCommand extends Command {
  constructor(scene, car, dirX, dirY) {
    super();
    this.scene = scene;
    this.car = car;
    this.dirX = dirX;
    this.dirY = dirY;
  }

  execute() {
    if (!this.car || !this.car.body) return;

    const speed = this.car.currentSpeed;

    // GIRO
    if (this.dirX !== 0) {
      this.car.angle += this.dirX * 1.5;
    }

    // AVANCE
    if (this.dirY !== 0) {
      this.scene.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.car.angle),
        speed * this.dirY,
        this.car.body.velocity
      );
    }
  }
}
