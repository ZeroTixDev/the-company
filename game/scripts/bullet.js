import Vec from './vector.js';
import Guns from '../data/gun.js';

export default class Bullet {
   constructor(pos, angle, type = null, extraData = {}) {
      this.pos = pos.copy();
      this.angle = angle;
      this.type = type;
      this.speed = Guns[this.type]?.bulletSpeed === undefined ? 10 : Guns[this.type].bulletSpeed;
      this.radius = Guns[this.type]?.bulletRadius === undefined ? 10 : Guns[this.type].bulletRadius;
      this.alpha = 1;
      this.dead = false;
      this.life = Guns[this.type]?.life;
      this.historyLength = Guns[this.type]?.historyLength === undefined ? 30 : Guns[this.type].historyLength;
      this.maxLife = this.life;
      this.history = [];
      if (extraData.bulletSpeed) {
         this.speed = extraData.bulletSpeed;
         console.log(this.speed);
      }
      this.vel = new Vec(Math.cos(this.angle) * this.speed, Math.sin(this.angle) * this.speed);
   }
   update(state, delta) {
      if (this.dead) {
         this.radius += delta * 15;
         this.alpha -= delta * 3;
         if (this.alpha < 0) {
            this.delete = true;
         }
         this.history.shift();
      } else {
         this.history.push({ pos: this.pos.copy(), radius: this.radius });
         if (this.history.length > this.historyLength) {
            this.history.shift();
         }
      }

      if (this.life !== undefined && !this.dead) {
         this.life -= delta;
         this.alpha = this.life / this.maxLife;
         this.alpha = Math.min(this.alpha, 1);
         this.alpha = Math.max(this.alpha, 0);
         if (this.life < 0) {
            this.dead = true;
         }
      }
      if (!this.dead) {
         const amount = Math.ceil(this.speed / 100);
         for (let i = 0; i < amount; i++) {
            this.pos.add(this.vel.scale(delta / amount));
            state.obstacles.forEach((obstacle) => {
               const collision = obstacle.touchingBullet(this);
               if (collision.type) {
                  this.dead = true;
               }
            });
            state.cameras.forEach((camera) => {
               if (!camera.disabled && camera.touchingBullet(this)) {
                  camera.disable();
                  this.dead = true;
               }
            });
         }
      }
   }
   render({ ctx, canvas }) {
      let pos = offset(this.pos);
      ctx.translate(pos.x, pos.y);
      ctx.rotate(this.angle + Math.PI / 2);
      ctx.globalAlpha = this.alpha;
      if (Guns[this.type]?.bulletRender === undefined) {
         ctx.fillStyle = 'white';
         ctx.beginPath();
         ctx.arc(0, 0, this.radius * scale, 0, Math.PI * 2);
         ctx.fill();
      } else {
         Guns[this.type].bulletRender({ ctx, radius: this.radius, scale });
      }
      ctx.globalAlpha = 1;
      ctx.rotate(-(this.angle + Math.PI / 2));
      ctx.translate(-pos.x, -pos.y);
      for (let i = this.history.length - 1; i >= 0; i--) {
         let { pos, radius } = this.history[i];
         pos = offset(pos);
         ctx.globalAlpha = (i / this.history.length) * 0.9;
         ctx.translate(pos.x, pos.y);
         ctx.rotate(this.angle + Math.PI / 2);
         // ctx.globalAlpha = this.alpha;
         if (Guns[this.type]?.bulletRender === undefined) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
            ctx.fill();
         } else {
            Guns[this.type].bulletRender({ ctx, radius, scale });
         }
         ctx.globalAlpha = 1;
         ctx.rotate(-(this.angle + Math.PI / 2));
         ctx.translate(-pos.x, -pos.y);
      }
   }
}
