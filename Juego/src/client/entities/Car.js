import Phaser from "phaser";

export class Car extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, x, y, texture) {
    super(scene, x, y, texture);

this.laps = 0;
this.passedCheckpoint = false;
this.justCrossedFinish = false;

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
    this.setDrag(400, 400);

    this.setScale(0.4);

this.body.setSize(
  this.width * 0.6,
  this.height * 0.8
);

this.body.setOffset(
  this.width * 0.2,
  this.height * 0.1
);
    
  }

  setOffRoad(value) {

    if (this.isOffRoad === value) return;
    this.isOffRoad = value;
    this.currentSpeed = value ? this.currentSpeed-=230 : this.currentSpeed+=230;

    // Feedback visual opcional
    this.setTint(value ? 0xaaaaaa : 0xffffff);
  }

}
