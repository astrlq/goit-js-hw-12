import axios from 'axios';
const API_KEY = '53054234-db08f1651f6ed2d5abc76426b';
const BASE_URL = 'https://pixabay.com/api/';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export async function getImagesByQuery(query, page = 1) {
  const response = await axiosInstance.get('', {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 15,
    },
  });
  return response.data;
}
