# AWS Deployment Setup Guide

This guide explains how to set up the necessary AWS infrastructure to host the InPrep application via Elastic Container Service (ECS) on Fargate, Amazon RDS (PostgreSQL), and GitHub Actions CI/CD to automate deployments.

## Prerequisites
- An active AWS Account with Administrator Access.
- GitHub repository with Administrator access to set up Secrets.
- AWS CLI installed locally (optional, but helpful).

---

## Step 1: Create an IAM User for GitHub Actions
We need a dedicated user for GitHub Actions to deploy containers to ECS.

1. Go to the **IAM Console** -> **Users** -> **Add users**.
2. Name the user `github-actions-inprep`.
3. Select **Attach policies directly**.
4. Attach the following managed policies:
   - `AmazonEC2ContainerRegistryPowerUser` (to push Docker images to ECR).
   - `AmazonECS_FullAccess` (to deploy new Task Definitions to ECS).
5. (Optional but recommended for strict least privilege) Create a custom inline policy to limit `iam:PassRole` access explicitly only to your ECS Task Execution Role.
6. Once the user is created, click on it, go to the **Security credentials** tab, and generate an **Access Key**.
7. Keep the `Access Key ID` and `Secret Access Key` handy for the next step.

## Step 2: Configure GitHub Secrets
In your GitHub repository, navigate to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

Add the following secrets:
- `AWS_ACCESS_KEY_ID`: (from Step 1)
- `AWS_SECRET_ACCESS_KEY`: (from Step 1)
- `NEXT_PUBLIC_API_URL`: The public-facing URL of your backend ALB (e.g. `http://api.inprep.com` or the raw ALB DNS name) *Note: You'll have to set this after Step 5, but we note it here.*

> **Tip:** Make sure the `AWS_REGION` defined in `.github/workflows/deploy.yml` matches the region you create your AWS resources in (default is `us-east-1`).

---

## Step 3: Create Elastic Container Registry (ECR) Repositories
We need to store our Docker images in AWS.

1. Go to the **ECR Console** -> **Repositories** -> **Create repository**.
2. Make it **Private**.
3. Create one repository named `inprep-backend`.
4. Create another repository named `inprep-frontend`.
5. Note the URI of the repositories (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/inprep-backend`).

---

## Step 4: Setup the Amazon RDS Database (PostgreSQL)
1. Go to the **RDS Console** -> **Create database**.
2. Select **Standard create** -> **PostgreSQL**.
3. Under **Templates**, select **Free tier** or **Production** depending on your needs.
4. Set the **DB instance identifier** to `inprep-db`.
5. Set the **Master username** (e.g., `postgres`) and a strong **Master password**.
6. Under **Connectivity**, ensure **Public access** is set to **No**. Select your default VPC and create a new VPC security group `inprep-db-sg`.
7. Once created, take note of the **Endpoint URL**.

---

## Step 5: Setup Amazon ECS on Fargate

This is the core compute layer running the application.

### 5.1 Create an ECS Cluster
1. Go to the **ECS Console** -> **Clusters** -> **Create cluster**.
2. Name it `inprep-cluster`. Select AWS Fargate as the infrastructure provider.

### 5.2 Create Task Definitions
Create two task definitions, one for the backend and one for the frontend.

#### Backend Task
1. Go to **Task definitions** -> **Create new task definition** with Fargate.
2. Name it `backend-task`.
3. Set OS to Linux, App architecture to x86_64 or ARM64.
4. Set Task memory to `1 GB` and Task CPU to `0.5 vCPU` (adjust as needed).
5. Add a container named `backend` (this name must precisely match the deploy.yml `CONTAINER_NAME_BACKEND` env var).
6. Set the Image URI to the ECR repo URI created earlier (just the repo link, it's fine if it's empty right now, GitHub actions will update it).
7. Under **Port mappings**, map Container port `8000` (TCP).
8. Under **Environment variables**, set:
    - `DATABASE_URL`: `postgresql://username:password@rds-endpoint:5432/dbname`
    - `OPENAI_API_KEY`: `your-openai-api-key`
    - Any other secrets needed by `backend/app/core/config.py`.

#### Frontend Task
1. Create another task definition named `frontend-task`.
2. Name the container `frontend`.
3. Memory `1 GB`, CPU `0.5 vCPU`.
4. Port mapping: `3000` (TCP).
5. Environment variable: `NEXT_PUBLIC_API_URL` pointing to the backend's internal domain or public Application Load Balancer URL.

### 5.3 Create Application Load Balancer (ALB)
For users to access the frontend (and optionally the backend API public routes), you need an ALB.
1. Go to **EC2 Console** -> **Load Balancers** -> **Create Load Balancer**.
2. Select **Application Load Balancer**.
3. Name it `inprep-alb`, Scheme: Internet-facing.
4. Map to at least 2 public subnets in your VPC.
5. Create a Security Group allowing port 80 and 443 from Anywhere `0.0.0.0/0`.
6. Create Target Groups:
    - `inprep-frontend-tg` (Target type: IP, Port 3000)
    - `inprep-backend-tg` (Target type: IP, Port 8000)
7. Make the ALB forward port 80/443 traffic to the `inprep-frontend-tg` by default. You can add a path-based routing rule (e.g. `Path /api/*`) to forward traffic to `inprep-backend-tg` if needed.

### 5.4 Create ECS Services
Finally, we run the Tasks on the Cluster using Services.

1. Go to `inprep-cluster` -> **Services** -> **Create**.
2. Compute options: Launch type `FARGATE`.
3. **Backend Service**:
    - Select Task Definition: `backend-task`.
    - Service name: `inprep-backend-svc`
    - Desired tasks: 1
    - Networking: Select **private subnets** if behind ALB routing, or public subnets with Auto-assign public IP if accessed directly.
    - Security Group: Allow port 8000 inbound from the ALB security group.
    - Load Balancing: Select the ALB and attach it to the `inprep-backend-tg`.

4. **Frontend Service**:
    - Select Task Definition: `frontend-task`.
    - Service name: `inprep-frontend-svc`
    - Desired tasks: 1
    - Networking: Select **private subnets**.
    - Security Group: Allow port 3000 inbound from the ALB security group.
    - Load Balancing: Select the ALB and attach it to the `inprep-frontend-tg`.

---

## Step 6: Trigger the Pipeline
Now that the basic shells of the services exist, push to the `main` branch.
GitHub Actions will:
1. Build the Docker images.
2. Push them to ECR.
3. Automatically update the ECS Task Definitions with the new image tags.
4. Force ECS to roll out the new tasks seamlessly dynamically.

Enjoy your deployed application at the ALB's DNS name!
