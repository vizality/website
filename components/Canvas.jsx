import { useEffect, useRef, memo } from 'react';

export default memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const elements = [];
    const presets = {};

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    presets.o = (x, y, s, dx, dy) => {
      return {
        x, y, dx, dy,
        draw: (ctx, t) => {
          x += dx;
          y += dy;

          ctx.beginPath();
          ctx.arc(x + +Math.sin((50 + x + (t / 10)) / 100) * 3, y + +Math.sin((45 + x + (t / 10)) / 100) *
            4, 12 * s, 0, 2 * Math.PI, false);
          ctx.lineWidth = 5 * s;
          ctx.strokeStyle = '#b2bfff';
          ctx.stroke();
        }
      };
    };

    presets.x = (x, y, s, dx, dy, dr, r) => {
      r = r || 0;
      return {
        x, y, r, dx, dy, dr,
        draw: (ctx, t) => {
          x += dx;
          y += dy;
          r += dr;

          const line = (x, y, tx, ty, c, o) => {
            o = o || 0;
            ctx.beginPath();
            ctx.moveTo(-o + ((s / 2) * x), o + ((s / 2) * y));
            ctx.lineTo(-o + ((s / 2) * tx), o + ((s / 2) * ty));
            ctx.lineWidth = 30 * s;
            ctx.strokeStyle = c;
            ctx.stroke();
          };

          ctx.save();

          ctx.translate(x + Math.sin((x + (t / 10)) / 100) * 5, y + Math.sin((10 + x + (t / 10)) / 100) *
            2);
          ctx.rotate(r * Math.PI / 180);

          line(-1, -1, 7, 7, '#b2bfff');
          line(7, -1, -1, 7, '#b2bfff');

          ctx.restore();
        }
      };
    };

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        if (Math.round(Math.random() * 8000) === 1) {
          const s = ((Math.random() * 5) + 1) / 10;
          // eslint-disable-next-line eqeqeq
          if (Math.round(Math.random()) == 1) {
            elements.push(presets.o(x, y, s, 0, 0));
          } else {
            elements.push(presets.x(x, y, s, 0, 0, ((Math.random() * 3) - 1) / 10, (Math.random() * 360)));
          }
        }
      }
    }

    setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let amount = 0;
      const time = new Date().getTime();
      for (const el in elements) {
        amount++;
        if (amount % 4 === 0) {
          elements[el].draw(ctx, time);
        }
      }
    }, 10);
  }, []);

  return (
    <div
      className='vz-canvas-wrapper'
    >
      <canvas className='vz-canvas' ref={canvasRef} />
    </div>
  );
});
