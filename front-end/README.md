# Notely 📝

Notely is a sleek and simple personal note-taking web app built with **React**, **Django**, and **Tailwind CSS**.  
Keep track of your tasks, mark them as done, delete them, and reorder them with ease.

---

## Features

- Add new tasks
- Mark tasks as **Done** or **Undo**
- Delete tasks
- Reorder tasks using **Up/Down arrows**
- Separate sections for **To-Do** and **Finished** tasks
- Modern, responsive UI with Tailwind CSS

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Axios  
- **Backend:** Django, Django REST Framework  
- **Database:** SQLite (default)  

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notely.git
cd notely
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

