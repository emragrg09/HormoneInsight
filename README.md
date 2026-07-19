# Hormone Insight Monorepo

Welcome to the **Hormone Insight** project! This is a production-ready monorepo combining a Python/FastAPI backend and a React/Vite/TanStack frontend designed to model and visualize benchmark datasets for women's hormonal health.

---

## Folder Structure

```text
HormoneInsight/
├── backend/                  # FastAPI Backend
│   ├── api/                  # API endpoints and FastAPI router definitions
│   │   ├── __init__.py
│   │   └── main.py           # FastAPI entrypoint
│   ├── src/                  # Main Python logic & preprocessing scripts
│   │   ├── __init__.py
│   │   ├── baseline.py       # Data prep, training, and metrics generation
│   │   ├── explainability.py # Model coefficients and explainability logic
│   │   ├── feature_schema.py # Raw and processed schemas
│   │   ├── inference.py      # Preprocessing & inference pipeline
│   │   └── model_io.py       # Serializing/deserializing NumPy weights
│   ├── models/               # Persisted model weight artifacts (.npz and .json)
│   ├── tests/                # Unit and integration tests
│   ├── requirements.txt      # Backend Python dependencies
│   └── README.md             # Backend-specific overview and methodology
│
├── frontend/                 # React/Vite Frontend
│   ├── src/                  # React components, routes, and hooks
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies and project scripts
│   ├── vite.config.ts        # Vite/TanStack bundler configuration
│   ├── .env                  # Frontend environment variables
│   └── README.md             # Frontend-specific documentation
│
├── README.md                 # This file (Project-wide overview and setup)
└── .gitignore                # Top-level workspace gitignore
```

---

## Prerequisites

Before running the projects locally, ensure you have:
1. **Python 3.10+** installed.
2. **Node.js 18+** installed.

---

## Backend Setup & Run

The backend is built with FastAPI. It loads pre-trained model artifacts at startup to serve predictions and explainability metrics.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server locally on port `8001`:
   ```bash
   python -m uvicorn api.main:app --reload --port 8001
   ```
   The API will be available at `http://127.0.0.1:8001`. Swagger UI documentation is available at `http://127.0.0.1:8001/docs`.

5. Run backend unit tests:
   ```bash
   pytest
   ```

---

## Frontend Setup & Run

The frontend is a React application built with Vite and TanStack Router.

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Ensure your `.env` file points to the local backend port:
   ```text
   VITE_API_BASE_URL=http://127.0.0.1:8001
   ```

3. Install Node dependencies:
   ```bash
   npm install
   ```

4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   By default, Vite will start the frontend web application locally (usually on port `5173` or similar).

---

## Running Both Locally

To run the full stack locally, open two terminal windows:

* **Terminal 1 (Backend)**:
  ```bash
  cd backend
  python -m uvicorn api.main:app --reload --port 8001
  ```

* **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```
