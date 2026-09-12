import urllib.request, json
q = 'Tell me about recent murders in Delhi'
req = urllib.request.Request('http://127.0.0.1:5000/api/officer', data=json.dumps({'message': q}).encode(), headers={'Content-Type': 'application/json'})
res = urllib.request.urlopen(req).read().decode()
data = json.loads(res)
print(data.get('reply') or '')
