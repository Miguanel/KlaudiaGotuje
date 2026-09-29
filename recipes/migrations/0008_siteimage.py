from django.db import migrations, models


class Migration(migrations.Migration):
    """Grafiki w stałych miejscach strony (tło strony, tło logo, „O mnie” …)."""

    dependencies = [
        ("recipes", "0007_category_image"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteImage",
            fields=[
                ("key", models.SlugField(max_length=50, primary_key=True, serialize=False, verbose_name="Miejsce na stronie")),
                ("image", models.ImageField(upload_to="strona/", verbose_name="Grafika")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Ostatnia zmiana")),
            ],
            options={
                "verbose_name": "Grafika strony",
                "verbose_name_plural": "Grafiki strony",
                "ordering": ["key"],
            },
        ),
    ]
