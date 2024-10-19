import React, { useRef, useEffect, useState } from 'react';
import { Save } from 'lucide-react';

interface GlyphEditorProps {
  glyph: any;
  onSave: (glyphName: string, unicode: string, imageData: string) => void;
}

const GlyphEditor: React.FC<GlyphEditorProps> = ({ glyph, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        glyph.pathData.forEach((contour: any[]) => {
          ctx.beginPath();
          ctx.moveTo(contour[0].x, contour[0].y);
          contour.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.fill();
        });
      }
    }
  }, [glyph]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      onSave(glyph.name, glyph.unicode, imageData);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-2">Edit Glyph: {glyph.name} ({glyph.unicode})</h3>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="border border-gray-300"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
      />
      <button
        onClick={handleSave}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
      >
        <Save className="mr-2" />
        Save Glyph
      </button>
    </div>
  );
};

export default GlyphEditor;