import Player from '../scripts/player.js';
import World from '../scripts/world.js';
import Vec from '../scripts/vector.js';
import Bag from '../scripts/bag.js';
import Obstacle from '../scripts/obstacle.js';

const canvas = document.querySelector('.game-canvas');
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
};
window.gameState = {
   player: new Player(100, 100, 35, 250),
   world: new World(1500, 1000),
   obstacles: [
      new Obstacle(1150, 250, 100, 100),
      new Obstacle(0, 200, 700, 0),
      new Obstacle(900, 0, 0, 600),
      new Obstacle(400, 400, 500, 0),
      new Obstacle(400, 600, 800, 100),
      new Obstacle(500, 875, 800, 100),
   ],
   bags: [new Bag(800, 500, null), new Bag(500, 100, null)],
};
gameState.lines = [...gameState.world.lines()];
gameState.obstacles.forEach((obstacle) => {
   obstacle.lines().forEach((line) => {
      gameState.lines.push(line);
   });
});
window.strokeSize = 2;
const camera = new Vec(gameState.player.pos.x, gameState.player.pos.y);
const mouse = new Vec(0, 0);
window.scale = 1.2;
window.backgroundColor = '#4d3b10';

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
   state.bags.forEach((bag) => {
      bag.update();
   });
   camera.x = state.player.pos.x;
   camera.y = state.player.pos.y;
}

function detectMouseHoverOnElements(state) {
   const pos = mousePos();
   let selected = null;
   let type = null;

   for (let i = 0; i < state.bags.length; i++) {
      if (state.bags[i].intersects(pos)) {
         selected = i;
         type = 'bags';
      }
   }
   if (selected === null) return;
   state[type][selected].showHoverData(ctx);
}

function render(state) {
   ctx.fillStyle = 'rgb(97, 79, 36)';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   // state.world.render({ ctx, canvas });

   state.obstacles.forEach((obstacle) => {
      obstacle.render({ ctx, canvas });
   });
   // state.lines.forEach((line) => {
   //    line.render(ctx);
   // });
   // ctx.globalCompositeOperation = 'source-in';
   state.bags.forEach((bag) => {
      bag.render({ ctx, canvas });
   });
   // ctx.globalCompositeOperation = 'source-over';
   state.player.render(state, { ctx, canvas });
   detectMouseHoverOnElements(state);
   // ctx.beginPath();
   // const pos = offset(mousePos());
   // ctx.arc(pos.x, pos.y, 2 * scale, 0, Math.PI * 2);
   // ctx.fillStyle = 'white';
   // ctx.fill();
}
let lastFrame = window.performance.now();
(function run() {
   const delta = (window.performance.now() - lastFrame) / 1000;
   lastFrame = window.performance.now();
   update(gameState, delta);
   render(gameState);
   requestAnimationFrame(run);
})();

function resize() {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
}

function trackKeys(event) {
   if (event.repeat) return;
   if (controls[event.code] !== undefined) {
      if (controls[event.code].key !== undefined) {
         input[controls[event.code].key] = event.type === 'keydown';
      }
      if (controls[event.code].action !== undefined) {
         if (controls[event.code].action === 'drop-bag') {
            gameState.player.dropBag(gameState);
         }
      }
   }
}

resize(canvas);
window.addEventListener('resize', () => {
   resize(canvas);
});
window.addEventListener('mousemove', (event) => {
   gameState.player.targetAngle = Math.atan2(event.pageY - window.innerHeight / 2, event.pageX - window.innerWidth / 2);
   mouse.x = event.pageX;
   mouse.y = event.pageY;
});
window.addEventListener('wheel', (event) => {
   window.scale -= Math.sign(event.deltaY) * 0.3;
   window.scale = Math.min(window.scale, 5);
   window.scale = Math.max(window.scale, 0.2);
});
window.addEventListener('keydown', trackKeys);
window.addEventListener('keyup', trackKeys);

console.log('running...');
