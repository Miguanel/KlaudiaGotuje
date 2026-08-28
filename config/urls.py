from django.contrib import admin
from django.urls import path
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from recipes.api import api  # <-- 1. Musisz zaimportować instancję api z aplikacji recipes


def test_view(request):
    return HttpResponse("DZIALA!")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),       # <-- 2. Ta linijka musi tu być! Wystawia cały router Ninja pod /api/
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)