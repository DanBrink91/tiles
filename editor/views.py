from django.conf import settings
from django.shortcuts import render

from os import listdir
from os.path import isfile, join


def index(request):
	print dir(request)
	# gather list of available tiles on filesystem
	tile_path = join(settings.BASE_DIR, "static", "img")
	tiles = [t for t in listdir(tile_path) if isfile(join(tile_path, t))]

	return render(request, 'editor/editor.html', {'tiles': tiles})