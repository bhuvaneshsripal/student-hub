# Backend (Django) — Scaffold Only

This is an empty Django project skeleton for Student Hub. No logic has been
added yet — every file only contains a comment placeholder so you can fill
in the implementation yourself.

```
backend/
├── manage.py
├── requirements.txt
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── api/
    ├── __init__.py
    ├── admin.py
    ├── models.py
    ├── serializers.py
    ├── urls.py
    ├── views.py
    └── migrations/
        └── __init__.py
```

Suggested next steps:
1. `pip install -r requirements.txt`
2. Fill in `config/settings.py` (INSTALLED_APPS, DATABASES, CORS, etc.)
3. Define models in `api/models.py` matching the frontend's data (Subject,
   AttendanceRecord, TimetableClass, CGPA semester, Todo, Note, etc.)
4. Wire up `api/serializers.py`, `api/views.py`, and `api/urls.py`.
5. Point `DATABASES` at the schema described in `../database/schema.sql`.
