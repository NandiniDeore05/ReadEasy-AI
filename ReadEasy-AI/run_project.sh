#!/bin/sh

# Step 1: Create virtual environment if not present
if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi

# Step 2: Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Step 3: Install Python dependencies
echo "Installing backend requirements..."
pip3 install --upgrade pip
pip3 install -r requirements.txt

# Step 4: Install Node dependencies
cd frontend/readeasy-chat || { echo "Could not find frontend/readeasy"; exit 1; }
echo "Installing frontend dependencies..."
npm install
cd ../..

# Step 5: Command to start the backend and frontend together
/bin/sh -ec 'flask --app app run &'
/bin/sh -ec 'cd frontend/readeasy-chat && npm start'