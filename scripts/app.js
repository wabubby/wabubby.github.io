
class Particle {
  constructor (mx, my, id) {
    this.mx = mx;
    this.my = my;
    this.id = id;

    this.color = this.getColor();

    this.isActive = true;
  }

  step(matrix) {
    if (!this.isActive) { return; }

    const prevX = this.mx;
    const prevY = this.my;

    if (matrix.get(this.mx, this.my - 1) == EmptyCell.emptyInstance) {
        this.swap(matrix, matrix.get(this.mx, this.my - 1), this.mx, this.my - 1);
    } else if (matrix.get(this.mx + 1, this.my - 1) == EmptyCell.emptyInstance) {
        this.swap(matrix, matrix.get(this.mx + 1, this.my - 1), this.mx + 1, this.my - 1);
    } else if (matrix.get(this.mx - 1, this.my - 1) == EmptyCell.emptyInstance) {
        this.swap(matrix, matrix.get(this.mx - 1, this.my - 1), this.mx - 1, this.my - 1);
    }

    // deactivate if no movement detected
    this.isActive = prevX != this.mx || prevY != this.my;

    // activate surrounding cells in case :)
    if (this.isActive) {
      this.activateSurroundingParticles(matrix, prevX, prevY);
    }
  }

  activateSurroundingParticles(matrix, prevx, prevy) {
    for (let x=this.prevx-1; x<=this.prevx+1; x++) {
      for (let y=this.prevy-1; y<=this.prevy+1; prevy++) {
        let p = matrix.get(x, y);
        if (p == null || p == this) { continue; }
        p.activate()
      }
    }
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

  getColor() {
    switch (this.id) {
      case 0:
        return this.variate("#4C948A");
      case 1:
        return this.variate("#90A35B");
      case 2:
        return this.variate("#c94b62");
      case 3:
        return this.variate("#393954");
      default:
        return "#000000";
    }
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  
  variate(hexstring) {
    var R = parseInt(hexstring.substring(1,3),16);
    var G = parseInt(hexstring.substring(3,5),16);
    var B = parseInt(hexstring.substring(5,7),16);
    var kevin_sucks = 124;

    R = Math.min(Math.floor(R+Math.random()*40-20), 255);
    G = Math.min(Math.floor(G+Math.random()*40-20), 255);
    B = Math.min(Math.floor(B+Math.random()*40-20), 255);

    return this.rgbToHex(R, G, B);
  }
 
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.mx * pScale, rect.height - (this.my + 1) * pScale, pScale, pScale);
  }
  
}

class EmptyCell extends Particle {
  static emptyInstance = new EmptyCell(-1, -1, -1);

  set(matrix) {}
  activate() {}

  draw(ctx) {}
}


class Sim {
  static colors = []

