/*
MARK: PARTICLE
*/

class Particle {
  constructor (mx, my, color) {
    this.mx = mx;
    this.my = my;
    this.color = color

    this.isActive = true;
  }

  step(matrix) {
    if (!this.isActive) { return; }

    const prevX = this.mx;
    const prevY = this.my;

    this.isActive = true;

    if (matrix.get(this.mx, this.my - 1) == EmptyCell.emptyInstance) {
        this.swap(matrix, matrix.get(this.mx, this.my - 1), this.mx, this.my - 1);
    } else if (matrix.get(this.mx + 1, this.my - 1) == EmptyCell.emptyInstance) {
        this.swap(matrix, matrix.get(this.mx + 1, this.my - 1), this.mx + 1, this.my - 1);
    } else if (matrix.get(this.mx - 1, this.my - 1) == EmptyCell.emptyInstance) {
        this.swap(matrix, matrix.get(this.mx - 1, this.my - 1), this.mx - 1, this.my - 1);
    } else {
      this.isActive = false;
    }

    // deactivate if no movement detected
    // this.isActive = prevX != this.mx || prevY != this.my;

    if (this.isActive) {
      matrix.leftEmpty.push([prevX, prevY]);
      this.activateSurroundingParticles(matrix, prevX, prevY);
    }

    // activate surrounding cells in case :)
    // if (this.isActive) {
    //   this.activateSurroundingParticles(matrix, prevX, prevY);
    // }
  }

  activateSurroundingParticles(matrix, prevx, prevy) {
    let p;
    p = matrix.get(prevx-1, prevy);
    if (p && p != this) p.activate();
    p = matrix.get(prevx+1, prevy);
    if (p && p != this) p.activate();
    p = matrix.get(prevx, prevy-1);
    if (p && p != this) p.activate();
    p = matrix.get(prevx, prevy+1);
    if (p && p != this) p.activate();
  }

  activate() { this.isActive = true; }

  set(mx, my) {
    this.mx = mx;
    this.my = my;
  }

  swap(matrix, other) {
    this.swap(matrix, other, other.mx, other.my);
  }

  swap(matrix, other, ox, oy) {
    if (this == other) { return false; }

    matrix.set(this.mx, this.my, other);
    matrix.set(ox, oy, this);
    return true;
  }
 
  draw(ctx) {
    ctx.fillStyle = this.color;
    // if (this.isActive) {
    // } else {
    //   ctx.fillStyle = '#000000';
    // }
    ctx.fillRect(this.mx * pScale, canvas.height - (this.my + 1) * pScale, pScale, pScale);
  }
  
}

class EmptyCell extends Particle {
  static emptyInstance = new EmptyCell(-1, -1, '#000');

  constructor(mx, my, color) {
    super(mx, my, color);
    this.isActive = false;
  }

  set(matrix) {}
  activate() {}

  draw(ctx) {}
}

/*
MARK: SIMULATION
*/

class Simulation {
  constructor (width, height) {
    this.mw = width;
    this.mh = height;

    this.matrix;
    this.generateMatrix();
    
    this.id = 2;

    this.spawns = 0;

    this.leftEmpty = []
  }

  generateMatrix() {
    this.matrix = [];

    console.log(`CREATING MATRIX: ${this.mw}, ${this.mh}`)

    for (let y=0; y<this.mh; y++) {
      var row = [];
      for (let x=0; x<this.mw; x++) {
        row.push(EmptyCell.emptyInstance);
      }
      this.matrix.push(row);
    }
  }

  // access tools ===============================================================
  
  isWithinBounds(mx, my) { return mx >= 0 && my >= 0 && mx < this.mw && my < this.mh; }

  get(mx, my) { return !this.isWithinBounds(mx, my) ? null : this.matrix[my][mx]; }

  set(mx, my, p) {
    if (!this.isWithinBounds(mx, my)) { return false; }

    this.matrix[my][mx] = p;
    p.set(mx, my);
    return true;
}

  // update =====================================================================

