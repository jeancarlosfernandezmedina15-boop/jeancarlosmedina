const startButton = document.getElementById("startButton");
const replayButton = document.getElementById("replayButton");
const musicButton = document.getElementById("musicButton");
const music = document.getElementById("backgroundMusic");
const flowersContainer = document.getElementById("flowers");
const petalsContainer = document.getElementById("petals");
const messagesContainer = document.getElementById("messages");
const finalMessage = document.getElementById("finalMessage");
const universe = document.getElementById("universe");
const popupsContainer = document.getElementById("popups");
const tapHint = document.getElementById("tapHint");

let started = false;
let musicPlaying = false;
let sequenceTimer = null;

const flowerTypes = ["🌻", "🌷", "🌼", "🌻", "🌷", "🌼", "🌻"];

const messages = [
  "Hay flores que simplemente son bonitas...",
  "y hay personas que hacen que todo alrededor se sienta más bonito. 💛",
  "Así que pensé en regalarte un pequeño universo...",
  "hecho de flores amarillas, porque hoy quería sacarte una sonrisa. 🌻"
];

// Mensajes que aparecen al tocar una flor. Cámbialos por los tuyos:
// chistes internos, recuerdos, cosas que solo ustedes entienden.
const flowerMessages = [
  "Tu sonrisa es mi parte favorita del día. 🌻",
  "Contigo hasta lo más simple se vuelve especial. 💛",
  "Eres mi lugar favorito en todo el universo.",
  "Si pudiera, te regalaría un jardín entero.",
  "Contigo todo florece. 🌷",
  "Me haces querer ser mejor cada día.",
  "Eres luz incluso en los días nublados. ✨",
  "Mi casualidad más bonita eres tú.",
  "Gracias por existir en mi mundo. 💛",
  "Cada flor de este universo me recuerda a ti.",
  "Hoy y siempre, te elijo a ti.",
  "Eres la razón por la que sonrío mirando el celular. 😊",
  "Ojalá pudieras verte con mis ojos, brillas más que cualquier estrella. 🌟",
  "Contigo el tiempo pasa volando y aun así quiero más."
];

let messageBag = [];
let popupTimer = null;
let hintTimer = null;
let sequenceTimers = [];

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Reparte los mensajes en orden aleatorio y sin repetir hasta agotarlos todos.
function nextFlowerMessage() {
  if (messageBag.length === 0) {
    messageBag = shuffle([...flowerMessages]);
  }
  return messageBag.pop();
}

function clearPopup() {
  if (popupTimer) clearTimeout(popupTimer);
  popupsContainer.innerHTML = "";
}

function spawnSparks(cx, cy) {
  for (let i = 0; i < 9; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    const angle = (Math.PI * 2 * i) / 9 + random(-0.3, 0.3);
    const dist = random(34, 70);
    spark.style.left = `${cx}px`;
    spark.style.top = `${cy}px`;
    spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    popupsContainer.appendChild(spark);
    setTimeout(() => spark.remove(), 850);
  }
}

function showFlowerPopup(flower) {
  clearPopup();

  const area = universe.getBoundingClientRect();
  const rect = flower.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 - area.left;
  const cy = rect.top + rect.height / 2 - area.top;

  spawnSparks(cx, cy);

  const popup = document.createElement("div");
  popup.className = "flower-popup";
  popup.textContent = nextFlowerMessage();
  popupsContainer.appendChild(popup);

  const margin = 12;
  const gap = 14;
  const w = popup.offsetWidth;
  const h = popup.offsetHeight;

  const left = Math.min(Math.max(cx - w / 2, margin), area.width - w - margin);
  // arriba deja libre la zona del botón de música (~70px)
  const topLimit = 70 + margin;
  const fitsAbove = rect.top - area.top - h - gap > topLimit;
  const rawTop = fitsAbove
    ? rect.top - area.top - h - gap
    : rect.bottom - area.top + gap;
  const top = Math.min(rawTop, area.height - h - margin);

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.setProperty("--arrow-x", `${cx - left}px`);
  if (!fitsAbove) popup.classList.add("below");

  requestAnimationFrame(() => popup.classList.add("visible"));

  popup.addEventListener("click", clearPopup);
  popupTimer = setTimeout(() => {
    popup.classList.remove("visible");
    setTimeout(() => popup.remove(), 400);
  }, 3500 + popup.textContent.length * 45);
}

function hideHint() {
  if (hintTimer) clearTimeout(hintTimer);
  tapHint.classList.remove("show");
}

