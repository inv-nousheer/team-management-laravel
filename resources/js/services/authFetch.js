const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token')

  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...(options.headers || {})
    }
  })
}
export default authFetch
