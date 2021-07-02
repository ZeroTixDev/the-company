let App = {};
App.setup = function () {
   let canvas = document.createElement('canvas');
   canvas.classList.add('circle-effect-canvas');
   canvas.width = window.innerWidth; // * window.devicePixelRatio;
   canvas.height = window.innerHeight; // * window.devicePixelRatio;
   canvas.style.width = window.innerWidth;
   canvas.style.height = window.innerHeight;
   this.canvas = canvas;
   this.chaos = 1000;
   document.querySelector('.loading-canvas-div').appendChild(canvas);
   this.ctx = this.canvas.getContext('2d');
   this.width = this.canvas.width;
   this.height = this.canvas.height;
   window.addEventListener(
      'resize',
      (() => {
         this.canvas.width = window.innerWidth; //* window.devicePixelRatio;
         this.canvas.height = window.innerHeight; // * window.devicePixelRatio;
         this.width = this.canvas.width;
         this.height = this.canvas.height;
         this.canvas.style.width = window.innerWidth;
         this.canvas.style.height = window.innerHeight;
         App.initDraw();
      }).bind(this)
   );
   this.dataToImageRatio = 1;
   this.ctx.imageSmoothingEnabled = false;
   this.ctx.webkitImageSmoothingEnabled = false;
   this.ctx.msImageSmoothingEnabled = false;
   this.xC = this.width / 2;
   this.yC = this.height / 2;
   this.simulateNextFrame = true;

   this.stepCount = Math.floor(Math.random() * 360);
   this.particles = [];
   this.lifespan = 1500;
   this.popPerBirth = 1;
   this.maxPop = 1000;
   this.birthFreq = 1;

   // Build grid
   this.gridSize = 8; // Motion coords
   this.gridSteps = Math.floor(1000 / this.gridSize);
   this.grid = [];
   let i = 0;
   for (let xx = -500; xx < 500; xx += this.gridSize) {
      for (let yy = -500; yy < 500; yy += this.gridSize) {
         // Radial field, triangular function of r with max around r0
         let r = Math.sqrt(xx * xx + yy * yy),
            r0 = 100,
            field;

         if (r < r0) field = (255 / r0) * r;
         else if (r > r0) field = 255 - Math.min(255, (r - r0) / 2);

         this.grid.push({
            x: xx,
            y: yy,
            busyAge: 0,
            spotIndex: i,
            isEdge:
               xx == -500
                  ? 'left'
                  : xx == -500 + this.gridSize * (this.gridSteps - 1)
                  ? 'right'
                  : yy == -500
                  ? 'top'
                  : yy == -500 + this.gridSize * (this.gridSteps - 1)
                  ? 'bottom'
                  : false,
            field: field,
         });
         i++;
      }
   }
   this.gridMaxIndex = i;

   // Counters for UI
   this.drawnInLastFrame = 0;
   this.deathCount = 0;

   this.initDraw();
};