function scheduleHint() {
  hideHint();
  hintTimer = setTimeout(() => tapHint.classList.add("show"), 2500);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createFlowers() {
  flowersContainer.innerHTML = "";

  const amount = window.innerWidth < 600 ? 18 : 30;

  for (let i = 0; i < amount; i++) {
    const flower = document.createElement("div");
    flower.className = "flower";
    flower.textContent = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];

    // Distribución elíptica que se adapta a la forma de la pantalla
    // (en celular vertical usa todo el alto, no solo una franja central).
    const angle = random(0, Math.PI * 2);
    const radius = Math.sqrt(random(0.06, 1)); // sqrt = reparto parejo, sin amontonarse al centro
    const x = 50 + Math.cos(angle) * radius * 42;
    const y = 50 + Math.sin(angle) * radius * 40;

    flower.style.left = `${x}%`;
    flower.style.top = `${y}%`;
    flower.style.setProperty("--size", `${random(27, 58)}px`);
    flower.style.setProperty("--delay", `${random(0, 1.4)}s`);
    flower.style.setProperty("--float-time", `${random(2.5, 5)}s`);
    flower.style.setProperty("--rotation", `${random(-18, 18)}deg`);

    flower.addEventListener("click", (event) => {
      event.stopPropagation();
      hideHint();
      flower.classList.add("opened");
      showFlowerPopup(flower);
    });

    flowersContainer.appendChild(flower);
  }
}

function createPetals() {
  petalsContainer.innerHTML = "";

  const amount = window.innerWidth < 600 ? 25 : 42;

  for (let i = 0; i < amount; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";

    petal.style.left = `${random(-5, 105)}%`;
    petal.style.setProperty("--size", `${random(7, 17)}px`);
    petal.style.setProperty("--drift", `${random(-120, 120)}px`);
    petal.style.setProperty("--duration", `${random(7, 15)}s`);
    petal.style.setProperty("--delay", `${random(-15, 0)}s`);

    petalsContainer.appendChild(petal);
  }
}

function showMessage(index) {
  const old = messagesContainer.querySelector(".message.visible");
  if (old) old.classList.remove("visible");

  const message = document.createElement("p");
  message.className = "message";
  message.textContent = messages[index];
  messagesContainer.appendChild(message);

  requestAnimationFrame(() => message.classList.add("visible"));

  setTimeout(() => {
    message.classList.remove("visible");
    setTimeout(() => message.remove(), 700);
  }, 3900);
}

async function startMusic() {
  try {
    music.volume = 0;
    await music.play();
    musicPlaying = true;
    musicButton.textContent = "🔊";

    let volume = 0;
    const fade = setInterval(() => {
      volume += 0.025;
      music.volume = Math.min(volume, 0.55);
      if (volume >= 0.55) clearInterval(fade);
    }, 80);
  } catch (error) {
    // Si todavía no existe assets/audio/musica.mp3, la experiencia visual sigue funcionando.
    musicPlaying = false;
    musicButton.textContent = "🎵";
  }
}

function runSequence() {
  sequenceTimers.forEach(clearTimeout);
  sequenceTimers = [];

  messagesContainer.innerHTML = "";
  finalMessage.classList.remove("show");
  universe.classList.remove("finale");

  messages.forEach((_, index) => {
    sequenceTimers.push(setTimeout(() => showMessage(index), index * 4800));
  });

  sequenceTimers.push(setTimeout(() => {
    finalMessage.classList.add("show");
    universe.classList.add("finale");
  }, messages.length * 4800 + 1000));
}

async function startExperience() {
  if (started) return;

  started = true;
  document.body.classList.add("started");
  document.querySelector(".universe").setAttribute("aria-hidden", "false");

  createFlowers();
  createPetals();
  runSequence();
  scheduleHint();
  await startMusic();
}

function replay() {
  clearPopup();
  messageBag = [];
  createFlowers();
  createPetals();
  runSequence();
  scheduleHint();
  if (!musicPlaying) startMusic();
}

startButton.addEventListener("click", startExperience);
replayButton.addEventListener("click", replay);

musicButton.addEventListener("click", async () => {
  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    musicButton.textContent = "🔇";
  } else {
    try {
      await music.play();
      musicPlaying = true;
      music.volume = 0.55;
      musicButton.textContent = "🔊";
    } catch {
      musicButton.textContent = "🎵";
    }
  }
});

window.addEventListener("resize", () => {
  if (started) {
    clearPopup();
    createFlowers();
    createPetals();
  }
});

universe.addEventListener("click", (event) => {
  if (!event.target.closest(".flower-popup")) clearPopup();
});
