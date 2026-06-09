import Phaser from "phaser";

const API_BASE = "/api";

export class LoginScene extends Phaser.Scene {
  constructor() {
    super("LoginScene");
  }

  preload() {
    this.load.image("fondo", "/assets/images/Menu.png");
    this.load.image("logo", "/assets/images/logo.png");
    this.load.image("boton", "/assets/images/boton.png");
  }

  create() {
    this.nickname = localStorage.getItem("nickname") || "";
    this.selectedColor = localStorage.getItem("playerColor") || "blue";
    this.isSubmitting = false;

    this.createBackground();
    this.createPanel();
    this.createNicknameInput();
    this.createColorSelector();
    this.createButtons();
    this.createKeyboardInput();
  }

  createBackground() {
    const bg = this.add.image(640, 480, "fondo");
    bg.setDisplaySize(1280, 960);

    const overlay = this.add.rectangle(640, 480, 1280, 960, 0x000000, 0.55);
    overlay.setDepth(1);
  }

  createPanel() {
    this.add.rectangle(640, 480, 660, 560, 0x111827, 0.94)
      .setStrokeStyle(3, 0x38bdf8)
      .setDepth(2);

    this.add.text(640, 245, "LOGIN ONLINE", {
      fontSize: "46px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(3);

    this.add.text(640, 295, "Introduce tu nickname y elige el color de usuario", {
      fontSize: "22px",
      color: "#cbd5e1"
    }).setOrigin(0.5).setDepth(3);

    this.statusText = this.add.text(640, 665, "", {
      fontSize: "22px",
      color: "#fbbf24",
      align: "center",
      wordWrap: { width: 560 }
    }).setOrigin(0.5).setDepth(3);
  }

  createNicknameInput() {
    this.add.text(375, 355, "Nickname", {
      fontSize: "26px",
      color: "#ffffff"
    }).setDepth(3);

    this.inputBox = this.add.rectangle(640, 415, 520, 62, 0x020617, 1)
      .setStrokeStyle(2, 0x94a3b8)
      .setDepth(3);

    this.nicknameText = this.add.text(400, 415, this.getDisplayedNickname(), {
      fontSize: "30px",
      color: "#ffffff"
    }).setOrigin(0, 0.5).setDepth(4);

    this.add.text(640, 460, "Escribe con el teclado. Backspace borra.", {
      fontSize: "18px",
      color: "#94a3b8"
    }).setOrigin(0.5).setDepth(3);
  }

  createColorSelector() {
    this.add.text(375, 500, "Color", {
      fontSize: "26px",
      color: "#ffffff"
    }).setDepth(3);

    this.colors = [
      { name: "blue", label: "Azul", value: 0x3b82f6 },
      { name: "red", label: "Rojo", value: 0xef4444 },
      { name: "green", label: "Verde", value: 0x22c55e },
      { name: "yellow", label: "Amarillo", value: 0xfacc15 }
    ];

    this.colorButtons = [];
    const startX = 455;
    const gap = 125;

    this.colors.forEach((color, index) => {
      const x = startX + index * gap;
      const circle = this.add.circle(x, 555, 32, color.value)
        .setInteractive({ useHandCursor: true })
        .setDepth(4);

      const label = this.add.text(x, 610, color.label, {
        fontSize: "18px",
        color: "#ffffff"
      }).setOrigin(0.5).setDepth(4);

      circle.on("pointerdown", () => {
        this.selectedColor = color.name;
        this.refreshColorSelection();
      });

      this.colorButtons.push({ color, circle, label });
    });

    this.refreshColorSelection();
  }

  refreshColorSelection() {
    this.colorButtons.forEach(({ color, circle }) => {
      if (color.name === this.selectedColor) {
        circle.setStrokeStyle(5, 0xffffff);
        circle.setScale(1.15);
      } else {
        circle.setStrokeStyle(0);
        circle.setScale(1);
      }
    });
  }

  createButtons() {
    this.enterButton = this.createTextButton(535, 735, "Entrar", () => this.submitLogin());
    this.backButton = this.createTextButton(745, 735, "Volver", () => this.scene.start("MenuScene"));
  }

  createTextButton(x, y, text, callback) {
    const rect = this.add.rectangle(x, y, 180, 58, 0x2563eb, 1)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);

    const label = this.add.text(x, y, text, {
      fontSize: "26px",
      color: "#ffffff"
    }).setOrigin(0.5).setDepth(5);

    rect.on("pointerover", () => rect.setFillStyle(0x1d4ed8));
    rect.on("pointerout", () => rect.setFillStyle(0x2563eb));
    rect.on("pointerdown", callback);

    return { rect, label };
  }

  createKeyboardInput() {
    this.input.keyboard.on("keydown", (event) => {
      if (this.isSubmitting) return;

      if (event.key === "Backspace") {
        this.nickname = this.nickname.slice(0, -1);
        this.refreshNicknameText();
        return;
      }

      if (event.key === "Enter") {
        this.submitLogin();
        return;
      }

      if (/^[a-zA-Z0-9_ -]$/.test(event.key) && this.nickname.length < 16) {
        this.nickname += event.key;
        this.refreshNicknameText();
      }
    });
  }

  getDisplayedNickname() {
    return this.nickname.length > 0 ? this.nickname : "Escribe tu nombre...";
  }

  refreshNicknameText() {
    this.nicknameText.setText(this.getDisplayedNickname());
    this.nicknameText.setColor(this.nickname.length > 0 ? "#ffffff" : "#64748b");
  }

  async submitLogin() {
    const nickname = this.nickname.trim();

    if (!nickname) {
      this.statusText.setText("Debes escribir un nickname antes de entrar.");
      return;
    }

    this.isSubmitting = true;
    this.statusText.setColor("#fbbf24");
    this.statusText.setText("Conectando con el servidor...");

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, color: this.selectedColor })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el login");
      }

      localStorage.setItem("nickname", data.player.nickname);
      localStorage.setItem("playerColor", data.player.color);
      localStorage.setItem("highScore", String(data.player.highScore || 0));
      localStorage.setItem("gamesPlayed", String(data.player.gamesPlayed || 0));

      this.statusText.setColor("#22c55e");
      this.statusText.setText("Login correcto. Entrando al modo online...");

      this.time.delayedCall(500, () => {
        this.scene.start("GameSceneOnline", {
          nickname: data.player.nickname,
          color: data.player.color
        });
      });
    } catch (error) {
      this.isSubmitting = false;
      this.statusText.setColor("#f87171");
      this.statusText.setText(`No se pudo iniciar sesión: ${error.message}`);
    }
  }
}
