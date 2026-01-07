import Phaser from "phaser";

export class PreHistoriaScene extends Phaser.Scene{
    preload(){
        this.load.image("boton", "./assets/images/boton.png");
        this.load.audio("theme", "./assets/music/F1.mp3");
    }

    create(){
        this.music = this.sound.add("theme", {loop: true});
        this.music.play();
        this.add.text(650, 400, "¿Quieres omitir la historia?", {
        fontSize: "45px",
        color: "#ffffff"
        }).setOrigin(0.5);
        this.add.image(650, 500, "boton").setInteractive({useHandCursor: true}).on("pointerdown", () => {
            this.scene.start("HistoriaScene");
        })
        this.add.text(650, 500, "Ver historia",{
            fontSize: "30px",
            color: "#ffffff"
        }).setOrigin(0.5);
        this.add.image(650, 600, "boton").setInteractive({useHandCursor: true}).on("pointerdown", () => {
            this.scene.start("MenuScene");
        })
        this.add.text(650, 600, "Saltar historia",{
            fontSize: "30px",
            color: "#ffffff"
        }).setOrigin(0.5);
        

    }

}
