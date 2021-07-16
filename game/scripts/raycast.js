import Vec from './vector.js';

export default class Ray {
   constructor(x, y, angle, isDeg = true) {
      this.direction = isDeg ? this.computeDirection(angle) : angle;
      this.pos = new Vec(x, y);
   }
   changeAngle(angle) {
      this.direction = angle;
   }
   static getPoints(pos, uniquePoints, lines, radius, limitAngle = [-Math.PI * 2, Math.PI * 2], viewRadius = Infinity) {
      let uniqueAngles = [];
      for (const point of uniquePoints) {
         let angle = Math.atan2(point.y - pos.y, point.x - pos.x);
         if (angle < limitAngle[0]) {
            angle = limitAngle[0];
         }
         if (angle > limitAngle[1]) {
            angle = limitAngle[1];
         }
         uniqueAngles.push(angle - 0.00001, angle, angle + 0.00001);
      }

      let intersectionPoints = [];
      for (const angle of uniqueAngles) {
         const ray = new Ray(pos.x, pos.y, angle);
         ray.direction = new Vec(Math.cos(angle), Math.sin(angle));
         ray.pos.x += Math.cos(angle) * radius;
         ray.pos.y += Math.sin(angle) * radius;
         const intersectionPoint = ray.findSecondClosestLine(lines);
         if (intersectionPoint != null || intersectionPoint != undefined) {
            const dist = intersectionPoint.dist(pos);
            if (dist > viewRadius) {
               continue;
            }
            intersectionPoint.angle = angle;
            intersectionPoints.push(intersectionPoint);
         }
      }

      intersectionPoints = intersectionPoints.sort((a, b) => {
         return a.angle - b.angle;
      });

      return intersectionPoints;
   }
   findSecondClosestLine(lines) {
      let bestDistance = Infinity;
      let bestPos = null;
      let hits = [];
      for (let i = 0; i < lines.length; i++) {
         const line = lines[i];
         const point = this.cast(line);
         if (!point) continue;
         hits.push(point);
      }
      hits = hits.sort((a, b) => {
         return this.pos.dist(a) - this.pos.dist(b);
      });
      if (hits.length >= 2) {
         return hits[1];
      }
      return null;
   }
   findClosestLine(lines) {
      let bestDistance = Infinity;
      let bestPos = null;
      for (let i = 0; i < lines.length; i++) {
         const line = lines[i];
         const point = this.cast(line);
         if (!point) continue;
         const distance = this.pos.dist(point);
         if (distance < bestDistance) {
            bestDistance = distance;
            bestPos = point;
         }
      }
      return bestPos;
   }
   cast(line) {
      const x1 = line.start.x;
      const y1 = line.start.y;
      const x2 = line.end.x;
      const y2 = line.end.y;

      const x3 = this.pos.x;
      const y3 = this.pos.y;
      const x4 = this.pos.x + this.direction.x;
      const y4 = this.pos.y + this.direction.y;

      const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

      if (den == 0) {
         // lines are completely parallel
         return;
      }

      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

      if (t > 0 && t < 1 && u > 0) {
         return new Vec(x1 + t * (x2 - x1), y1 + t * (y2 - y1)); // point
      } else {
         return;
      }
   }
   computeDirection(angle) {
      const rad = degToRad(angle);
      return new Vec(Math.cos(rad), Math.sin(rad));
   }
}

function degToRad(deg) {
   return (deg * Math.PI) / 180;
}
