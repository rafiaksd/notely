from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)  # for ordering
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
