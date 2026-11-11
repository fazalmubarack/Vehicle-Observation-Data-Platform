# Vehicle Observation Data Platform

A responsive, production-ready full-stack web application designed for ingesting, validating, exploring, and analyzing spatial vehicle observation datasets.

Built for technical interview assessment following modern software architecture, strict security practices, and modular full-stack conventions.

---

## 1. System Architecture & High-Level Design

```
                     +---------------------------------------+
                     |         Browser / Client App          |
                     |  React (Vite) + Recharts + React Router|
                     +-------------------+-------------------+
                                         |
                            HTTP / REST  | (JWT in Authorization Header)
                                         v
                     +---------------------------------------+
                     |           Express.js API              |
                     |   Controllers | Services | Middleware |
                     +-------------------+-------------------+
                                         |
                     +-------------------+-------------------+
                     |                                       |
                     v                                       v
        +-------------------------+             +-------------------------+
        |   CSV Ingestion Engine  |             |  Analytics & Binning    |
        | - Stream Validation     |             | - Exact Min/Median/Max  |
        | - SHA-256 Deduplication |             | - Server Histogram Bins |
        | - Atomic Rollback       |             | - Synchronized Filters  |
        +-------------------------+             +-------------------------+
                     \                                       /
                      \                                     /
                       v                                   v
                     +---------------------------------------+
                     |             MongoDB 7.0               |
                     |  Users | Datasets | Observations      |
                     +---------------------------------------+
```

### Key Architectural Highlights
1. **Separation of Concerns**: Pure frontend presentation and state synchronization; all data validation, hashing, record pagination, sorting, statistics, and histogram binning are executed strictly on the backend.
2. **Atomic Rollback Strategy**: When a CSV file contains invalid rows or database insertion fails midway, a rollback sequence purges partial observation records and sets the dataset state to `failed` so the database is never left in an inconsistent state.
3. **Strict Ownership Enforcement**: Dataset records and analytics are guarded so users can only access and query their own datasets. Non-owners receive HTTP 403 Forbidden.
4. **Backend-Driven Analytics**: React never invents or approximates statistics. All minimums, medians, maximums, and frequency bins are computed server-side and automatically respond to active filters (`vehicleClass`, `from`, `to`).
5. **No Speed/Overspeed Fallacy**: Only spatial pixel coordinates `x(px)` and `y(px)` are provided in the CSV; physical speed or distance are deliberately not calculated without camera calibration matrices.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6) with public/protected route guards
- **HTTP Client**: Axios with centralized request/response interceptors (Bearer token injection, 401 handling)
- **Data Visualization**: Recharts (Interactive responsive histogram with custom tooltips)
- **Icons**: Lucide React
- **CSV Client Preview**: PapaParse (reads top 5 rows before transmission)
- **Styling**: Clean, custom SaaS design system adhering to the assessment visual guidelines (Navy `#0f172a`, Slate `#475569`, Background `#f8fafc`).

### Backend
- **Runtime**: Node.js (v18+) & Express.js
- **Database**: MongoDB with Mongoose (v8)
- **Authentication**: Stateless JSON Web Tokens (JWT) with bcrypt password hashing
- **CSV Parser**: `csv-parser` streaming parser with line-by-line validation
- **File Uploads**: Multer memory storage with file extension and 25MB size boundaries
- **Deduplication**: SHA-256 cryptographic hashing per user

### Testing
- **Test Framework**: Jest
- **Integration HTTP Testing**: Supertest
- **In-Memory Database**: MongoDB Memory Server (uses locally cached binary with WiredTiger engine)

---

## 3. Project Directory Structure

