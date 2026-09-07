import os
import django

# Inicjalizacja środowiska Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from seed import run_seed

def initialize_app():
    User = get_user_model()

    # 1. Tworzenie lub aktualizacja superusera
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin12345")

    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f"✅ Skonfigurowano konto administratora: {username}")

    # 2. ZAWSZE czścimy bazę i ładujemy świeże dane z seed.py przy każdym starcie/deployu
    print("🌱 Trwa czyszczenie bazy i ładowanie świeżych danych (seed)...")
    try:
        run_seed()
        print("🚀 Pomyślnie zasilono bazę danych przepisami!")
    except Exception as e:
        print(f"❌ Błąd podczas seedowania: {e}")

if __name__ == '__main__':
    initialize_app()