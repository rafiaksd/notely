from django.db import models
from django.utils import timezone

class Note(models.Model):
    SECTION_CHOICES = [
        ('todo', 'To-Do'),
        ('immediate', 'Immediate'),
        ('later', 'Later'),
        ('finished', 'Finished'),
    ]

    title = models.CharField(max_length=2000)
    completed = models.BooleanField(default=False)
    section = models.CharField(max_length=20, choices=SECTION_CHOICES, default='todo')
    position = models.PositiveIntegerField(default=0)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Automatically set completion time when marked done
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
            self.section = 'finished'
        elif not self.completed and self.section == 'finished':
            self.completed_at = None
            self.section = 'todo'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.section}] {self.title}"
