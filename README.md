# Email Client Core System

## Setup and Run

docker compose up --build


### Prerequisites
- Docker
- Docker Compose
- ngrok

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/alstondsouza/email-sync.git
   cd email-sync
   cd backend
   npm install
   cd ..
   cd frontend
   npm install

   open new command prompt and run 'ngrok.exe http 8000'
   Update the backend localhost url to the ngrok provided url for the subscription API og graph (because it needs only public URLs for sending notifications)

   docker compose up --build 
