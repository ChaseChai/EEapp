import axios from 'axios'

const request = axios.create({
  timeout: 5000,
})

export default request
