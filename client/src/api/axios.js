import axios from 'axios'

const api = axios.create({
  baseURL: 'https://flowday-baxt.onrender.com',
  withCredentials: true,
})

export default api