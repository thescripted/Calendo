from rejson import Client, Path

rj = Client(host='localhost', port='6379', decode_responses=True)
obj = {
    'answer': 42,
    'arr': [None, True, 3.14],
    'truth': {
        'coord': 'out there'
    }
}
rj.jsonset('obj', Path.rootPath(), obj)
print(f"Is there anybody... {rj.jsonget('obj', Path('.truth.coord'))}")
