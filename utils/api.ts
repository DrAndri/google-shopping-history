export default async function callApi(
  method: string,
  body: unknown
): Promise<Response> {
  return fetch('/api/' + method, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}
