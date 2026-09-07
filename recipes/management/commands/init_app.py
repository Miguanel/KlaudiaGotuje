import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from recipes.models import Recipe  # Dostosuj import, jeśli model nazywa się inaczej

class Command(BaseCommand):
    help = 'Inicjalizuje bazę danych: migruje, tworzy superusera (jeśli brak) i ładuje seed (jeśli brak przepisów)'

    def handle(self, *args, **options):
        User = get_user_model()

        # 1. Tworzenie superusera z danych środowiskowych na Renderze (opcjonalnie)
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin12345")

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"Utworzono domyślnego superusera: {username}"))
        else:
            self.stdout.write("Superuser już istnieje.")

        # 2. Sprawdzenie czy baza jest pusta i uruchomienie seeda
        if Recipe.objects.count() == 0:
            self.stdout.write("Baza jest pusta. Uruchamiam seedowanie danych...")
            try:
                # Jeśli Twój seeder to standardowa komenda Django:
                from django.core.management import call_command
                call_command('seed') # Podmień 'seed' na nazwę swojej komendy seedującej jeśli jest inna
                self.stdout.write(self.style.SUCCESS("Pomyślnie załadowano dane początkowe!"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Błąd podczas seedowania: {e}"))
        else:
            self.stdout.write("Baza zawiera już przepisy – pomijam seedowanie.")