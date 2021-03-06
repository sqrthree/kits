import axios from 'axios'

const instance = axios.create()

// Some available config options for making requests.
const configurations = {
  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
  // to methods of that instance.
  baseURL: '/api',

  useAccessToken: true,
  getAccessToken() {
    return window.localStorage.getItem('accessToken')
  },
}

instance.defaults.baseURL = configurations.baseURL

instance.interceptors.request.use(
  config => {
    if (configurations.useAccessToken) {
      const accessToken = configurations.getAccessToken()

      if (accessToken) {
        config.headers['Authorization'] = 'Bearer ' + accessToken
      } else {
        console.warn('[Request middleware] No access token is found.')
      }
    }

    return config
  },
  err => {
    return Promise.reject(err)
  }
)

instance.interceptors.response.use(
  response => {
    return Promise.resolve(response.data)
  },
  err => {
    if (err.response) {
      // Error handler for 401.
      if (err.response.status === 401) {
        console.error('Status 401')

        // Redirect to login page or somewhere.
        window.location.href = `${process.env.BASE_URL}/auth/login`
      }

      err.response.data =
        typeof err.response.data === 'object' ? err.response.data : {}

      err.response.data.status = err.response.status

      if (!err.response.data.message) {
        err.response.data.message = err.response.statusText
      }

      return Promise.reject(err.response.data)
    } else if (err.request) {
      return Promise.reject(
        new Error('当前服务暂不可用，请检查网络或稍后重试。')
      )
    } else {
      return Promise.reject(err)
    }
  }
)

export default instance
