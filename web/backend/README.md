# Backend (Flask API)

## Install
```bat
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
```

## Configure (.env)
```bat
copy .env.example .env
```
Edit `.env` and set your PostgreSQL password.

## Migrations (create tables)
```bat
set FLASK_APP=run.py
flask db init
flask db migrate -m "init"
flask db upgrade
```

## Run
```bat
python run.py
```

Health: http://127.0.0.1:5000/health