  getShuffledIndices() {
    const indices = [];
    
    for (let i=0; i<this.mw; i++) { indices.push(i); }

    let currentIndex = indices.length;

  // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [indices[currentIndex], indices[randomIndex]] = [
        indices[randomIndex], indices[currentIndex]];
    }

    return indices;
  }

  step() {
    const shuffledIndices = this.getShuffledIndices();
    for (let y=0; y<this.mh; y++) {
      for (let x=0; x<this.mw; x++) {
        if (this.matrix[y][shuffledIndices[x]].isActive) {
          this.matrix[y][shuffledIndices[x]].step(this);
        }
      }
    }
  }

  draw() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    let pt;
    for (var i = 0; i < this.leftEmpty.length; i++) {
      pt = this.leftEmpty[i];
      ctx.clearRect(pt[0] * pScale, canvas.height - (pt[1] + 1) * pScale, pScale, pScale);
    }
    this.leftEmpty = [];

    for (let y=0; y<this.mh; y++) {
      for (let x=0; x<this.mw; x++) {
        if (this.matrix[y][x].isActive) {
          this.matrix[y][x].draw(ctx);
        }
      }
    }
  }

  drawReset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y=0; y<this.mh; y++) {
      for (let x=0; x<this.mw; x++) {
        this.matrix[y][x].isActive = true;
        this.matrix[y][x].draw(ctx);
      }
    }
  }

  spawn(mx, my) {
    if (mx == undefined) {
      let T = (canvas.width/pScale)*20; // k = 4000 * 4 / 700 ~ 20
      let A = 0.8;
      mx = Math.floor((A*Math.sin(this.spawns*2*Math.PI/T)+1)/2 * this.mw)
    }

    if (my == undefined) my = this.mh-1;

    this.set(mx, my, new Particle(mx, my, variate(rgbToHex(lerpColor(currentThemeB, currentThemeA, Math.cos(this.spawns/500)/2+0.5)), 20)));
    this.spawns++;
  }

  erase(mx, my) {
    this.set(mx, my, EmptyCell.emptyInstance);
  }

  changeId(id) {
    console.log(`changing id to ${id}`)
    this.id = id;
  }
  
  // CATCH UP WHEN TABBED OUT

  catchUp(timeElapsed) {
    // store an array of the furthermost values for every column
    // make a shootDown() that sets a particles position and increments this array.
    // repeateadly shootdown {timeElapsed} particles.
    // for a smooth shape, either:
    //  - repeat one layer per one tick
    //  - shootdown in a linear pattern
  
    let dists = []
    for (let x=0; x<this.mw; x++) {
      let firstEmpty = this.mh - 1;
      for (let y=0; y<this.mh; y++) {
        if (this.get(x, y) == EmptyCell.emptyInstance) {
          firstEmpty = y;
          break;
        }
      }
      dists.push(firstEmpty);
    }
    
    for (let i=0; i<timeElapsed*spawnRate; i++) {
      this.shootDown(dists);
    }
    
    this.drawReset();

  }

  shootDown(dists) {
    let T = (canvas.width/pScale)*20; // k = 4000 * 4 / 700 ~ 20
    let A = 0.8;
    let mx = Math.floor((A*Math.sin(this.spawns*2*Math.PI/T)+1)/2 * this.mw)

    this.spawn(mx, dists[mx]+1);
    dists[mx] += 1;
  }
}

console.log(hexToRGB("#FF00FF"))
console.log(rgbToHex(hexToRGB("#FF00FF")))


/*
MARK: HELPERS
*/

function pingPong(t) {
    t = t % 2;
    return t < 1 ? t : 2 - t;
}

// function to format time in cooly :)
function formatTime(seconds) {
  seconds = Math.floor(seconds);
  function formatDouble(num) {
      return `${num<=9 ? '0' : ''}${num}`
  }
  
  const hrs = Math.floor(seconds/60/60);
  const mins = Math.floor(seconds/60) % 60;
  const secs = seconds % 60;
  
  if (hrs > 0) {
      return `${hrs}:${formatDouble(mins)}:${formatDouble(secs)}`;
  } else {
      return `${mins}:${formatDouble(secs)}`;
  }
}

