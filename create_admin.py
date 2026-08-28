import os
import django

# Inicjalizacja środowiska Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model


def create_super_user():
    User = get_user_model()

    # Pobieramy dane z zmiennych środowiskowych Render.com (lub ustawiamy domyślne dla prototypu)
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')

    if not User.objects.filter(username=username).exists():
        print(f"Tworzenie konta administratora: {username}...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Konto administratora zostało pomyślnie utworzone!")
    else:
        print(f"Konto administratora '{username}' już istnieje.")


if __name__ == '__main__':
    create_super_user()