App.evolve = function () {
   let time1 = performance.now();

   this.stepCount++;

   // Increment all grid ages
   this.grid.forEach(function (e) {
      if (e.busyAge > 0) e.busyAge++;
   });

   if (this.stepCount % this.birthFreq == 0 && this.particles.length + this.popPerBirth < this.maxPop) {
      this.birth();
   }
   App.move();
   App.draw();

   let time2 = performance.now();

   // Update UI
   // document.getElementsByClassName('dead')[0].textContent = this.deathCount;
   // document.getElementsByClassName('alive')[0].textContent = this.particles.length;
   // document.getElementsByClassName('fps')[0].textContent = Math.floor(1000 / (time2 - time1));
   // document.getElementsByClassName('drawn')[0].textContent = this.drawnInLastFrame;
};
App.birth = function () {
   let gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex),
      gridSpot = this.grid[gridSpotIndex],
      x = gridSpot.x,
      y = gridSpot.y;

   let particle = {
      hue: 0, // + Math.floor(50*Math.random()),
      sat: 95, //30 + Math.floor(70*Math.random()),
      lum: 20 + Math.floor(40 * Math.random()),
      x: x,
      y: y,
      xLast: x,
      yLast: y,
      xSpeed: 0,
      ySpeed: 0,
      age: 0,
      ageSinceStuck: 0,
      attractor: {
         oldIndex: gridSpotIndex,
         gridSpotIndex: gridSpotIndex, // Pop at random position on grid
      },
      name: 'seed-' + Math.ceil(10000000 * Math.random()),
   };
   this.particles.push(particle);
};
App.kill = function (particleName) {
   let newArray = _.reject(this.particles, function (seed) {
      return seed.name == particleName;
   });
   this.particles = _.cloneDeep(newArray);
};
App.move = function () {
   for (let i = 0; i < this.particles.length; i++) {
      // Get particle
      let p = this.particles[i];

      // Save last position
      p.xLast = p.x;
      p.yLast = p.y;

      // Attractor and corresponding grid spot
      let index = p.attractor.gridSpotIndex,
         gridSpot = this.grid[index];

      // Maybe move attractor and with certain constraints
      if (Math.random() < 0.5) {
         // Move attractor
         if (!gridSpot.isEdge) {
            // Change particle's attractor grid spot and local move function's grid spot
            let topIndex = index - 1,
               bottomIndex = index + 1,
               leftIndex = index - this.gridSteps,
               rightIndex = index + this.gridSteps,
               topSpot = this.grid[topIndex],
               bottomSpot = this.grid[bottomIndex],
               leftSpot = this.grid[leftIndex],
               rightSpot = this.grid[rightIndex];

            // Choose neighbour with highest field value (with some desobedience...)
            let chaos = this.chaos;
            let maxFieldSpot = _.maxBy([topSpot, bottomSpot, leftSpot, rightSpot], function (e) {
               return e.field + chaos * Math.random();
            });

            let potentialNewGridSpot = maxFieldSpot;
            if (potentialNewGridSpot.busyAge == 0 || potentialNewGridSpot.busyAge > 15) {
               // Allow wall fading
               //if (potentialNewGridSpot.busyAge == 0) {// Spots busy forever
               // Ok it's free let's go there
               p.ageSinceStuck = 0; // Not stuck anymore yay
               p.attractor.oldIndex = index;
               p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex;
               gridSpot = potentialNewGridSpot;
               gridSpot.busyAge = 1;
            } else p.ageSinceStuck++;
         } else p.ageSinceStuck++;

         if (p.ageSinceStuck == 10) this.kill(p.name);
      }

      // Spring attractor to center with viscosity
      let k = 8,
         visc = 0.4;
      let dx = p.x - gridSpot.x,
         dy = p.y - gridSpot.y,
         dist = Math.sqrt(dx * dx + dy * dy);

      // Spring
      let xAcc = -k * dx,
         yAcc = -k * dy;

      p.xSpeed += xAcc;
      p.ySpeed += yAcc;

      // Calm the f*ck down
      p.xSpeed *= visc;
      p.ySpeed *= visc;

      // Store stuff in particle brain
      p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);
      p.dist = dist;

      // Update position
      p.x += 0.1 * p.xSpeed;
      p.y += 0.1 * p.ySpeed;

      // Get older
      p.age++;

      // Kill if too old
      if (p.age > this.lifespan) {
         this.kill(p.name);
         this.deathCount++;
      }
   }
};
App.initDraw = function () {
   this.ctx.clearRect(0, 0, this.width, this.height);
   this.ctx.beginPath();
   this.ctx.rect(0, 0, this.width, this.height);
   this.ctx.fillStyle = 'rgb(200, 200, 200)';
   this.ctx.fill();
   this.ctx.closePath();
};
App.draw = function () {
   this.drawnInLastFrame = 0;
   if (!this.particles.length) return false;

   this.ctx.beginPath();
   this.ctx.rect(0, 0, this.width, this.height);
   this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
   //this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
   this.ctx.fill();
   this.ctx.closePath();

   this.ctx.save();
   // const scale =
   //    Math.max(window.innerHeight * window.devicePixelRatio, window.innerWidth * window.devicePixelRatio) / 1000;
   // this.ctx.translate((window.innerWidth * scale) / 2, (window.innerHeight * scale) / 2);
   // this.ctx.scale(scale, scale);
   // this.ctx.translate((-window.innerWidth * scale) / 2, (-window.innerHeight * scale) / 2);
   for (let i = 0; i < this.particles.length; i++) {
      // Draw particle
      let p = this.particles[i];

      let h, s, l, a;

      h = p.hue + this.stepCount / 7; // / 30;
      s = p.sat;
      l = p.lum;
      a = 1;

      let last = this.dataXYtoCanvasXY(p.xLast, p.yLast),
         now = this.dataXYtoCanvasXY(p.x, p.y);
      let attracSpot = this.grid[p.attractor.gridSpotIndex],
         attracXY = this.dataXYtoCanvasXY(attracSpot.x, attracSpot.y);
      let oldAttracSpot = this.grid[p.attractor.oldIndex],
         oldAttracXY = this.dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y);

      this.ctx.beginPath();

      this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
      this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';

      // Particle trail
      this.ctx.moveTo(last.x, last.y);
      this.ctx.lineTo(now.x, now.y);

      this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
      this.ctx.stroke();
      this.ctx.closePath();

      // Attractor positions
      this.ctx.beginPath();
      this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
      this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
      this.ctx.lineTo(attracXY.x, attracXY.y);
      this.ctx.arc(attracXY.x, attracXY.y, 1.5 * this.dataToImageRatio, 0, 2 * Math.PI, false);

      //a /= 20;
      this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
      this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
      this.ctx.stroke();
      this.ctx.fill();

      this.ctx.closePath();

      // UI counter
      this.drawnInLastFrame++;
   }
   this.ctx.restore();
};
App.dataXYtoCanvasXY = function (x, y) {
   let zoom = 1.6;
   let xx = this.xC + x * zoom * this.dataToImageRatio,
      yy = this.yC + y * zoom * this.dataToImageRatio;

   return { x: xx, y: yy };
};

function Start() {
   App.setup();
   App.draw();

   const frame = function () {
      App.evolve();
      if (App.simulateNextFrame) {
         requestAnimationFrame(frame);
      }
   };
   frame();
}

function Stop() {
   App.simulateNextFrame = false;
   App.canvas.classList.add('hidden');
}

function SetChaos(chaos) {
   App.chaos = chaos;
}

const fns = {
   Start,
   Stop,
   SetChaos,
};

export default fns;