function writeTabTitle() {;
  if (alarmInput.value != "") {
    if (alarmTimer == 0) {
      if (secondsElapsed % 2 == 0) document.title = `🔔ring ring!`;
      else document.title = `ring ring!🔔`;
    } else {
      document.title = `⏰${formatTime(alarmTimer)}`;
    }
  } else {
    document.title = `⏳${formatTime(secondsElapsed)}`;
  }
}

function rgbToHex({r, g, b}) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRGB(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    const int = parseInt(hex, 16);
    return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255
    };
}

function variate(hex, amp) {
  rgb = hexToRGB(hex);

  R = Math.min(Math.floor(rgb.r+Math.random()*amp-amp/2), 255);
  G = Math.min(Math.floor(rgb.g+Math.random()*amp-amp/2), 255);
  B = Math.min(Math.floor(rgb.b+Math.random()*amp-amp/2), 255);

  return rgbToHex({r:R, g:G, b:B});
}

function lerp(a,b,t) { return a + (b-a)*t; }

function lerpColor(c1, c2, t) {
    return {
        r: Math.round(lerp(c1.r, c2.r, t)),
        g: Math.round(lerp(c1.g, c2.g, t)),
        b: Math.round(lerp(c1.b, c2.b, t))
    };
}

function isValidHex(hex) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

/*
MARK: THEMES
*/

const defaultThemes = [
  {main:'#f91d5a', aux:'#BE0A61', bg:'#64032bff'},
  {main:'#2ded7a', aux:'#12816d', bg:'#074355ff'},
  {main:'#27cbf3', aux:'#3a62a1', bg:'#11225cff'},
  {main:'#be55f2', aux:'#7643b6', bg:'#300f6eff'}
];

let currentThemeA = hexToRGB(defaultThemes[0].main)
let currentThemeB = hexToRGB(defaultThemes[0].aux)

let themes = JSON.parse(localStorage.getItem('themes')) || defaultThemes;

const buttonsContainer = document.getElementById('theme-buttons');

const themeModal = document.getElementById('theme-modal');


function renderButtons() {
  buttonsContainer.innerHTML = '';
  themes.forEach((theme, i) => {
    const btn = document.createElement('button');
    btn.style.backgroundColor = theme.main;

    btn.addEventListener('click', () => {
      sim.changeId(i);
      secondsElapsed=0;
      writeTabTitle();
      applyTheme(theme);
    });

    buttonsContainer.appendChild(btn);
  });

  // Add New Theme Button
  const addBtn = document.createElement('button');

  var plusIcon = document.createElement('img');
  plusIcon.src = 'plus-icon.png';
  addBtn.appendChild(plusIcon);

  addBtn.addEventListener('click', () => themeModal.style.display = 'block');
  buttonsContainer.appendChild(addBtn);
}

function applyTheme(theme) {
  currentThemeA = hexToRGB(theme.main)
  currentThemeB = hexToRGB(theme.aux)

  // set the container colour
  document.getElementById("simulation").style.backgroundColor =  theme.bg;

  // Save selected theme for persistence
  localStorage.setItem('selectedTheme', JSON.stringify(theme));
}

document.getElementById('theme-bg').addEventListener('input', () => {
  const value = input.value.trim();
  if (isValidHex(value)) {
    input.style.backgroundColor = value;
  } else {
    input.style.backgroundColor = '#ffffff00'
  }
});

const mainField = document.getElementById('theme-main');
mainField.addEventListener('input', ()=> { mainField.style.backgroundColor = mainField.value.trim(); })
const auxField = document.getElementById('theme-aux');
auxField.addEventListener('input', ()=> { auxField.style.backgroundColor = auxField.value.trim(); })
const bgField = document.getElementById('theme-bg');
bgField.addEventListener('input', ()=> { bgField.style.backgroundColor = bgField.value.trim(); })

