from rest_framework import viewsets
from .models import Note, Quote
from .serializers import NoteSerializer, QuoteSerializer

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer

    def perform_create(self, serializer):
        note = serializer.save()
        #print(f"\u2705 New note created: \"{note.title} (ID: {note.id})\"".encode('utf-8', errors='ignore').decode('utf-8'))

class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all().order_by('-created_at')
    serializer_class = QuoteSerializer
