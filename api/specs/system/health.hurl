GET {{base_url}}/healthz
HTTP 200
[Asserts]
body == "ok"
