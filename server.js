const express = require('express');
const multer = require('multer');
const { Font } = require('fonteditor-core');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

const DEFAULT_FONT_PATH = path.join(__dirname, 'default-font.ttf');
let defaultFont;

// Load the default font on server start
async function loadDefaultFont() {
  try {
    const fontBuffer = await fs.readFile(DEFAULT_FONT_PATH);
    defaultFont = Font.create(fontBuffer, { type: 'ttf' });
    console.log('Default font loaded successfully');
  } catch (error) {
    console.error('Error loading default font:', error);
  }
}

loadDefaultFont();

app.post('/api/load-font', upload.single('font'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No font file uploaded' });
    }

    const fontBuffer = await fs.readFile(req.file.path);
    const font = Font.create(fontBuffer, { type: path.extname(req.file.originalname).slice(1) });
    const glyphs = font.getGlyph().map(glyph => ({
      name: glyph.name,
      unicode: String.fromCharCode(glyph.unicode),
      pathData: glyph.contours ? glyph.contours.map(contour => 
        contour.map(point => ({ x: point.x, y: point.y }))
      ) : []
    }));

    // Clean up the uploaded file
    await fs.unlink(req.file.path);

    res.json({ success: true, glyphs });
  } catch (error) {
    console.error('Error loading font:', error);
    res.status(500).json({ success: false, message: 'Error loading font: ' + error.message });
  }
});

app.post('/api/query-glyphs', async (req, res) => {
  try {
    const { characters } = req.body;
    if (!defaultFont) {
      return res.status(500).json({ success: false, message: 'Default font not loaded' });
    }

    const glyphs = characters.map(char => {
      const glyph = defaultFont.find({ unicode: char.charCodeAt(0) });
      if (glyph) {
        const pathData = glyph.contours ? glyph.contours.map(contour => 
          contour.map(point => ({ x: point.x, y: point.y }))
        ) : [];
        return {
          name: glyph.name,
          unicode: char,
          pathData: pathData
        };
      }
      return null;
    }).filter(glyph => glyph !== null);

    res.json({ success: true, glyphs });
  } catch (error) {
    console.error('Error querying glyphs:', error);
    res.status(500).json({ success: false, message: 'Error querying glyphs: ' + error.message });
  }
});

app.post('/api/update-glyph', upload.single('image'), async (req, res) => {
  try {
    const { glyphName, unicode } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Here you would implement the logic to convert the image to a glyph path
    // For now, we'll just return a placeholder response
    const updatedGlyph = {
      name: glyphName,
      unicode: unicode,
      pathData: [[ { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 } ]]
    };

    res.json({ success: true, updatedGlyph });
  } catch (error) {
    console.error('Error updating glyph:', error);
    res.status(500).json({ success: false, message: 'Error updating glyph: ' + error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});