export async function apiGet(path) {
  const res = await fetch(path)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed')
  return data
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed')
  return data
}

export async function apiDelete(path) {
  const res = await fetch(path, { method: 'DELETE' })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed')
  return data
}

export async function apiPut(path, body) {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.message || 'Request failed')
  return data
}
