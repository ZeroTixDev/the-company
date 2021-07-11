import Player from '../scripts/player.js';
import World from '../scripts/world.js';
import Vec from '../scripts/vector.js';
import Bag from '../scripts/bag.js';
import Obstacle from '../scripts/obstacle.js';
import Ray from '../scripts/raycast.js';
import Gun from '../scripts/gun.js';

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
};
window.gameState = {
   player: new Player(100, 100, 35, 250),
   world: new World(1500, 1000),
   obstacles: [
      new Obstacle(0, 0, 0, 1000),
      new Obstacle(0, 0, 1500, 0),
      new Obstacle(0, 1000, 1500, 0),
      new Obstacle(1500, 0, 0, 1000),
      new Obstacle(1150, 250, 100, 100),
      new Obstacle(0, 600, 700, 0),
      new Obstacle(900, 0, 100, 600),
      new Obstacle(400, 400, 500, 0),
      new Obstacle(500, 875, 800, 100),
   ],
   items: [
      new Bag(800, 500, null),
      new Bag(500, 500, null),
      new Gun(200, 200, 'Cz45'),
      new Gun(300, 200, 'Cz45'),
      new Gun(400, 200, 'Spas12'),
      new Gun(600, 200, 'Spas12'),
   ],
};
gameState.lines = [...gameState.world.lines()];
gameState.obstacles.forEach((obstacle) => {
   obstacle.lines().forEach((line) => {
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
const camera = new Vec(gameState.player.pos.x, gameState.player.pos.y);
window.mouseDown = false;
const mouse = new Vec(0, 0);
window.scale = 1.2;
window.backgroundColor = '#8d8d99';

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
   state.player.update(input, state, delta);
   state.items.forEach((item) => {
      item.update();
   });
   camera.x = state.player.pos.x;
   camera.y = state.player.pos.y;
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
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   const points = Ray.getPoints(state.player.pos, uniquePoints, state.lines, state.player.radius);
   ctx.fillStyle = '#aba9c4';
   ctx.beginPath();
   ctx.globalAlpha = 1;
   ctx.lineWidth = 20;
   for (const { x, y } of points) {
      const pos = offset({ x, y }).round();
      ctx.lineTo(pos.x, pos.y);
   }
   ctx.fill();
   ctx.globalAlpha = 1;

   // ctx.globalCompositeOperation = 'destination-in';

   ctx.globalCompositeOperation = 'source-in';
   // ct.clearRect(0, 0, can.width, can.height);
   ct.fillStyle = backgroundColor;
   ct.fillRect(0, 0, can.width, can.height);
   // ctx.clearRect(0, 0, rayCanvas.width, rayCanvas.height);
   // state.world.render({ ctx, canvas });

   state.obstacles.forEach((obstacle) => {
      obstacle.render({ ctx: ct, canvas: can });
   });
   // state.lines.forEach((line) => {
   //    line.render(ct);
   // });
   // ctx.globalCompositeOperation = 'source-in';
   state.items.forEach((item) => {
      item.render({ ctx: ct, canvas: can });
   });
   // ctx.globalCompositeOperation = 'source-over';
   ctx.imageSmoothingQuality = 'low';
   ctx.drawImage(can, 0, 0, can.width, can.height);

   ctx.globalCompositeOperation = 'destination-over';

   ctx.fillStyle = '#31303b';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   ctx.globalCompositeOperation = 'source-over';
   state.player.render(ctx);
   state.player.ui(ctx, canvas);

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
   const delta = (window.performance.now() - lastFrame) / 1000;
   lastFrame = window.performance.now();
   update(gameState, delta);
   render(gameState);
   stats.end();
   requestAnimationFrame(run);
})();

function resize() {
   canvas.width = window.innerWidth * window.devicePixelRatio;
   canvas.height = window.innerHeight * window.devicePixelRatio;
   can.width = window.innerWidth * window.devicePixelRatio;
   can.height = window.innerHeight * window.devicePixelRatio;

   canvas.style.width = `${window.innerWidth}px`;
   canvas.style.height = `${window.innerHeight}px`;
   can.style.width = `${window.innerWidth}px`;
   can.style.height = `${window.innerHeight}px`;

   function getScale() {
      return (
         Math.max(
            window.innerHeight * window.devicePixelRatio,
            window.innerWidth * window.devicePixelRatio * (9 / 16)
         ) / 1000
      );
   }
}

function trackKeys(event) {
   if (event.repeat) return;
   if (controls[event.code] !== undefined) {
      if (controls[event.code].key !== undefined) {
         input[controls[event.code].key] = event.type === 'keydown';
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
      }
   }
}

resize();
window.addEventListener('resize', () => {
   resize();
});
window.addEventListener('mousemove', (event) => {
   gameState.player.targetAngle = Math.atan2(event.pageY - window.innerHeight / 2, event.pageX - window.innerWidth / 2);
   mouse.x = event.pageX;
   mouse.y = event.pageY;
});
window.addEventListener('mousedown', (event) => {
   event.preventDefault();
   mouseDown = true;
});
window.addEventListener('mouseup', (event) => {
   event.preventDefault();
   mouseDown = false;
});
window.addEventListener('wheel', (event) => {
   window.scale -= Math.sign(event.deltaY) * 0.3;
   window.scale = Math.min(window.scale, 5);
   window.scale = Math.max(window.scale, 0.2);
});
window.addEventListener('keydown', trackKeys);
window.addEventListener('keyup', trackKeys);

console.log('running...');
