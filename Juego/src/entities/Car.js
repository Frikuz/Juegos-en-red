export class Car {
  constructor(scene, id, x, y, spriteKey) {
    this.id = id;
    this.scene = scene;

    this.baseSpeed = 300;

    this.baseWidth = 30 ;
    this.baseHeight = 50;
    
    this.sprite = this.scene.physics.add.sprite(x, y, spriteKey);

    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.allowGravity = false;
    
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setScale(0.2);
    this.sprite.setDrag(400, 400);
  }
}
