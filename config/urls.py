from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.views import serve
from recipes.api import api
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Bezpieczne serwowanie folderu assets bezpośrednio z STATIC_ROOT (staticfiles)
    re_path(r'^assets/(?P<path>.*)$', serve, kwargs={'document_root': settings.STATIC_ROOT / 'assets'}),

    # Wszystkie pozostałe adresy przejmuje React (Single Page Application)
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)