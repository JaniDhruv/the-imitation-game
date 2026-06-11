import React, { useRef, useEffect, useState } from 'react';

/**
 * ShareCard — generates a shareable results image via Canvas API
 */
const ShareCard = ({ stats }) => {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    rating = 'ANALYST',
    correctPicks = 0,
    totalRounds = 5,
    clearanceLevel = 0,
    totalTransmissionsUsed = 0,
    totalTimeUsed = 0,
  } = stats;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = 600;
    const h = 400;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = '#0a0f0a';
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    for (let y = 0; y < h; y += 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = '#33ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Inner border
    ctx.strokeStyle = 'rgba(51,255,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // Title
    ctx.fillStyle = '#33ff00';
    ctx.font = '28px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#33ff00';
    ctx.shadowBlur = 10;
    ctx.fillText('OPERATION: IMITATION', w / 2, 55);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#1a8000';
    ctx.fillText('ANALYST PERFORMANCE DOSSIER — JUNE 21, 1952', w / 2, 78);

    // Divider
    ctx.strokeStyle = '#1a8000';
    ctx.beginPath();
    ctx.moveTo(40, 90);
    ctx.lineTo(w - 40, 90);
    ctx.stroke();

    // Rating
    ctx.fillStyle = '#ffb000';
    ctx.font = '24px "Courier New", monospace';
    ctx.shadowColor = '#ffb000';
    ctx.shadowBlur = 8;
    ctx.fillText(`RATING: ${rating}`, w / 2, 130);
    ctx.shadowBlur = 0;

    // Stats
    ctx.fillStyle = '#33ff00';
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'left';
    const statsX = 60;
    let statsY = 170;
    const lineH = 28;

    const statLines = [
      `CORRECT IDENTIFICATIONS .... ${correctPicks}/4`,
      `CLEARANCE REMAINING ....... ${clearanceLevel}/3`,
      `TRANSMISSIONS USED ........ ${totalTransmissionsUsed}`,
      `TIME ELAPSED .............. ${Math.floor(totalTimeUsed / 60)}m ${totalTimeUsed % 60}s`,
    ];

    statLines.forEach(line => {
      ctx.fillText(line, statsX, statsY);
      statsY += lineH;
    });

    // Divider
    ctx.strokeStyle = '#1a8000';
    ctx.beginPath();
    ctx.moveTo(40, statsY + 5);
    ctx.lineTo(w - 40, statsY + 5);
    ctx.stroke();

    // Quote
    ctx.fillStyle = '#1a8000';
    ctx.font = 'italic 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('"Can machines think?" — A.M. Turing, 1950', w / 2, statsY + 35);

    // Footer
    ctx.fillStyle = '#0f4400';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('THE IMITATION GAME — theimitationgame.dev', w / 2, h - 30);

    // Vignette
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    setImageUrl(canvas.toDataURL('image/png'));
  }, [stats]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'imitation-game-results.png';
    a.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise(resolve =>
        canvasRef.current.toBlob(resolve, 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          height: 'auto',
          border: '1px solid var(--color-text-dim)',
          marginBottom: '1rem',
          imageRendering: 'pixelated',
        }}
      />
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={handleDownload} style={{ padding: '8px 20px' }}>
          [ DOWNLOAD DOSSIER ]
        </button>
        <button onClick={handleCopy} style={{ padding: '8px 20px' }}>
          {copied ? '[ COPIED ✓ ]' : '[ COPY TO CLIPBOARD ]'}
        </button>
      </div>
    </div>
  );
};

export default ShareCard;
