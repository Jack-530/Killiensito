let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

class Vector {
  constructor(x, y) { this.x = x; this.y = y; }
  add(v) { return new Vector(this.x + v.x, this.y + v.y); }
  subtract(v) { return new Vector(this.x - v.x, this.y - v.y); }
  scale(s) { return new Vector(this.x * s, this.y * s); }
}

let origin = new Vector(canvas.width / 2, canvas.height / 2);
let io = { mouse: origin };
canvas.addEventListener("mousemove", e => {
  io.mouse = new Vector(e.clientX, e.clientY);
});

// Polar corazón (más pequeño)
let polar = (rad, time, center, size=5) => {
  let x = 16 * Math.sin(rad) ** 3;
  let y = 13 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad);
  y *= -1;
  let beat = Math.sin(time / 200) * 0.1 + 1;
  let scale = size * beat;
  return new Vector(x * scale, y * scale).add(center);
};

// Estados
let state = "start"; // start | playing | win | lose
let puntos = 0;
let corazones = [];
let startTime = null;
let timerLimit = 20;
let objetivo = 10;

// Crear corazones
function resetCorazones() {
  corazones = [];
  for (let i = 0; i < 15; i++) {
    corazones.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      speed: 2 + Math.random() * 2,
      caught: false
    });
  }
}

// Reiniciar juego
function resetGame() {
  puntos = 0;
  resetCorazones();
  startTime = Date.now();
  state = "playing";
}

// Clicks para empezar / reiniciar
canvas.addEventListener("click", () => {
  if (state === "start") {
    resetGame();
  } else if (state === "win" || state === "lose") {
    state = "start";
  }
});

function draw(time) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state === "start") {
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Agarra los corazones ❤️", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "30px Arial";
    ctx.fillText(`Objetivo: ${objetivo} puntos en ${timerLimit} segundos`, canvas.width / 2, canvas.height / 2);
    ctx.font = "25px Arial";
    ctx.fillText("Haz click para comenzar", canvas.width / 2, canvas.height / 2 + 60);
  }

  else if (state === "playing") {
    let elapsed = (Date.now() - startTime) / 1000;
    if (elapsed >= timerLimit) {
      state = puntos >= objetivo ? "win" : "lose";
    }

    origin = origin.add(io.mouse.subtract(origin).scale(0.05));

    // Corazón jugador
    ctx.shadowBlur = 20;
    ctx.shadowColor = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let rad = 0; rad < Math.PI * 2; rad += 0.05) {
      let p = polar(rad, time, origin, 5); // más chico
      if (rad === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Corazones que caen
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    corazones.forEach(c => {
      if (!c.caught) {
        ctx.fillText("❤️", c.x, c.y);
        c.y += c.speed;

        let dx = origin.x - c.x;
        let dy = origin.y - c.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
          c.caught = true;
          puntos++;
        }

        if (c.y > canvas.height + 30) {
          c.x = Math.random() * canvas.width;
          c.y = -30;
          c.caught = false;
        }
      }
    });

    // Puntaje
    ctx.fillStyle = "yellow";
    ctx.font = "22px Courier New";
    ctx.textAlign = "left";
    ctx.fillText("Puntos ❤️: " + puntos, 20, 40);

    // Temporizador
    let timeLeft = Math.max(0, (timerLimit - elapsed)).toFixed(1);
    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 50px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText(timeLeft + "s", canvas.width - 30, 60);
  }

  else if (state === "win") {
    ctx.fillStyle = "red";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Yeah, te amo", canvas.width/2, 80);

    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("RAWR", canvas.width/2, 130);

    // Estallido legible
    ctx.fillStyle = "pink";
    ctx.font = "bold 26px 'Comic Sans MS'";
    for (let i = 0; i < 150; i++) {
      let x = Math.random() * canvas.width;
      let y = Math.random() * (canvas.height-150) + 150;
      ctx.fillText("te amo ❤️", x, y);
    }

    // Mensaje central fijo
    ctx.fillStyle = "yellow";
    ctx.font = "bold 50px Arial";
    ctx.fillText("mosho 💖", canvas.width/2, canvas.height/2);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Haz click para volver a jugar", canvas.width/2, canvas.height-50);
  }

  else if (state === "lose") {
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Se acabó el tiempo ⏳", canvas.width/2, canvas.height/2 - 40);
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("No alcanzaste los 10 puntos 😢", canvas.width/2, canvas.height/2);
    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";
    ctx.fillText("Haz click para intentarlo otra vez", canvas.width/2, canvas.height/2 + 60);
  }

  requestAnimationFrame(draw);
}

draw(0);
