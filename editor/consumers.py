from channels import Group
import json

# todo replace with redis
# todo dont hardcode dimensions
tile_map = [[[0 for j in range(25)] for i in range(25)]]
visitors = 0

def ws_add(message):
	global visitors # ugh
	visitors += 1
	Group("chat").add(message.reply_channel)
	message.reply_channel.send({"text": json.dumps({"event": "sync", "tiles": json.dumps(tile_map)})})
	Group("chat").send({
		"text": json.dumps({'event': 'visitors', 'count': visitors})
	})

def ws_message(message):
	try:
		msg = json.loads(message.content['text'])
	except:
		return
	if msg['event'] == 'change':
		Group("chat").send({
			"text": "%s" % message.content['text'],
		})
		layer, x, y, tile = msg['layer'], msg['tile_x'], msg['tile_y'], msg['tile']
		tile_map[layer][x][y] = tile
	elif msg['event'] == 'sync':
		message.reply_channel.send({"text": json.dumps({"event": "sync", "tiles": json.dumps(tile_map)})})


def ws_disconnect(message):
	global visitors # ugh
	visitors -= 1
	Group("chat").discard(message.reply_channel)
	Group("chat").send({
		"text": json.dumps({'event': 'visitors', 'count': visitors})
	})