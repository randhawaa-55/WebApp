import apiClient from './client';

export const splitPDF = async (file, pagesPerSection) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pagesPerSection', pagesPerSection);

  try {
    const response = await apiClient.post('/api/pdf/split', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to split PDF');
  }
};

// Add mergePDFs function for PDF merging
export const mergePDFs = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await apiClient.post('/api/pdf/merge', formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to merge PDFs');
  }
};

// Add other PDF-related API calls here 