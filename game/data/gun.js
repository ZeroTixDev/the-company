import loadImage from '../scripts/loadImage.js';
const Guns = {
   Cz45: {
      image: loadImage('guns/cz45.svg'),
      color: 'blue',
      width: Math.round(66 * 1.25),
      height: Math.round(50 * 1.25),
      name: 'CZ45',
      render: function ({ ctx, radius, scale }) {
         ctx.beginPath();
         ctx.fillStyle = 'rgb(10, 10, 10)';
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
   Spas12: {
      image: loadImage('guns/spas-12.svg'),
      color: 'red',
      width: Math.round(66 * 1.25),
      height: Math.round(50 * 1.25),
      name: 'SPAS-12',
      render: function ({ ctx, radius, scale }) {
         ctx.beginPath();
         ctx.fillStyle = 'rgb(10, 10, 10)';
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