  constructor (width, height) {
    this.mw = width;
    this.mh = height;

    this.matrix;
    this.generateMatrix();

    this.id = 2;
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
        this.matrix[y][shuffledIndices[x]].step(this);
      }
    }
  }

  draw () {
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let y=0; y<this.mh; y++) {
      for (let x=0; x<this.mw; x++) {
        this.matrix[y][x].draw(ctx);
      }
    }
  }
  
  getMappedMatrix(nw, nh) {
    const newMatrix = [];

    const h1 = Math.floor((this.mh * this.mw) / nw)
    console.log(`${this.mh}*${this.mw}/${nw}=${h1}`);

    for (let y=0; y<nh; y++) {
      let row = [];
      const ny = Math.ceil(y * (this.mh-1) / (h1-1));

      for (let x=0; x<nw; x++) {
        const nx = Math.floor(x * (this.mw-1) / (nw-1));

        if (this.isWithinBounds(nx, ny) && this.get(nx, ny)!=EmptyCell.emptyInstance) {
          const ref = this.get(nx, ny);
          row.push(new Particle(nx, ny, ref.id));
        } else {
          row.push(EmptyCell.emptyInstance);
        }

      }
      newMatrix.push(row);
    }

    return newMatrix;
  }

  getSubMatrix(sx, sy, sw, sh) {
    const newMatrix = [];

    for (let y=sy; y<sy+sh; y++) {
      var row = [];
      for (let x=sx; x<sx+sw; x++) {
        if (this.isWithinBounds(x, y)) {
          row.push(this.get(x, y));
        } else {
          row.push(EmptyCell.emptyInstance);
        }
      }
      newMatrix.push(row);
    }

    return newMatrix;
  }

  countOOB(sx, sy, sw, sh) {
    let ids = [0, 0, 0];
    for (let y=0; y<this.mh; y++) {
      for (let x=0; x<this.mw; x++) {
        if (x < sx || x >= sx+sw || y < sy || y >= sy+sh) {
          if (this.get(x, y) != EmptyCell.emptyInstance) {
            ids[this.get(x, y).id] += 1;
          }
        }
      }
    }
    return ids;
  }

  blather(count, id) {
    for (let i=0; i<count; i++) {
      let x = Math.floor(Math.random() * this.mw);
      for (let y=0; y<this.mh; y++) {
        if (this.get(x, y) == EmptyCell.emptyInstance) {
          this.set(x, y, new Particle(x, y, id));
          break;
        }
      }
    }
  }

  resize() {
    resizeCanvas();

    // console.log(resizeCanvas());

    const nw = Math.ceil(rect.width / pScale);
    const nh = Math.ceil(rect.height / pScale);

    if (nw == this.mw && nh == this.mh) { return; } // no particle size change. what's even the point.
    
    if (nw < this.mw) {
      let nMatrix = this.getMappedMatrix(nw, nh); // Array(nh).fill().map(()=>Array(nw).fill(EmptyCell.emptyInstance));


      this.matrix = nMatrix;
      this.mw = nw;
      this.mh = nh;

      for (let y=0; y<this.mh; y++) {
        var row = this.matrix[y];
        for (let x=0; x<this.mw; x++) {
          this.get(x, y).set(x, y);
          this.get(x, y).isActive = true;
        }
      }
    } else {
      // the matrix has grown or
      // shrunk vertically
      const rectx = Math.floor((this.mw - nw + Math.random()*2)/2);
      const nMatrix = this.getSubMatrix(rectx, 0, nw, nh);
      const deleted = this.countOOB(rectx, 0, nw, nh)
  
      console.log(`RESIZING MATRIX: ${nw}, ${nh}`);
      console.log(`DELETED: ${deleted[0]+deleted[1]+deleted[2]}`);
  
      this.matrix = nMatrix;
      this.mw = nw;
      this.mh = nh;
  
      for (let y=0; y<this.mh; y++) {
        var row = this.matrix[y];
        for (let x=0; x<this.mw; x++) {
          this.get(x, y).set(x, y);
          this.get(x, y).isActive = true;
        }
      }
  
      for (let id=0; id<deleted.length; id++) {
        this.blather(deleted[id], id);
      }
    }

  }


  spawn(mx, my) {
    if (my == undefined) my = this.mh-1;
    this.set(mx, my, new Particle(mx, my, this.id));
  }

  erase(mx, my) {
    this.set(mx, my, EmptyCell.emptyInstance);
  }

  changeId(id) {
    console.log(`changing id to ${id}`)
    this.id = id;
  }
  
  // FUNCTIONS

  shootDown(mx, dists) {
    this.spawn(mx, dists[mx]);
    dists[mx] += 1;
  }

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
    
    let x = Math.floor(Math.random()*sim.mw);
    for (let i=0; i<timeElapsed; i++) {
      this.shootDown(x, dists);
      x = (x + 1) % this.mw;
    }

  }

}

function resizeCanvas() {
  oldWidth = rect.width;
  oldHeight = rect.height;

  ctx.canvas.width = Math.max(600, window.innerWidth*0.48);
  ctx.canvas.height = window.innerHeight-42;
  rect = canvas.getBoundingClientRect()

  return oldWidth != rect.width || oldHeight != rect.height;
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

const canvas = document.getElementById("simulation-canvas");
var rect = canvas.getBoundingClientRect()
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth*0.48;
ctx.canvas.height = window.innerHeight-42;

let secondsElapsed = 0;

var pScale = 3;
const sim = new Sim(Math.ceil(rect.width / pScale), Math.ceil(rect.height / pScale));

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
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
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

/* SIMULATION LOOP */

setInterval(() => {
  sim.resize();
  sim.step();
  
  if (! document.hidden) {
    sim.draw(ctx);
  }
  
  // if (isMouseDown) {
  //   sim.spawn(Math.floor(mouseX / pScale), sim.mh - Math.floor(mouseY / pScale));
  // }
  
}, 40);

function alarmTick() {
  if (document.activeElement != alarmInput) {
    if (alarmTimer > 0) {
      alarmTimer -= 1;
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

console.log("starting timer...")
setInterval(() => {
  deltaTime = getTime() - lastTickTime;
  lastTickTime = getTime();

  if (document.hidden) { // don't run sim while unloaded.
    hiddenElapsed = getTime() - lastVisibleTime;
  } else {
    sim.spawn(Math.floor(Math.random()*sim.mw));
  }

  timerTick();
  alarmTick();

  writeTabTitle();
}, 1000);


document.getElementById("work").addEventListener("click", () => {sim.changeId(0); secondsElapsed=0; writeTabTitle(); });
document.getElementById("necess").addEventListener("click", () => {sim.changeId(1); secondsElapsed=0; writeTabTitle();});
document.getElementById("break").addEventListener("click", () => {sim.changeId(2); secondsElapsed=0; writeTabTitle();});
document.getElementById("sleep").addEventListener("click", () => {sim.changeId(3); secondsElapsed=0; writeTabTitle();});

/* ALARMS */

const alarmInput = document.getElementById("alarm-input");
alarmTimer = 0;

function playAlarm() {
  var audio = new Audio('assets/egg-timer.mp3');
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