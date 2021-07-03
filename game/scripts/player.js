import Vec from './vector.js';
import Ray from './raycast.js';
import Bag from './bag.js';

export default class Player {
   constructor(x, y, radius, speed) {
      this.pos = new Vec(x, y);
      this.vel = new Vec(0, 0);
      this.radius = radius;
      this.speed = speed;
      this.angle = 0;
      this.targetAngle = 0;
      this.angleRate = 5;
      this.bag = new Bag(this.pos.x, this.pos.y, null);
      this.triggerText = '';
      this.triggerColor = 'white';
   }
   renderPos() {
      return offset(this.pos);
   }
   whyCantPickUpItem(item) {
      if (item.bag) {
         if (this.bag !== null) {
            return 'Already carrying something';
         }
      }
      return '';
   }
   canPickUpItem(item) {
      if (item.bag) {
         return this.bag === null;
      }
      return false;
   }
   pickUp(array, index, item) {
      if (item.bag) {
         if (this.bag === null) {
            this.bag = new Bag(this.pos.x, this.pos.y, item.content);
            array.splice(index, 1);
         }
      }
   }
   dropBag(state) {
      if (this.bag === null) return;
      state.bags.push(
         new Bag(
            this.pos.x - Math.cos(this.angle) * this.radius * 1.5,
            this.pos.y - Math.sin(this.angle) * this.radius * 1.5,
            this.bag.content
         )
      );
      this.bag = null;
   }
   update(input, state, delta) {
      // const dtheta = this.targetAngle - this.angle;
      // if (dtheta > Math.PI) {
      //    this.angle += 2 * Math.PI;
      // } else if (dtheta < -Math.PI) {
      //    this.angle -= 2 * Math.PI;
      // }
      // this.angle = lerp(this.angle, this.targetAngle, delta * this.angleRate);
      this.angle = this.targetAngle;

      this.vel.x = (input.right - input.left) * delta * this.speed;
      this.vel.y = (input.down - input.up) * delta * this.speed;
      this.pos.add(this.vel);

      this.boundFromWorld(state.world);

      state.obstacles.forEach((obstacle) => {
         obstacle.collide(this);
      });

      // if (input.pickup) {
      let closest = null;
      let type = null;

      for (let i = 0; i < state.bags.length; i++) {
         const bag = state.bags[i];
         if (bag.collide(this)) {
            type = 'bags';
            closest = i;
         }
      }

      this.triggerText = '';
      if (closest !== null) {
         if (input.pickup) {
            this.pickUp(state[type], closest, state[type][closest]);
         } else if (this.canPickUpItem(state[type][closest])) {
            this.triggerText = `Hit [F] to pick up ${type === 'bag' ? 'bag' : 'item'}`;
            this.triggerColor = 'white';
         } else {
            this.triggerText = this.whyCantPickUpItem(state[type][closest]);
            this.triggerColor = 'gray';
         }
      }
      // }
   }
   boundFromWorld({ width, height }) {
      if (this.pos.x < this.radius) {
         this.pos.x = this.radius;
      }
      if (this.pos.x > width - this.radius) {
         this.pos.x = width - this.radius;
      }
      if (this.pos.y < this.radius) {
         this.pos.y = this.radius;
      }
      if (this.pos.y > height - this.radius) {
         this.pos.y = height - this.radius;
      }
   }
   render({ lines }, { ctx, canvas }) {
      const points = Ray.getPoints(this.pos, lines, this.radius);

      ctx.fillStyle = 'rgb(150, 150, 150)';
      ctx.beginPath();
      ctx.globalAlpha = 0.05;
      ctx.lineWidth = 20;
      for (const { x, y } of points) {
         const pos = offset({ x, y });
         ctx.lineTo(pos.x, pos.y);
      }
      ctx.fill();
      ctx.globalAlpha = 1;

      const pos = this.renderPos();
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(this.angle + Math.PI / 2);
      ctx.lineWidth = strokeSize * 2;
      ctx.fillStyle = '#7d7d7d';
      ctx.strokeStyle = '#363636';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = '#363636';
      ctx.arc((-this.radius / 1.4) * scale, (-this.radius / 1.2) * scale, (this.radius / 3.2) * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc((this.radius / 1.4) * scale, (-this.radius / 1.2) * scale, (this.radius / 3.2) * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (this.bag !== null) {
         ctx.fillStyle = '#61440e';
         ctx.strokeStyle = '#261900';
         ctx.lineWidth = strokeSize * 2;
         ctx.beginPath();
         ctx.ellipse(
            0,
            (this.radius / 2) * scale,
            (this.radius / 1.2) * scale,
            (this.radius / 1.5) * scale,
            0,
            0,
            Math.PI * 2
         );
         ctx.fill();
         ctx.stroke();
      }
      ctx.restore();
      if (this.triggerText.length > 0) {
         ctx.fillStyle = this.triggerColor;
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.font = `${50}px Harmattan`;
         ctx.save();
         ctx.shadowBlur = 0;
         ctx.shadowColor = 'black';
         ctx.shadowOffsetX = 3;
         ctx.shadowOffsetY = 3;
         ctx.fillText(this.triggerText, window.innerWidth / 2, window.innerHeight / 2 + window.innerHeight / 5);
         ctx.restore();
      }
   }
}

function lerp(start, end, time) {
   return start * (1 - time) + end * time;
}