document.getElementById('save-theme').addEventListener('click', () => {
  const main = mainField.value.trim();
  const aux = auxField.value.trim();
  const bg = bgField.value.trim();

  if (!isValidHex(main)) return alert('Main color must be a valid hex code!');
  if (!isValidHex(aux)) return alert('Axuillary color must be a valid hex code!');
  if (!isValidHex(bg)) return alert('Background color must be a valid hex code!');

  const newTheme = { 'main':main, 'aux':aux, 'bg':bg };
  themes.push(newTheme);
  localStorage.setItem('themes', JSON.stringify(themes));
  renderButtons();
  themeModal.style.display = 'none';
  
  // Clear inputs
  document.getElementById('theme-name').value = '';
  document.getElementById('theme-bg').value = '';
  document.getElementById('theme-main').value = '';
});

document.getElementById('close-modal').addEventListener('click',  ()  =>  {
    themeModal.style.display  =  'none';
});

//  Close  modal  on  outside  click
window.addEventListener('click',  (e)  =>  {
    if(e.target  ===  themeModal)  themeModal.style.display  =  'none';
    if(e.target  ===  infoModal)  infoModal.style.display  =  'none';
    if(e.target  ===  settingsModal)  settingsModal.style.display  =  'none';
});

//  Load  previously  selected  theme
const  savedTheme  =  JSON.parse(localStorage.getItem('selectedTheme'));
if(savedTheme)  applyTheme(savedTheme);

renderButtons()

/*
MARK: MODALS
*/
const infoBtn = document.getElementById('info-button');
const infoModal = document.getElementById('info-modal');

infoBtn.addEventListener('click', () => infoModal.style.display = 'block' );

const settingsBtn = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const deleteList = document.getElementById("delete-theme-list");
const spawnRateInput = document.getElementById("spawn-rate");
const restoreBtn = document.getElementById("restore-default-themes");

function checkRestoreButton() {
  if (themes.length == 0) {
    restoreBtn.style.display = "block";
  } else {
    restoreBtn.style.display = "none";
  }
}

restoreBtn.addEventListener("click", () => {
  themes = [
    {main:'#f91d5a', aux:'#BE0A61', bg:'#64032bff'},
    {main:'#2ded7a', aux:'#12816d', bg:'#074355ff'},
    {main:'#27cbf3', aux:'#3a62a1', bg:'#11225cff'},
    {main:'#be55f2', aux:'#7643b6', bg:'#300f6eff'}
  ];
  localStorage.setItem("themes", JSON.stringify(themes));

  renderButtons();
  renderDeleteList();
  checkRestoreButton();
});

settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'block';
  renderDeleteList();
  checkRestoreButton();
});

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

spawnRateInput.addEventListener('input', () => {
  spawnRate = clamp(parseFloat(spawnRateInput.value) || 1, 1, 100);
  spawnDelay = 1000/spawnRate;
  localStorage.setItem("spawnRate", JSON.stringify(spawnRate));
  ResetMainLoop();
});

function renderDeleteList() {
  spawnRateInput.value = spawnRate;

  deleteList.innerHTML = "";

  themes.forEach((theme, i) => {
    const btn = document.createElement("button");
    btn.textContent = `Delete Theme ${i + 1}`;
    btn.style.backgroundColor = theme.main;

    btn.addEventListener("click", () => {
      // if (!confirm("Delete this theme permanently?")) return;

      // Remove the theme
      themes.splice(i, 1);
      localStorage.setItem("themes", JSON.stringify(themes));

      renderButtons();

      renderDeleteList();

      checkRestoreButton();
    });

    deleteList.appendChild(btn);
  });
}

/*
MARK: VARIABLES
*/

const canvas = document.getElementById("simulation");
// var canvas = canvas.getBoundingClientRect();
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

console.log(`canvas: ${canvas.width} x ${canvas.height}.`);
console.log(`canvas: ${canvas.width} x ${canvas.height}.`);

let secondsElapsed = 0;

var pScale = 4;
const sim = new Simulation(Math.ceil(canvas.width / pScale), Math.ceil(canvas.height / pScale));

