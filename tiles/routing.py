from channels.routing import route
from channels.staticfiles import StaticFilesConsumer
from editor.consumers import ws_add, ws_message, ws_disconnect

channel_routing  = [
	# route('http.request', StaticFilesConsumer()),
	route('websocket.connect', ws_add),
	route("websocket.receive", ws_message),
	route('websocket.disconnet', ws_disconnect),
]