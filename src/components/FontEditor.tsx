import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import GlyphEditor from './GlyphEditor';

interface FontEditorProps {
  fontData: any;
  setFontData: React.Dispatch<React.SetStateAction<any>>;
}

const FontEditor: React.FC<FontEditorProps> = ({ fontData, setFontData }) => {
  const [selectedGlyph, setSelectedGlyph] = useState<any>(null);

  const handleGlyphEdit = (glyph: any) => {
    setSelectedGlyph(glyph);
  };

  const handleGlyphSave = async (glyphName: string, unicode: string, imageData: string) => {
    try {
      const formData = new FormData();
      formData.append('glyphName', glyphName);
      formData.append('unicode', unicode);
      formData.append('image', dataURItoBlob(imageData), 'glyph.png');

      const response = await fetch('/api/update-glyph', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { updatedGlyph } = await response.json();
        const updatedFontData = { ...fontData };
        const glyphIndex = updatedFontData.glyphs.findIndex((g: any) => g.name === glyphName);
        if (glyphIndex !== -1) {
          updatedFontData.glyphs[glyphIndex] = updatedGlyph;
          setFontData(updatedFontData);
        }
        setSelectedGlyph(null);
      } else {
        console.error('Failed to update glyph');
      }
    } catch (error) {
      console.error('Error updating glyph:', error);
    }
  };

  // Helper function to convert data URI to Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Edit Font</h2>
      {selectedGlyph ? (
        <GlyphEditor glyph={selectedGlyph} onSave={handleGlyphSave} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {fontData.glyphs.map((glyph: any, index: number) => (
            <div key={index} className="border p-2 rounded">
              <div className="mb-2">{glyph.name} ({glyph.unicode})</div>
              <svg width="50" height="50" viewBox="0 0 1000 1000">
                {glyph.pathData.map((contour: any[], contourIndex: number) => (
                  <path
                    key={contourIndex}
                    d={`M ${contour.map(point => `${point.x},${point.y}`).join(' L ')} Z`}
                    fill="black"
                  />
                ))}
              </svg>
              <button
                onClick={() => handleGlyphEdit(glyph)}
                className="mt-2 bg-blue-500 text-white py-1 px-2 rounded text-sm flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontEditor;