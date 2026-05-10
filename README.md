# 1. Install dependencies
cd frontend
npm install

# 2. Environment setup
cp .env.example .env

# 3. Configure .env
VITE_API_BASE_URL=http://localhost:8000/api

# 4. Run development server
npm run dev

# 5. Build for production
npm run build