var isMouseDown = false;
var mouseX = 0
var mouseY = 0

let hiddenElapsed = 0;

canvas.addEventListener("mousedown", (e) => {
  isMouseDown = true;
})
canvas.addEventListener("mouseup", (e) => {
  isMouseDown = false;
})
canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX - canvas.left;
  mouseY = e.clientY - canvas.top;
})

// bundling? nah just write everything in a single file

function getTime() {
  return new Date().getTime()/1000;
}

let lastVisibleTime = getTime();

document.addEventListener("visibilitychange", (event) => {
  if (document.hidden) {
    console.log("hidden")
    lastVisibleTime = getTime();
    hiddenElapsed = 0;

    // if exiting while alarm is active, release alarm.
    alarmInput.value = "";

  } else {
    console.log("visible")
    console.log(`spawning ${hiddenElapsed} particles.`);
    sim.catchUp(hiddenElapsed);

  }
});

/*
MARK: SIMULATION LOOP
*/

setInterval(() => {
  sim.step();
  if (! document.hidden) { sim.draw(ctx); }
}, 10);

function alarmTick() {
  if (document.activeElement != alarmInput) {
    if (alarmTimer > 0) {
      alarmTimer -= deltaTime;
      alarmInput.value = formatTime(alarmTimer);

      if (alarmTimer <= 0) {
        playAlarm();
      }
    }
  }
}

function timerTick() {
  secondsElapsed += deltaTime;
  document.getElementById("timer").innerText = formatTime(secondsElapsed);
}

/* MAIN LOOP */

var deltaTime = 0;
var lastTickTime = getTime();

let spawnRate = parseFloat(JSON.parse(localStorage.getItem('spawnRate'))) || 1;
var spawnDelay = 1000/spawnRate;

console.log("starting timer...")
let mainLoop;

function ResetMainLoop() {
  if (mainLoop) {
    clearInterval(mainLoop);
  }
  mainLoop = setInterval(() => {
    deltaTime = getTime() - lastTickTime;
    lastTickTime = getTime();

    if (document.hidden) { // don't run sim while unloaded.
      hiddenElapsed = getTime() - lastVisibleTime;
    } else {
      sim.spawn();
    }

    timerTick();
    alarmTick();

    writeTabTitle();
  }, spawnDelay);
}
ResetMainLoop();


/*
MARK: ALARMS
*/

const alarmInput = document.getElementById("alarm-input");
alarmTimer = 0;

function playAlarm() {
  var audio = new Audio('/assets/aud/egg-timer.mp3');
  audio.play();
}

function getSeconds(string) {
  string = "00000000" + string;
  
  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  seconds = parseInt(string.substring(string.length-2, string.length), 10);
  minutes = parseInt(string.substring(string.length-4, string.length-2), 10);
  hours = parseInt(string.substring(string.length-6, string.length-4), 10);

  console.log(`${seconds}s`);
  console.log(`${minutes}m`);
  console.log(`${hours}h`);

  return hours*60*60 + minutes*60 + seconds;
}

function getReverseSeconds(totalSeconds) {
  hours = Math.floor(totalSeconds / 3600)
  minutes = Math.floor((totalSeconds % 3600) / 60)
  seconds = totalSeconds % 60

  console.log(`${seconds}s`);
  console.log(`${minutes}m`);
  console.log(`${hours}h`);

  return `${hours*10000+minutes*100+seconds}`
}

alarmInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    alarmInput.blur();
  }

  if ("1234567890".indexOf(event.key) == -1) { // filter out non-digit keys
    event.preventDefault();
  }
});

alarmInput.addEventListener("focusin", (event) => {
  if (alarmTimer > 0) {
    alarmInput.value = getReverseSeconds(alarmTimer);
  } else {
    alarmInput.value = "";
  }
});

alarmInput.addEventListener("focusout", (event) => {
  if (alarmInput.value != 0) {
    alarmTimer = getSeconds(alarmInput.value);
    alarmInput.value = formatTime(alarmTimer);
  }
});