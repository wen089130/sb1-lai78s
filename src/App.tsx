import React, { useState } from 'react';
import { Upload, Edit, Download } from 'lucide-react';
import FontEditor from './components/FontEditor';
import { loadFontFromFile, saveFontToFile, queryGlyphs } from './utils/fontUtils';

function App() {
  const [fontData, setFontData] = useState<any>(null);
  const [queryString, setQueryString] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await loadFontFromFile(file);
        setFontData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    }
  };

  const handleSaveFont = async () => {
    if (fontData) {
      try {
        await saveFontToFile(fontData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    }
  };

  const handleQueryGlyphs = async () => {
    if (queryString) {
      try {
        const glyphs = await queryGlyphs(queryString);
        if (glyphs.length > 0) {
          setFontData({ glyphs });
          setError(null);
        } else {
          setError('No glyphs found for the given characters');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Font Editor</h1>
      </header>
      <main className="flex-grow p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="mb-4 flex items-center">
          <input
            type="text"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            placeholder="Enter characters to query"
            className="border rounded-l px-4 py-2 flex-grow"
          />
          <button
            onClick={handleQueryGlyphs}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Query Glyphs
          </button>
        </div>
        {!fontData ? (
          <div className="flex items-center justify-center h-full">
            <label className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center">
              <Upload className="mr-2" />
              Upload Font
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".ttf,.otf,.woff,.woff2" />
            </label>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <FontEditor fontData={fontData} setFontData={setFontData} />
            <button
              onClick={handleSaveFont}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <Download className="mr-2" />
              Save Font
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;