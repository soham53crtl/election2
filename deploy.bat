@echo off
echo Starting deployment process for speedy-aurora-471602-c2...

echo [1/3] Logging into Google Cloud...
call gcloud auth login

echo [2/3] Setting project to speedy-aurora-471602-c2...
call gcloud config set project speedy-aurora-471602-c2

echo [3/3] Deploying to Cloud Run...
call gcloud run deploy civicguide-india --source . --region us-central1 --allow-unauthenticated

echo Deployment Complete!
pause
