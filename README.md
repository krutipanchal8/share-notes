# ShareNotes

ShareNotes is a web application designed for students to share and manage notes in a folder-like structure. Users can view notes directly within the web app or download them for offline use. This project is built using React for the frontend and Node.js for the backend.

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Technologies Used](#technologies-used)
- [AWS Cloud Architecture](#aws-cloud-architecture)

## Features

- Share and manage notes in a structured manner.
- Download or view notes directly in the web app.
- Secure AWS cloud infrastructure.

## Directory Structure

- `backend/` - Contains the logic and backend of the web application.
- `frontend-app/` - Contains the frontend of the web application.
- `lambda/` - Source code for files deployed on AWS Lambda.
- `script/` - Contains AWS CloudFormation scripts.

## Technologies Used

- React (Frontend)
- Node.js (Backend)
- AWS Lambda, EC2, VPC, RDS, S3, API Gateway, Secret Manager, Backup Vault, and more.

## AWS Cloud Architecture

This project was specially crafted to demonstrate AWS cloud skills. Here's a brief overview of the AWS architecture:

- **EC2 Instances**: Separate instances for frontend and backend deployment.
- **VPC Configuration**: 
  - Frontend instance in a public subnet.
  - Backend instance and MySQL RDS in private subnets.
- **AWS Lambda**: Used for uploading notes to an S3 bucket. This Lambda can only be triggered from the backend EC2 instance.
- **S3 Bucket Policies**: Configured to allow only the Lambda function to update or create new objects. However, the stored objects can be accessed by anyone.
- **AWS API Gateway**: Used to interface with the Lambda function.
- **Other AWS Services**: AWS Secret Manager, AWS Backup Vault, and more.