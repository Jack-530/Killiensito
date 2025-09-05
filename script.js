let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

// Clase Vector simple
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }
  subtract(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }
  scale(s) {
    return new Vector(this.x * s, this.y * s);
  }
}

let origin = new Vector(canvas.width / 2, canvas.height / 2);
let io = { mouse: origin };

canvas.addEventListener("mousemove", e => {
  io.mouse = new Vector(e.clientX, e.clientY);
});

// Polar function para corazón
let polar = (rad, time, center) => {
  let x = 16 * Math.sin(rad) ** 3;
  let y = 13 * Math.cos(rad)
        - 5 * Math.cos(2 * rad)
        - 2 * Math.cos(3 * rad)
        - Math.cos(4 * rad);

  y *= -1; // corregir eje Y

  let beat = Math.sin(time / 200) * 0.1 + 1;
  let scale = 8 * beat;

  return new Vector(x * scale, y * scale).add(center);
};

// Frases lindas
let frases = [
  "Te quiero 💕",
  "Eres importante para mí 🌟",
  "Sos mi felicidad 💖",
  "Gracias por existir ✨",
  "Siempre contigo 💞",
  "Eres único/a 💝"
];
let frasesDesbloqueadas = [];
let fraseIndex = 0;
let lastChange = 0;

// Regalo 🎁
let regalo = new Vector(
  Math.random() * (canvas.width - 50) + 25,
  Math.random() * (canvas.height - 50) + 25
);
let regaloRadio = 25;
let regaloToques = 0;
let regaloDesbloqueado = false;

// Corazones que caen ❤️
let corazones = [];
for (let i = 0; i < 10; i++) {
  corazones.push({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    speed: 2 + Math.random() * 2,
    caught: false
  });
}
let puntos = 0;

// Timer 10s
let startTime = Date.now();
let mostrarExplosion = false;
let timerLimit = 10;

function draw(time) {
  let elapsed = (Date.now() - startTime) / 1000;
  if (elapsed >= timerLimit) {
    mostrarExplosion = true;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!mostrarExplosion) {
    // suavizar movimiento corazón al mouse
    origin = origin.add(io.mouse.subtract(origin).scale(0.05));

    // Dibujar corazón
    ctx.shadowBlur = 30;
    ctx.shadowColor = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let rad = 0; rad < Math.PI * 2; rad += 0.02) {
      let p = polar(rad, time, origin);
      if (rad === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Corazones cayendo
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    corazones.forEach(c => {
      if (!c.caught) {
        ctx.fillText("❤️", c.x, c.y);
        c.y += c.speed;

        // Colisión con el corazón central
        let dx = origin.x - c.x;
        let dy = origin.y - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < 40) {
          c.caught = true;
          puntos++;
          frasesDesbloqueadas.push("Nuevo corazón atrapado 💞 (" + puntos + ")");
        }

        // Reaparecer si sale
        if (c.y > canvas.height + 30) {
          c.x = Math.random() * canvas.width;
          c.y = -30;
          c.caught = false;
        }
      }
    });

    // Regalo 🎁
    if (!regaloDesbloqueado) {
      ctx.fillText("🎁", regalo.x, regalo.y);
      let dx = origin.x - regalo.x;
      let dy = origin.y - regalo.y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        regaloToques++;
        if (regaloToques >= 3) {
          regaloDesbloqueado = true;
          frasesDesbloqueadas.push("🎁 Has desbloqueado un mensaje secreto 💘");
        }
      }
    }

    // Frases
    if (time - lastChange > 1500) {
      fraseIndex = (fraseIndex + 1) % (frases.length + frasesDesbloqueadas.length);
      lastChange = time;
    }
    let fraseActual =
      fraseIndex < frases.length
        ? frases[fraseIndex]
        : frasesDesbloqueadas[fraseIndex - frases.length];
    ctx.fillStyle = "white";
    ctx.font = "italic 22px 'Comic Sans MS', cursive";
    ctx.fillText(fraseActual, origin.x, origin.y + 150);

    // Temporizador digital
    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 60px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "black";
    let timeLeft = Math.max(0, (timerLimit - elapsed)).toFixed(1);
    ctx.fillText(timeLeft + "s", canvas.width - 30, 70);
    ctx.shadowBlur = 0;

    // Puntaje
    ctx.fillStyle = "yellow";
    ctx.font = "20px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("Puntos ❤️: " + puntos, 20, 40);
  } else {
    // Explosión de "te amo"
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i < 400; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      let extra = puntos > 5 ? " 💕🌹" : "";
      ctx.fillText("te amo ❤️" + extra, x, y);
    }
  }

  requestAnimationFrame(draw);
}

draw(0);
