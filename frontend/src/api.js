const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeSalesData(file, email) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', email);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to process data');
  }
  
  return data;
}
