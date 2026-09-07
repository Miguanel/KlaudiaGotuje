import os
import django

# Inicjalizacja środowiska Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from recipes.models import Recipe

def initialize_app():
    User = get_user_model()

    # 1. Pobieramy dane superusera ze zmiennych środowiskowych Render.com (lub ustawiamy domyślne)
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin12345")

    # Tworzenie lub aktualizacja superusera, żebyś na 100% mógł się zalogować
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"✅ Utworzono superusera: {username} (hasło: {password})")
    else:
        # Zapewniamy, że istniejący admin ma poprawnie ustawione uprawnienia i hasło
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"🔄 Zaktualizowano uprawnienia i hasło dla superusera: {username}")

    # 2. Sprawdzenie czy baza danych jest pusta i uruchomienie seeda
    if Recipe.objects.count() == 0:
        print("🌱 Baza jest pusta. Uruchamiam seedowanie danych...")
        try:
            from seed import run_seed
            run_seed()
            print("🚀 Pomyślnie załadowano dane początkowe!")
        except Exception as e:
            print(f"❌ Błąd podczas seedowania: {e}")
    else:
        print("✨ Baza zawiera już przepisy – pomijam seedowanie.")

if __name__ == '__main__':
    initialize_app()