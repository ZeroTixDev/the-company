import loadImage from '../scripts/loadImage.js';
const Guns = {
   Cz45: {
      image: loadImage('guns/cz45.svg'),
      color: 'blue',
      width: Math.round(66 * 1.25),
      height: Math.round(50 * 1.25),
      name: 'CZ45',
      bulletRadius: 8,
      bulletSpeed: 1000,
      recoil: 0.05,
      reload: 0.25,
      historyLength: 30,
      bulletRender: function ({ ctx, radius, scale }) {
         ctx.fillStyle = 'black';
         ctx.beginPath();
         ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
         ctx.fill();
      },
      bulletSpawn: function (pos, radius, angle) {
         const ang = angle + (Math.random() - Math.random()) * 0.02;
         return [
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 25),
                  y: pos.y + Math.sin(angle) * (radius + 25),
               },
               angle: ang,
            },
         ];
         // returns bullets
      },
      render: function ({ ctx, radius, scale }) {
         ctx.beginPath();
         ctx.fillStyle = 'rgb(20, 20, 20)';
         ctx.rect((-15 * scale) / 2, -radius * scale, 15 * scale, -25 * scale);
         ctx.fill();
         ctx.beginPath();
         ctx.arc(0, (-radius - 25) * scale, (15 * scale) / 2, 0, Math.PI * 2);
         ctx.fill();
         ctx.beginPath();
         ctx.fillStyle = '#7d7d7d';
         ctx.strokeStyle = '#363636';
         ctx.arc((radius / 10) * scale, -radius * scale, (radius / 3.5) * scale, 0, Math.PI * 2);
         ctx.fill();
         ctx.stroke();
      },
   },
   Ak47: {
      image: loadImage('guns/ak47.svg'),
      color: '#c40e2c',
      width: Math.round(55 * 1.25),
      height: Math.round(55 * 1.25),
      name: 'AK-47',
      bulletRadius: 5,
      bulletSpeed: 800,
      recoil: 0.08,
      automatic: true,
      reload: 0.15,
      historyLength: 20,
      bulletRender: function ({ ctx, radius, scale }) {
         ctx.fillStyle = '#8f0000';
         ctx.beginPath();
         ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
         ctx.fill();
      },
      bulletSpawn: function (pos, radius, angle) {
         const ang = angle + (Math.random() - Math.random()) * 0.1;
         return [
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 55),
                  y: pos.y + Math.sin(angle) * (radius + 55),
               },
               angle: ang,
            },
         ];
         // returns bullets
      },
      render: function ({ ctx, radius, scale }) {
         ctx.beginPath();
         ctx.fillStyle = '#6e020d';
         ctx.rect((-18 * scale) / 2, -radius * scale, 18 * scale, -55 * scale);
         ctx.fill();
         ctx.beginPath();
         ctx.arc(0, (-radius - 55) * scale, (18 * scale) / 2, 0, Math.PI * 2);
         ctx.fill();
         ctx.fillStyle = '#d1086d';
         ctx.fillRect(0, -radius * 1.2 * scale, 4 * scale, 7 * scale);
         ctx.fillRect(0, -radius * 1.6 * scale, 4 * scale, 7 * scale);
         ctx.fillRect(0, -radius * 2 * scale, 4 * scale, 7 * scale);
         ctx.fillRect(0, -radius * 2.4 * scale, 4 * scale, 7 * scale);
         ctx.beginPath();
         ctx.fillStyle = '#7d7d7d';
         ctx.strokeStyle = '#363636';
         ctx.arc(0, (-radius + 5) * scale, (radius / 3.5) * scale, 0, Math.PI * 2);
         ctx.fill();
         ctx.stroke();
         ctx.beginPath();
         ctx.arc((radius / 4) * scale, (-radius - 35) * scale, (radius / 3.5) * scale, 0, Math.PI * 2);
         ctx.fill();
         ctx.stroke();
      },
   },
   Spas12: {
      image: loadImage('guns/spas-12.svg'),
      color: 'red',
      bulletRadius: 10,
      bulletSpeed: 700,
      recoil: 1,
      bounce: true,
      life: 1.5,
      reload: 0.4,
      width: Math.round(66 * 1.25),
      height: Math.round(50 * 1.25),
      name: 'SPAS-12',
      historyLength: 15,
      bulletSpawn: function (pos, radius, angle) {
         return [
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 55),
                  y: pos.y + Math.sin(angle) * (radius + 55),
               },
               angle: angle - 0.15,
            },
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 55),
                  y: pos.y + Math.sin(angle) * (radius + 55),
               },
               angle: angle - 0.075,
            },
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 55),
                  y: pos.y + Math.sin(angle) * (radius + 55),
               },
               angle: angle,
            },
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 55),
                  y: pos.y + Math.sin(angle) * (radius + 55),
               },
               angle: angle + 0.075,
            },
            {
               pos: {
                  x: pos.x + Math.cos(angle) * (radius + 55),
                  y: pos.y + Math.sin(angle) * (radius + 55),
               },
               angle: angle + 0.15,
            },
         ];
         // returns bullets
      },
      bulletRender: function ({ ctx, radius, scale }) {
         ctx.fillStyle = '#240000';
         ctx.beginPath();
         ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
         ctx.fill();
      },
      render: function ({ ctx, radius, scale }) {
         ctx.beginPath();
         ctx.fillStyle = '#330808';
         ctx.rect((-18 * scale) / 2, -radius * scale, 18 * scale, -50 * scale);
         ctx.fill();
         ctx.beginPath();
         ctx.arc(0, (-radius - 50) * scale, (18 * scale) / 2, 0, Math.PI * 2);
         ctx.fill();
         ctx.beginPath();
         ctx.fillStyle = '#7d7d7d';
         ctx.strokeStyle = '#363636';
         ctx.arc(0, (-radius + 5) * scale, (radius / 3.5) * scale, 0, Math.PI * 2);
         ctx.fill();
         ctx.stroke();
         ctx.beginPath();
         ctx.arc((radius / 4) * scale, (-radius - 35) * scale, (radius / 3.5) * scale, 0, Math.PI * 2);
         ctx.fill();
         ctx.stroke();
      },
   },
};

export default Guns;
