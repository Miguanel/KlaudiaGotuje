from django.db import migrations, models


class Migration(migrations.Migration):
    """Grafika w tle banera rozdziału na stronie głównej."""

    dependencies = [
        ("recipes", "0006_remove_tags"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="image",
            field=models.ImageField(
                blank=True, null=True, upload_to="rozdzialy/",
                verbose_name="Grafika w tle (baner na stronie głównej)",
            ),
        ),
    ]