```
Vehicle Observation Data Platform/
├── backend/
│   ├── fixtures/
│   │   ├── sample_observations.csv     # Valid vehicle observation dataset
│   │   └── invalid_rows.csv            # Invalid dataset for failure verification
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # Mongoose connection & lifecycle
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, logout, me
│   │   │   └── datasetController.js    # Upload, records, stats, histogram, status
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT Bearer token validator
│   │   │   ├── errorMiddleware.js      # Global error and 404 handler
│   │   │   └── uploadMiddleware.js     # Multer file size & format filter
│   │   ├── models/
│   │   │   ├── User.js                 # User schema with bcrypt pre-save hook
│   │   │   ├── Dataset.js              # Dataset schema with SHA-256 hash
│   │   │   └── Observation.js          # Observation schema with compound indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # Auth endpoint definitions
│   │   │   └── datasetRoutes.js        # Dataset endpoint definitions
│   │   ├── scripts/
│   │   │   └── seed.js                 # Demo data initialization script
│   │   ├── services/
│   │   │   ├── csvService.js           # Streaming CSV parser & rollback engine
│   │   │   └── analyticsService.js     # Statistics & histogram binning engine
│   │   ├── utils/
│   │   │   └── statsHelper.js          # Median & bin calculation logic
│   │   ├── app.js                      # Express application setup
│   │   └── server.js                   # Server entrypoint
│   ├── tests/
│   │   ├── setup.js                    # In-memory Mongo setup and teardown
│   │   ├── auth.test.js                # Auth endpoints integration tests
│   │   ├── upload.test.js              # CSV upload, validation & rollback tests
│   │   ├── dataset.test.js             # Records, pagination, filtering & ownership tests
│   │   └── analytics.test.js           # Backend statistics & histogram bin tests
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Card, Badge, Alert, EmptyState, LoadingSpinner
│   │   │   ├── layout/                 # Navbar, Sidebar, AppLayout
│   │   │   ├── dashboard/              # StatCard, DatasetTable
│   │   │   ├── upload/                 # CsvUploadModal with PapaParse preview
│   │   │   └── explorer/               # FiltersBar, StatsSidebar, HistogramChart, RecordsTable
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Persistent authentication state & actions
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           # Sign in with 1-click demo autofill
│   │   │   ├── RegisterPage.jsx        # User registration
│   │   │   ├── DashboardPage.jsx       # Overview, stat counters, datasets list
│   │   │   ├── DatasetExplorerPage.jsx # Synchronized records, statistics & histogram
│   │   │   └── NotFoundPage.jsx        # 404 handler
│   │   ├── services/
│   │   │   ├── api.js                  # Axios instance with interceptors
│   │   │   ├── authService.js          # Auth API calls
│   │   │   └── datasetService.js       # Dataset API calls
│   │   ├── App.jsx                     # Route configuration
│   │   ├── main.jsx                    # React root
│   │   └── index.css                   # Polished SaaS stylesheet
│   ├── index.html
│   ├── vite.config.js                  # Vite configuration with `/api` proxy
│   └── package.json
├── package.json                        # Monorepo management scripts
└── README.md
```

---

## 4. Mandatory REST API Endpoints

All endpoints use exact paths and methods specified in the assignment:

