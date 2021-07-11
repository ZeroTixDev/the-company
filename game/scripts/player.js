import Vec from './vector.js';
import Bag from './bag.js';

const Status = {
   Disguised: { color: '#ffffff', detection: 1 },
   Conspicuous: { color: '#c4c4c4', detection: 1.5 },
   Distinguishable: { color: '#f05135', detection: 1.75 },
   Suspicious: { color: '#f20f0f', detection: 2 },
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
      this.health = 100;
      this.healthMax = 100;
      this.armor = { health: 0 };
      this.sprintBar = { amount: 100 };
      this.sprintRate = 20;
      this.notHoldingSprintTimer = 0;
      this.primaryGun = null;
      this.secondaryGun = null;
      this.currentSelectedGun = 'primary';
      this.selectedGun = false;
      this.pickUpLock = false;
   }
   togglePrimaryGun() {
      const old = this.currentSelectedGun;
      this.currentSelectedGun = 'primary';
      if (this.primaryGun == null && this.secondaryGun != null) {
         this.currentSelectedGun = 'secondary';
      }
      if (!this.selectedGun) {
         this.selectedGun = true;
      } else if (old === this.currentSelectedGun) {
         this.selectedGun = false;
      }
   }
   toggleSecondaryGun() {
      const old = this.currentSelectedGun;
      this.currentSelectedGun = 'secondary';
      if (this.secondaryGun == null && this.primaryGun != null) {
         this.currentSelectedGun = 'primary';
      }
      if (!this.selectedGun) {
         this.selectedGun = true;
      } else if (old === this.currentSelectedGun) {
         this.selectedGun = false;
      }
   }
   determineStatus(input, moved) {
      let status = 'Disguised';
      if ((input.shift && moved && this.sprintBar.amount > 0) || this.carryingBag) {
         status = 'Conspicuous';
      }
      if (this.pickingUp) {
         status = 'Suspicious';
      }
      if (input.shift && moved && this.sprintBar.amount > 0 && this.carryingBag) {
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
   canPickUpItem(item, pickUpLock) {
      if (item.bag) {
         return !this.carryingBag;
      }
      if (item.gun) {
         return !pickUpLock;
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
      if (item.gun) {
         this.pickUpLock = true;
         const newGun = item.copy();
         array.splice(index, 1);
         if (this.primaryGun == null) {
            this.primaryGun = newGun;
         } else if (this.secondaryGun == null) {
            this.secondaryGun = newGun;
         } else {
            if (this.currentSelectedGun === 'primary') {
               array.push(
                  this.primaryGun.copy(
                     new Vec(
                        this.pos.x - Math.cos(this.angle) * this.radius * 1.5,
                        this.pos.y - Math.sin(this.angle) * this.radius * 1.5
                     )
                  )
               );
               this.primaryGun = newGun;
            } else if (this.currentSelectedGun === 'secondary') {
               array.push(
                  this.secondaryGun.copy(
                     new Vec(
                        this.pos.x - Math.cos(this.angle) * this.radius * 1.5,
                        this.pos.y - Math.sin(this.angle) * this.radius * 1.5
                     )
                  )
               );
               this.secondaryGun = newGun;
            }
         }
      }
   }
   dropBag(state) {
      if (!this.carryingBag) return;
      state.items.push(
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
      let oldPos = this.pos.copy();
      this.angle = this.targetAngle;

      this.vel.x = (input.right - input.left) * delta * this.speed;
      this.vel.y = (input.down - input.up) * delta * this.speed;
      if (input.shift) {
         this.notHoldingSprintTimer = 0;
      } else {
         this.notHoldingSprintTimer += delta;
      }
      if (input.shift && this.sprintBar.amount > 0) {
         this.vel.x *= 1.7;
         this.vel.y *= 1.7;
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

      const moved = !oldPos.same(this.pos);

      if (input.shift && moved && this.sprintBar.amount > 0) {
         this.sprintBar.amount -= (this.sprintRate / 2) * delta;
         this.sprintBar.amount = Math.max(this.sprintBar.amount, 0);
      } else if (!input.shift && this.notHoldingSprintTimer > 1) {
         this.sprintBar.amount +=
            (this.sprintRate / 3) *
            (this.notHoldingSprintTimer > 2 ? Math.min(this.notHoldingSprintTimer / 2, 2) : 1) *
            delta;
         this.sprintBar.amount = Math.min(this.sprintBar.amount, 100);
      }

      if (!input.pickup) {
         this.pickUpLock = false;
      }

      // if (input.pickup) {
      let closest = null;

      for (let i = 0; i < state.items.length; i++) {
         const item = state.items[i];
         if (item.bag) {
            item.pickingUp = false;
         }
         if (item.collide(this)) {
            closest = i;
         }
      }

      this.triggerText = '';
      this.triggerItemName = '';
      this.pickingUp = null;
      if (closest !== null) {
         if (this.canPickUpItem(state.items[closest])) {
            if (state.items[closest].bag) {
               this.triggerText = `Hold [F] to carry`;
               this.triggerColor = 'white';
               this.triggerItemName = 'Equipment Bag';
            } else if (state.items[closest].gun) {
               this.triggerText = `Hit [F] to take weapon`;
               if (this.primaryGun !== null && this.secondaryGun !== null) {
                  this.triggerText = `Hit [F] to swap weapon`;
               }
               this.triggerColor = 'white';
               this.triggerItemName = state.items[closest].data.name;
            }
         }
         if (input.pickup && this.canPickUpItem(state.items[closest], this.pickUpLock)) {
            if (state.items[closest].hold) {
               this.pickingUp = true;
            }
            this.pickUp(state.items, closest, state.items[closest], delta);
         } else if (!this.canPickUpItem(state.items[closest])) {
            this.triggerText = this.whyCantPickUpItem(state.items[closest]);
            this.triggerColor = 'gray';
            if (state.items[closest].bag) {
               this.triggerItemName = 'Equipment Bag';
            } else if (state.items[closest].gun) {
               this.triggerItemName = state.items[closest].data.name;
            }
         }
      }
      const status = this.determineStatus(input, moved);
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
   render(ctx) {
      const pos = this.renderPos();
      // ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(this.angle + Math.PI / 2);
      ctx.lineWidth = strokeSize * 2;
      ctx.fillStyle = '#7d7d7d';
      ctx.strokeStyle = '#363636';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      //hands
      const gun = this.currentSelectedGun === 'primary' ? this.primaryGun : this.secondaryGun;
      if (this.selectedGun && gun != null && gun.data.render !== undefined) {
         gun.data.render({ ctx, radius: this.radius, scale });
      } else {
         ctx.beginPath();
         ctx.strokeStyle = '#363636';
         ctx.arc(
            (-this.radius / 1.4) * scale,
            (-this.radius / 1.2) * scale,
            (this.radius / 3.5) * scale,
            0,
            Math.PI * 2
         );
         ctx.fill();
         ctx.stroke();
         ctx.beginPath();
         ctx.arc(
            (this.radius / 1.4) * scale,
            (-this.radius / 1.2) * scale,
            (this.radius / 3.5) * scale,
            0,
            Math.PI * 2
         );
         ctx.fill();
         ctx.stroke();
      }

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
      // ctx.restore();
      ctx.rotate(-(this.angle + Math.PI / 2));
      ctx.translate(-pos.x, -pos.y);
   }
   ui(ctx, canvas) {
      if (this.triggerText.length > 0) {
         ctx.fillStyle = this.triggerColor;
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.font = `${40}px Harmattan`;
         // ctx.save();
         ctx.shadowBlur = 0;
         ctx.shadowColor = 'black';
         ctx.shadowOffsetX = 1.5;
         ctx.shadowOffsetY = 1.5;
         ctx.fillText(this.triggerText, canvas.width / 2, canvas.height / 2 + canvas.height / 6);
         ctx.fillStyle = 'white';
         ctx.fillText(this.triggerItemName, canvas.width / 2, canvas.height / 2 - canvas.height / 6);
         ctx.shadowColor = 'transparent';
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
      // ctx.fillText(this.name, this.renderPos().x, offset(new Vec(0, this.pos.y - this.radius * 1.6)).y);
      ctx.font = `${50}px Harmattan`;
      const textWidth = ctx.measureText(this.status).width;
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, canvas.height - 60, 40 + textWidth, 60);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      // ctx.textAlign = 'alphabetic';
      ctx.fillStyle = this.statusColor;
      ctx.fillText(this.status, 20 + textWidth / 2, canvas.height - 25);
      ctx.shadowColor = 'transparent';

      // background of health and armor bar
      ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
      ctx.fillRect(canvas.width - 375, canvas.height - 45, 285, 20);
      ctx.fillStyle = 'rgba(20, 20, 20)';
      ctx.fillRect(canvas.width - 373, canvas.height - 25, 285, 2);
      ctx.fillRect(canvas.width - 375 + 285, canvas.height - 43, 2, 18);

      // health bar
      const gradient = ctx.createLinearGradient(
         canvas.width - 100 - (this.health / this.healthMax) * 285,
         canvas.height - 25,
         canvas.width - 100 - (this.health / this.healthMax) * 285 + (this.health / this.healthMax) * 285,
         canvas.height - 25
      );
      gradient.addColorStop(0, '#178527');
      gradient.addColorStop(0.5, '#43bf56');
      gradient.addColorStop(1, '#178527');
      ctx.fillStyle = gradient;
      ctx.fillRect(
         canvas.width - 100 - (this.health / this.healthMax) * 275,
         canvas.height - 35,
         (this.health / this.healthMax) * 285,
         10
      );
      ctx.fillStyle = '#006aff';
      ctx.fillRect(
         canvas.width - 100 - (this.armor.health / 100) * 275,
         canvas.height - 45,
         (this.armor.health / 100) * 285,
         10
      );

      // sprint bar
      ctx.fillStyle = 'rgba(50, 50, 50)';
      ctx.fillRect(
         canvas.width - 100 - (this.sprintBar.amount / 100) * 225,
         canvas.height - 53,
         (this.sprintBar.amount / 100) * 237,
         6
      );
      ctx.fillStyle = 'white';
      ctx.fillRect(
         canvas.width - 100 - (this.sprintBar.amount / 100) * 225,
         canvas.height - 56,
         (this.sprintBar.amount / 100) * 235,
         6
      );

      // gun
      ctx.font = `${30}px Harmattan`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'black';
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;
      const width = 80;
      const height = 25;
      const radius = height / 2;
      // if only have one weapon
      if (
         (this.primaryGun == null && this.secondaryGun != null) ||
         (this.primaryGun != null && this.secondaryGun == null)
      ) {
         const gun = this.primaryGun == null ? this.secondaryGun : this.primaryGun;
         if (!this.selectedGun) {
            ctx.fillText(gun.data.name, canvas.width - 200 + 100 / 2, canvas.height - 70);
         } else {
            ctx.fillStyle = 'white';
            ctx.shadowColor = 'transparent';
            ctx.fillRect(canvas.width - 200 + 100 / 2 - width / 2, canvas.height - 74 - height / 2, width, height);
            ctx.beginPath();
            ctx.arc(canvas.width - 200 + 100 / 2 - width / 2, canvas.height - 74, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width - 200 + 100 / 2 + width / 2, canvas.height - 74, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillText(gun.data.name, canvas.width - 200 + 100 / 2, canvas.height - 70);
         }
      }
      ctx.fillStyle = 'white';
      // if you have two guns
      if (this.primaryGun != null && this.secondaryGun != null) {
         if (this.currentSelectedGun === 'secondary' && this.selectedGun) {
            ctx.shadowColor = 'transparent';
            ctx.fillRect(canvas.width - 200 + 100 / 2 - width / 2, canvas.height - 74 - height / 2, width, height);
            ctx.beginPath();
            ctx.arc(canvas.width - 200 + 100 / 2 - width / 2, canvas.height - 74, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width - 200 + 100 / 2 + width / 2, canvas.height - 74, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillText(this.secondaryGun.data.name, canvas.width - 200 + 100 / 2, canvas.height - 70);
         } else {
            ctx.fillStyle = 'white';
            ctx.shadowOffsetX = 1.5;
            ctx.shadowOffsetY = 1.5;
            ctx.fillText(this.secondaryGun.data.name, canvas.width - 200 + 100 / 2, canvas.height - 70);
         }
         if (this.currentSelectedGun === 'primary' && this.selectedGun) {
            ctx.shadowColor = 'transparent';
            ctx.fillRect(canvas.width - 210 - 100 / 2 - width / 2, canvas.height - 74 - height / 2, width, height);
            ctx.beginPath();
            ctx.arc(canvas.width - 210 - 100 / 2 - width / 2, canvas.height - 74, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width - 210 - 100 / 2 + width / 2, canvas.height - 74, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillText(this.primaryGun.data.name, canvas.width - 210 - 100 / 2, canvas.height - 70);
         } else {
            ctx.shadowOffsetX = 1.5;
            ctx.shadowOffsetY = 1.5;
            ctx.fillStyle = 'white';
            ctx.fillText(this.primaryGun.data.name, canvas.width - 210 - 100 / 2, canvas.height - 70);
         }
      }
      // if you have no guns
      if (this.primaryGun == null && this.secondaryGun == null) {
         ctx.fillText('---', canvas.width - 200 + 100 / 2, canvas.height - 70);
      }
      ctx.shadowColor = 'transparent';
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
