import axios from 'axios';

export const loadFontFromFile = async (file: File) => {
  const formData = new FormData();
  formData.append('font', file);

  try {
    const response = await axios.post('/api/load-font', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error loading font:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to load font');
    } else {
      throw new Error('An unexpected error occurred while loading the font');
    }
  }
};

export const saveFontToFile = async (fontData: any) => {
  try {
    const response = await axios.post('/api/save-font', fontData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Font saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving font:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to save font');
    } else {
      throw new Error('An unexpected error occurred while saving the font');
    }
  }
};

export const queryGlyphs = async (characters: string) => {
  try {
    const response = await axios.post('/api/query-glyphs', { characters: characters.split('') });
    if (response.data.success) {
      return response.data.glyphs;
    } else {
      throw new Error(response.data.message || 'Failed to query glyphs');
    }
  } catch (error) {
    console.error('Error querying glyphs:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to query glyphs');
    } else {
      throw new Error('An unexpected error occurred while querying glyphs');
    }
  }
};