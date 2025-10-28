from django.db import models
from django.utils import timezone

class Note(models.Model):
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)  # ✅ new field

    def save(self, *args, **kwargs):
        # Automatically set completion time when marked done
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        elif not self.completed:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
