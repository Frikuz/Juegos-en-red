import Phaser from "phaser";

export class Car extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, x, y, texture) {
    super(scene, x, y, texture);

    this.id = id;
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // VELOCIDADES
    this.baseSpeed = 300;
    this.offRoadSpeed = 120;
    this.currentSpeed = this.baseSpeed;

    this.isOffRoad = false;

    // CONFIG FÍSICA
    this.setCollideWorldBounds(true);
    this.body.allowGravity = false;
    this.setOrigin(0.5);
    this.setScale(0.2);
    this.setDrag(400, 400);
  }

  setOffRoad(value) {
    if (this.isOffRoad === value) return;

    this.isOffRoad = value;
    this.currentSpeed = value ? this.offRoadSpeed : this.baseSpeed;

    // Feedback visual opcional
    this.setTint(value ? 0xaaaaaa : 0xffffff);
  }
}
