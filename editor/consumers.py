from channels import Group
import json
# todo replace with redis
# todo dont hardcode dimensions

tile_map = [[[0 for j in range(25)] for i in range(25)]]

def ws_add(message):
	Group("chat").add(message.reply_channel)
	message.reply_channel.send({"text": json.dumps({"event": "sync", "tiles": json.dumps(tile_map)})})


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
		print "Old:", tile_map[layer][x][y]
		print "New:", tile
		tile_map[layer][x][y] = tile
	elif msg['event'] == 'sync':
		message.reply_channel.send({"text": json.dumps({"event": "sync", "tiles": json.dumps(tile_map)})})


def ws_disconnect(message):
	Group("chat").discard(message.reply_channel)