import Player from '../scripts/player.js';
import World from '../scripts/world.js';
import Vec from '../scripts/vector.js';
import Bag from '../scripts/bag.js';
import Obstacle from '../scripts/obstacle.js';
import Ray from '../scripts/raycast.js';
import Gun from '../scripts/gun.js';
import Camera from '../scripts/camera.js';
// import Door from '../scripts/door.js';

function sandbox() {
   console.log('starting sandbox...');
   window.showLaser = false;
   const canvas = document.querySelector('.game-canvas');
   const can = document.createElement('canvas');
   const ct = can.getContext('2d');
   const stats = new Stats();
   stats.showPanel(0);
   document.body.appendChild(stats.dom);
   const ctx = canvas.getContext('2d');
   const input = { up: false, down: false, right: false, left: false, pickup: false, shift: false };
   const controls = {
      KeyW: { key: 'up' },
      KeyA: { key: 'left' },
      KeyD: { key: 'right' },
      KeyS: { key: 'down' },
      ArrowUp: { key: 'up' },
      ArrowLeft: { key: 'left' },
      ArrowRight: { key: 'right' },
      ArrowDown: { key: 'down' },
      KeyF: { key: 'pickup' },
      ShiftLeft: { key: 'shift' },
      ShiftRight: { key: 'shift' },
      KeyG: { action: 'drop-bag' },
      Digit1: { action: 'primary-gun' },
      Digit2: { action: 'secondary-gun' },
      KeyM: { action: 'map-mode' },
      KeyC: { action: 'laser' },
      Space: { action: 'slow' },
   };
   window.gameState = {
      player: new Player(100, 200, 35, 250),
      world: new World(1500, 1500),
      obstacles: [
         // new Obstacle(0, 0, 0, 1000),
         // new Obstacle(0, 0, 1500, 0),
         // new Obstacle(0, 1000, 1500, 0),
         // new Obstacle(1500, 0, 0, 1000),
         new Obstacle(1150, 250, 100, 100),
         // new Obstacle(0, 600, 700, 0),
         new Obstacle(900, 0, 100, 600),
         // new Obstacle(200, 700, 300, 50),
         new Obstacle(0, 875, 800, 100),
         new Obstacle(0, 400, 350, 50),
         // new Obstacle(600, 150, 50, 150),
      ],
      bullets: [],
      cameras: [
         new Camera(840, 60, 135, 75, 300),
         new Camera(60, 640, 0, 75, 250),
         new Camera(500, 1220, 0, 75, 250, true),
      ],
      doors: [
         /*new Door(600, 0, 50, 150)*/
      ],
      items: [
         // new Bag(500, 1100, null),
         new Bag(300, 1100, null),
         new Gun(300, 200, 'Cz45'),
         new Gun(200, 100, 'Arrow'),
         new Gun(100, 1200, 'Spas12'),
         new Gun(100, 1400, 'Ak47'),
      ],
   };
   gameState.lines = [];
   gameState.obstacles.push(new Obstacle(0, 0, gameState.world.width, 0));
   gameState.obstacles.push(new Obstacle(0, gameState.world.height, gameState.world.width, 0));
   gameState.obstacles.push(new Obstacle(0, 0, 0, gameState.world.height));
   gameState.obstacles.push(new Obstacle(gameState.world.width, 0, 0, gameState.world.height));
   gameState.obstacles.forEach((obstacle) => {
      obstacle.lines().forEach((line) => {
         gameState.lines.push(line);
      });
   });
   gameState.doors.forEach((door) => {
      door.lines().forEach((line) => {
         gameState.lines.push(line);
      });
   });

   let points = [];
   gameState.lines.forEach((line) => {
      points.push(line.start.copy(), line.end.copy());
   });
   let pointSet = {};
   window.uniquePoints = points.filter((point) => {
      const key = `${point.x},${point.y}`;
      if (key in pointSet) {
         return false;
      } else {
         pointSet[key] = true;
         return true;
      }
   });
   window.strokeSize = 1;
   let camera = new Vec(gameState.player.pos.x, gameState.player.pos.y);
   window.mouseDown = false;
   window.zoomIn = false;
   window.zoomInTimer = 0;
   let mouse = new Vec(0, 0);
   let targetCamera = new Vec(gameState.player.pos.x, gameState.player.pos.y);
   window.scale = 1;
   window.mapMode = false;
   window.targetScale = 1.3;
   window.backgroundColor = '#5e3c10';
   window.rayCastColor = '#6e4c20';
   window.cameraV = new Vec(0, 0);
   window.cameraVFric = 0.9;
   window.cameraAngle = 0;

   function lerp(start, end, time) {
      return start * (1 - time) + end * time;
   }

   window.offset = function ({ x, y }) {
      return new Vec(
         Math.round((x - camera.x) * scale + canvas.width / 2),
         Math.round((y - camera.y) * scale + canvas.height / 2)
      );
   };

   window.mousePos = function () {
      const pos = offset(new Vec(0, 0));
      return new Vec(((mouse.x - pos.x) * 1) / scale, ((mouse.y - pos.y) * 1) / scale);
   };

   function update(state, delta) {
      delta = Math.min(delta, 1 / 30) / (window.slowmo ? 4 : 1);
      if (zoomIn && state.player.holdingGun) {
         targetScale = 1.3 + Math.min(zoomInTimer / 2, 0.25);
      } else {
         targetScale = 1.3;
      }

      scale += (targetScale - scale) * delta * 2.5;

      if (mapMode) {
         scale = 0.4;
      }

      state.player.update(input, state, delta);
      state.items.forEach((item) => {
         item.update();
      });

      for (let i = state.bullets.length - 1; i >= 0; i--) {
         state.bullets[i].update(state, delta);
         if (state.bullets[i].delete) {
            state.bullets.splice(i, 1);
         }
      }

      state.cameras.forEach((camera) => {
         camera.update(state, delta);
      });

      if (zoomIn) {
         zoomInTimer += delta;
         // camera.x = state.player.pos.x;
         // camera.y = state.player.pos.y;
         // const pos = mousePos();
         // camera.x += (pos.x - state.player.pos.x) * Math.min(zoomInTimer / 8, 4) * delta * 5;
         // camera.y += (pos.y - state.player.pos.y) * Math.min(zoomInTimer / 8, 4) * delta * 5;
      } else {
         zoomInTimer = 0;
      }
      // camera.x += (state.player.pos.x - camera.x) * delta * 10;
      // camera.y += (state.player.pos.y - camera.y) * delta * 10;
      cameraV.x *= Math.pow(cameraVFric, delta * 20);
      cameraV.y *= Math.pow(cameraVFric, delta * 20);

      const dtheta = -cameraAngle;
      if (dtheta > Math.PI) {
         cameraAngle += 2 * Math.PI;
      } else if (dtheta < -Math.PI) {
         cameraAngle -= 2 * Math.PI;
      }
      cameraAngle = lerp(cameraAngle, 0, delta * 15);
      if (state.player.shotThisFrame) {
         const angle = state.player.angle;
         cameraAngle += (Math.random() - 0.5) * 0.1;
         // if (cameraAngle < -0.2) {
         //    cameraAngle = -0.2;
         // }
         // if (cameraAngle > 0.2) {
         //    cameraAngle = 0.2;
         // }
         scale -= 0.01;
         cameraV.x += Math.cos(angle) * (1 + Math.random() * 20);
         cameraV.y += Math.sin(angle) * (1 + Math.random() * 20);
      }
      camera.x = state.player.pos.x + cameraV.x;
      camera.y = state.player.pos.y + cameraV.y;
   }

   // function detectMouseHoverOnElements(state) {
   //    const pos = mousePos();
   //    let selected = null;
   //    let type = null;

   //    for (let i = 0; i < state.bags.length; i++) {
   //       if (state.bags[i].intersects(pos)) {
   //          selected = i;
   //          type = 'bags';
   //       }
   //    }
   //    if (selected === null) return;
   //    state[type][selected].showHoverData(ctx);
   // }

   function render(state) {
      // ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // const points = Ray.getPoints(state.player.pos, uniquePoints, state.lines, state.player.radius);
      // ctx.fillStyle = '#aba9c4';
      // ctx.beginPath();
      // ctx.globalAlpha = 1;
      // ctx.lineWidth = 20;
      // if (!mapMode) {
      //    for (const { x, y } of points) {
      //       const pos = offset({ x, y }).round();
      //       ctx.lineTo(pos.x, pos.y);
      //    }
      // } else {
      //    ctx.lineTo(0, 0);
      //    ctx.lineTo(canvas.width, 0);
      //    ctx.lineTo(canvas.width, canvas.height);
      //    ctx.lineTo(0, canvas.width);
      //    ctx.lineTo(0, 0);
      // }
      // ctx.fill();
      // ctx.globalAlpha = 1;

      // ctx.globalCompositeOperation = 'destination-in';

      // ctx.globalCompositeOperation = 'source-in';

      // ct.clearRect(0, 0, can.width, can.height);
      ct.fillStyle = backgroundColor;
      ct.fillRect(0, 0, can.width, can.height);
      ct.save();
      ct.translate(can.width / 2, can.height / 2);
      ct.rotate(cameraAngle);
      ct.translate(-can.width / 2, -can.height / 2);
      const points = Ray.getPoints(state.player.pos, uniquePoints, state.lines, state.player.radius);
      ct.fillStyle = window.rayCastColor;
      ct.beginPath();
      ct.globalAlpha = 1;
      ct.lineWidth = 20;
      if (!mapMode) {
         for (const { x, y } of points) {
            const pos = offset({ x, y }).round();
            ct.lineTo(pos.x, pos.y);
         }
      } else {
         ct.lineTo(0, 0);
         ct.lineTo(canvas.width, 0);
         ct.lineTo(canvas.width, canvas.height);
         ct.lineTo(0, canvas.width);
         ct.lineTo(0, 0);
      }
      ct.fill();
      ct.globalAlpha = 1;
      // ctx.clearRect(0, 0, rayCanvas.width, rayCanvas.height);
      // state.world.render({ ctx, canvas });
      state.cameras.forEach((camera) => {
         camera.render({ ctx: ct, canvas: can });
      });
      state.obstacles.forEach((obstacle) => {
         obstacle.render({ ctx: ct, canvas: can });
      });
      state.doors.forEach((door) => {
         door.render({ ctx: ct, canvas: can });
      });
      // state.lines.forEach((line) => {
      //    line.render(ct);
      // });
      // ctx.globalCompositeOperation = 'source-in';
      state.items.forEach((item) => {
         item.render({ ctx: ct, canvas: can });
      });

      ct.restore();
      // ctx.globalCompositeOperation = 'source-over';
      ctx.imageSmoothingQuality = 'low';
      // ctx.save();
      // ctx.translate(can.width / 2, can.height / 2);
      // ctx.rotate(window.cameraAngle);
      // ctx.translate(-can.width / 2, -can.height / 2);
      ctx.drawImage(can, 0, 0, can.width, can.height);

      ctx.globalCompositeOperation = 'destination-over';

      ctx.fillStyle = '#131214';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(cameraAngle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      state.player.render(ctx);
      ctx.restore();
      state.bullets.forEach((bullet) => {
         bullet.render({ ctx, canvas });
      });
      state.player.ui(ctx, canvas);

      // ctx.restore();

      // detectMouseHoverOnElements(state);

      // // ctx.beginPath();
      // const pos = offset(mousePos());
      // ctx.arc(pos.x, pos.y, 2 * scale, 0, Math.PI * 2);
      // ctx.fillStyle = 'white';
      // ctx.fill();
   }

   let lastFrame = window.performance.now();
   (function run() {
      stats.begin();
      const delta = 1 / 120; //(window.performance.now() - lastFrame) / 1000;
      lastFrame = window.performance.now();
      update(gameState, delta);
      update(gameState, delta);
      render(gameState);
      stats.end();
      requestAnimationFrame(run);
   })();

   window.slowmo = false;

   function resize() {
      canvas.width = 1600;
      canvas.height = 900;
      can.width = 1600;
      can.height = 900;
   }

   function trackKeys(event) {
      if (event.repeat) return;
      if (controls[event.code] !== undefined) {
         if (controls[event.code].key !== undefined) {
            input[controls[event.code].key] = event.type === 'keydown';
         }
         if (controls[event.code].action === 'slow') {
            window.slowmo = event.type === 'keydown';
         }
         if (controls[event.code].action !== undefined && event.type === 'keydown') {
            if (controls[event.code].action === 'drop-bag') {
               gameState.player.dropBag(gameState);
            }
            if (controls[event.code].action === 'primary-gun') {
               gameState.player.togglePrimaryGun();
            }
            if (controls[event.code].action === 'secondary-gun') {
               gameState.player.toggleSecondaryGun();
            }
            if (controls[event.code].action === 'map-mode') {
               window.mapMode = !window.mapMode;
            }
            if (controls[event.code].action === 'laser') {
               window.showLaser = !window.showLaser;
            }
         }
      }
   }

   resize();
   window.addEventListener('resize', () => {
      resize();
   });
   window.addEventListener('mousemove', (event) => {
      gameState.player.targetAngle = Math.atan2(
         event.pageY - window.innerHeight / 2,
         event.pageX - window.innerWidth / 2
      );
      mouse.x = event.pageX;
      mouse.y = event.pageY;
   });
   window.addEventListener('mousedown', (event) => {
      event.preventDefault();
      if (event.button === 0) {
         mouseDown = true;
         gameState.player.shouldShoot = true;
         gameState.player.shouldShootLastFrame = false;
      } else if (event.button === 2) {
         zoomIn = true;
      }
   });
   window.addEventListener('mouseup', (event) => {
      event.preventDefault();
      if (event.button === 0) {
         mouseDown = false;
         gameState.player.shouldShoot = false;
         gameState.player.shouldShootLastFrame = true;
      } else if (event.button === 2) {
         zoomIn = false;
         zoomInTimer = 0;
      }
   });
   // window.addEventListener('wheel', (event) => {
   //    window.scale -= Math.sign(event.deltaY) * 0.3;
   //    window.scale = Math.min(window.scale, 5);
   //    window.scale = Math.max(window.scale, 0.2);
   // });
   window.addEventListener('keydown', trackKeys);
   window.addEventListener('keyup', trackKeys);

   console.log('running...');
}

export default sandbox;
