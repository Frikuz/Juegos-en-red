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
    this.baseSpeed = 250;
    this.currentSpeed = this.baseSpeed;
    this.offRoadSpeed= this.currentSpeed - 120;    
    this.isOffRoad = false;

    // CONFIG FÍSICA
    this.setCollideWorldBounds(true);
    this.body.allowGravity = false;
    this.setOrigin(0.5);
    this.setDrag(400, 400);
    
    this.setScale(0.8);
  }

  setOffRoad(value) {

    if (this.isOffRoad === value) return;
    this.isOffRoad = value;
    this.currentSpeed = value ? this.currentSpeed-=120 : this.currentSpeed+=120;

    // Feedback visual opcional
    this.setTint(value ? 0xaaaaaa : 0xffffff);
  }

}