### Authentication Endpoints
| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user with unique email & bcrypt hash |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/logout` | Public/Private | Logout user session |
| `GET` | `/api/auth/me` | Private | Retrieve current authenticated user profile |

### Dataset & Observation Endpoints
| Method | Path | Access | Query Parameters | Description |
|---|---|---|---|---|
| `GET` | `/api/datasets` | Private | None | List all datasets owned by authenticated user |
| `POST` | `/api/datasets/upload` | Private | Multipart `file` | Upload CSV, validate, deduplicate & persist |
| `GET` | `/api/datasets/:datasetId` | Private | None | Fetch single dataset metadata (ownership checked) |
| `GET` | `/api/datasets/:datasetId/records` | Private | `page`, `pageSize`, `vehicleClass`, `from`, `to`, `sort` | Paginated records table |
| `GET` | `/api/datasets/:datasetId/statistics` | Private | `vehicleClass`, `from`, `to` | Backend calculation of Min, Median, Max X & Y |
| `GET` | `/api/datasets/:datasetId/histogram` | Private | `vehicleClass`, `from`, `to`, `metric` | Discrete bins and observation frequencies |
| `GET` | `/api/datasets/:datasetId/status` | Private | None | Retrieve dataset processing state (`completed`, `processing`, `failed`) |

---

## 5. Database Schema & Data Models

### User Schema (`User.js`)
- `name`: String (Required, trimmed, max 100 chars)
- `email`: String (Required, unique, lowercase, trimmed, regex validated)
- `password`: String (Required, minlength 6, `select: false` to never leak hashes)
- `createdAt`: Date (Default: `Date.now`)

### Dataset Schema (`Dataset.js`)
- `userId`: ObjectId (Ref `User`, indexed)
- `fileName`: String (Required, original uploaded filename)
- `fileHash`: String (Required, SHA-256 content hash)
- `recordCount`: Number (Total valid observations ingested)
- `status`: String (Enum: `['processing', 'completed', 'failed']`, default `processing`)
- `errorMessage`: String (Nullable, contains failure reason if ingestion failed)
- `createdAt`: Date (Default: `Date.now`, indexed)
- **Index**: `{ userId: 1, fileHash: 1 }` (Guarantees user cannot import duplicate files)

### Observation Schema (`Observation.js`)
- `datasetId`: ObjectId (Ref `Dataset`, indexed)
- `time`: Date (Required, observation timestamp, indexed)
- `vehicle_class`: String (Required, e.g. `car`, `truck`, `bus`, indexed)
- `x`: Number (Required, horizontal pixel coordinate)
- `y`: Number (Required, vertical pixel coordinate)
- **Compound Indexes**:
  - `{ datasetId: 1, time: 1 }`
  - `{ datasetId: 1, vehicle_class: 1 }`
  - `{ datasetId: 1, x: 1 }`
  - `{ datasetId: 1, y: 1 }`

---

## 6. How to Run the Application

### Prerequisites
- Node.js (v18.0 or newer)
- MongoDB instance (Local MongoDB on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Step 1: Environment Setup
Ensure `backend/.env` is configured (a template is provided in `backend/.env.example`):
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/vehicle_observation_platform
JWT_SECRET=super_secret_jwt_key_change_in_production_123456
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 2: (Optional) Seed Demo Data
To populate demo credentials and an initial vehicle observation dataset:
```bash
npm run seed:backend
```
*(Or inside backend directory: `cd backend && npm run seed`)*

### Step 3: Start the Backend Server
```bash
npm run dev:backend
```
Backend runs on: `http://localhost:5000`

### Step 4: Start the Frontend Application
In a separate terminal:
```bash
npm run dev:frontend
```
Frontend runs on: `http://localhost:5173`

---

## 7. Demo Credentials for Evaluation

| Field | Value |
|---|---|
| **Email** | `demo.analyst@example.com` |
| **Password** | `InterviewDemo123!` |

*Tip: On the `/login` page, you can click the **"Fill Demo Credentials"** button to instantly populate these values.*

---

## 8. Running Automated Tests

All tests run via Jest and Supertest with an isolated in-memory MongoDB instance. No external database or network connection is required.

To run the complete automated test suite:
```bash
npm test
```
*(Or inside backend: `cd backend && npm test`)*

### Test Coverage Highlights
- **User Registration & Validation**: Unique email checks, minimum password length, password exclusion from API responses.
- **Login & Authentication**: Valid credentials JWT issuance, invalid passwords, expired/tampered tokens.
- **Protected Routes & Ownership**: Verifies that non-owners cannot view or access another user's datasets or observation records (HTTP 403 Forbidden).
- **CSV Ingestion Engine**:
  - Valid CSV file upload and observation document creation.
  - Duplicate import prevention via SHA-256 file hash (HTTP 409 Conflict).
  - Strict line-by-line row validation (rejects invalid timestamps, empty classes, non-numeric coordinates).
  - **Atomic Rollback Verification**: Guarantees that when an invalid CSV is uploaded, no partial database records remain.
- **Backend Analytics & Histogram**:
  - Accurate calculation of Min, Median, and Max coordinates.
  - Histogram binning with labeled intervals and frequency counts.
  - Propagation of active filters (`vehicleClass`, `from`, `to`) to records, statistics, and histogram bins simultaneously.
