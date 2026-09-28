from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """Usunięcie tagów – nawigacja opiera się teraz wyłącznie na rozdziałach i podrozdziałach."""

    dependencies = [
        ("recipes", "0005_tags_to_subcategories"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="recipe",
            name="tags",
        ),
        migrations.DeleteModel(
            name="Tag",
        ),
        migrations.AlterField(
            model_name="recipe",
            name="category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="recipes",
                to="recipes.category",
                verbose_name="Rozdział / podrozdział",
            ),
        ),
    ]
