import Vec from './vector.js';
import Ray from './raycast.js';
import Bag from './bag.js';

const Status = {
   Disguised: { color: '#9c9c9c', detection: 1 },
   Conspicuous: { color: '#d9d9d9', detection: 1.5 },
   Distinguishable: { color: '#f05135', detection: 1.75 },
   Suspicious: { color: '#bd0d0d', detection: 2 },
};

export default class Player {
   constructor(x, y, radius, speed) {
      this.pos = new Vec(x, y);
      this.vel = new Vec(0, 0);
      this.radius = radius;
      this.speed = speed;
      this.angle = 0;
      this.targetAngle = 0;
      this.angleRate = 5;
      this.bag = null;
      this.triggerText = '';
      this.triggerColor = '#bababa';
      this.triggerItemName = '';
      this.status = 'Disguised';
      this.pickingUp = null;
      this.statusColor = Status[this.status].color;
      this.name = 'ZeroTix';
   }
   determineStatus(input) {
      let status = 'Disguised';
      if (input.shift || this.carryingBag) {
         status = 'Conspicuous';
      }
      if (this.pickingUp) {
         status = 'Suspicious';
      }
      if (input.shift && this.carryingBag) {
         status = 'Distinguishable';
      }
      if (Status[status] === undefined) {
         throw new Error(`Did not define ${status} in Status`);
      }
      return status;
   }
   get carryingBag() {
      return this.bag !== null;
   }
   renderPos() {
      return offset(this.pos);
   }
   whyCantPickUpItem(item) {
      if (item.bag) {
         if (this.carryingBag) {
            return 'Already carrying something';
         }
      }
      return '';
   }
   canPickUpItem(item) {
      if (item.bag) {
         return !this.carryingBag;
      }
      return false;
   }
   pickUp(array, index, item, delta) {
      if (item.bag) {
         if (this.bag === null) {
            item.holdingProgress += delta;
            this.pickingUp = { progress: item.holdingProgress, max: item.timeToPickUp };
            item.pickingUp = true;
            if (item.holdingProgress > item.timeToPickUp) {
               this.bag = new Bag(this.pos.x, this.pos.y, item.content);
               array.splice(index, 1);
            }
         }
      }
   }
   dropBag(state) {
      if (!this.carryingBag) return;
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
      if (input.shift) {
         this.vel.x *= 1.5;
         this.vel.y *= 1.5;
      }
      if (this.carryingBag) {
         this.vel.x *= 0.65;
         this.vel.y *= 0.65;
      }
      if (this.pickingUp !== null) {
         this.vel.x = 0;
         this.vel.y = 0;
      }
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
         bag.pickingUp = false;
         if (bag.collide(this)) {
            type = 'bags';
            closest = i;
         }
      }

      this.triggerText = '';
      this.triggerItemName = '';
      this.pickingUp = null;
      if (closest !== null) {
         if (this.canPickUpItem(state[type][closest])) {
            if (type === 'bags') {
               this.triggerText = `Hold [F] to carry`;
               this.triggerColor = '#d4d4d4';
               this.triggerItemName = 'Equipment Bag';
            } else {
               this.triggerText = 'UNKNOWN';
            }
         }
         if (input.pickup && this.canPickUpItem(state[type][closest])) {
            this.pickingUp = true;
            this.pickUp(state[type], closest, state[type][closest], delta);
         } else if (!this.canPickUpItem(state[type][closest])) {
            this.triggerText = this.whyCantPickUpItem(state[type][closest]);
            this.triggerColor = 'gray';
            if (type === 'bags') {
               this.triggerItemName = 'Equipment Bag';
            } else {
               this.triggerItemName = 'UNKNOWN';
            }
         }
      }

      const status = this.determineStatus(input);
      this.status = status;
      this.statusColor = Status[this.status].color;
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
      ctx.fillStyle = 'rgb(160, 160, 160)';
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
         ctx.font = `${40}px Harmattan`;
         ctx.save();
         ctx.shadowBlur = 0;
         ctx.shadowColor = 'black';
         ctx.shadowOffsetX = 3;
         ctx.shadowOffsetY = 3;
         ctx.fillText(this.triggerText, canvas.width / 2, canvas.height / 2 + canvas.height / 6);
         ctx.fillStyle = 'white';
         ctx.fillText(this.triggerItemName, canvas.width / 2, canvas.height / 2 - canvas.height / 6);
         ctx.restore();
      }
      if (this.pickingUp !== null) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
         const width = this.radius * 3 * scale;
         const height = 20 * scale;
         ctx.roundRect(
            this.renderPos().x - width / 2,
            offset({ x: 0, y: this.pos.y - this.radius * 1.7 }).y - height / 2,
            width,
            height,
            2 * scale
         ).fill();
         ctx.fillStyle = 'rgb(255, 255, 255)';
         ctx.roundRect(
            this.renderPos().x - width / 2,
            offset({ x: 0, y: this.pos.y - this.radius * 1.7 }).y - height / 2,
            (this.pickingUp.progress / this.pickingUp.max) * width,
            height,
            2 * scale
         ).fill();
      }
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${20 * scale}px Harmattan`;
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 1 * scale;
      ctx.shadowOffsetY = 1 * scale;
      // ctx.fillText(this.name, this.renderPos().x, offset(new Vec(0, this.pos.y - this.radius * 1.6)).y);
      ctx.font = `${25 * scale}px Harmattan`;
      ctx.fillStyle = this.statusColor;
      ctx.fillText(this.status, this.renderPos().x, offset(new Vec(0, this.pos.y + this.radius * 1.8)).y);
      ctx.restore();
   }
}

function lerp(start, end, time) {
   return start * (1 - time) + end * time;
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
   if (w < 2 * r) r = w / 2;
   if (h < 2 * r) r = h / 2;
   this.beginPath();
   this.moveTo(x + r, y);
   this.arcTo(x + w, y, x + w, y + h, r);
   this.arcTo(x + w, y + h, x, y + h, r);
   this.arcTo(x, y + h, x, y, r);
   this.arcTo(x, y, x + w, y, r);
   this.closePath();
   return this;
};
