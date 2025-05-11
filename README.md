# Task Manager App - Complete Documentation

## Overview

This project is a task-manager application developed using Helm on Kubernetes. It includes a backend API, a frontend UI, and a MongoDB database. The project evolved from a basic Helm chart to multiple services, with Docker images built from a `docker-compose.yml`. Deployment attempts on EKS and Minikube failed due to authentication and configuration issues, leading to a submission with a screencast and documentation.

## Setup Instructions

### 1. Install Prerequisites

* **Install AWS CLI (for EKS)**:

  ```bash
  sudo apt update
  sudo apt install awscli
  aws configure
  ```

* **Install Helm via Snap**:

  ```bash
  sudo snap install helm --classic
  ```

  Verify Helm:

  ```bash
  helm version
  # Expected output: version.BuildInfo{Version:"v3.16.2", ...}
  ```

* **Install Minikube (for local testing)**:

  ```bash
  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
  sudo install minikube-linux-amd64 /usr/local/bin/minikube
  ```

  Verify Minikube:

  ```bash
  minikube version
  ```

  Install Docker Desktop with Kubernetes enabled (for Minikube driver).

### 2. Build Docker Images

* Navigate to the root directory:

  ```bash
  cd ~/Desktop/Devops-Ass-3/task-manager
  ```

  Verify subdirectories:

  ```bash
  ls -l
  # Expected to show backend/, frontend/.
  ```

* Log in to Docker Hub:

  ```bash
  docker login
  ```

* Build and push the backend image:

  ```bash
  docker build -t moiz/task-manager-backend:v1 ./backend
  docker push moiz/task-manager-backend:v1
  ```

* Build and push the frontend image:

  ```bash
  docker build -t moiz/task-manager-frontend:v1 ./frontend
  docker push moiz/task-manager-frontend:v1
  ```

* Verify images:

  ```bash
  docker images
  # Expected: moiz/task-manager-backend:v1, moiz/task-manager-frontend:v1
  ```

### 3. Create and Configure Helm Chart

* Create a helm directory:

  ```bash
  mkdir helm
  ```
* Generate a Helm chart:

  ```bash
  helm create task-manager
  ```

#### Customize the Deployment (initial):

Replace `helm/task-manager/templates/deployment.yaml` with:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "task-manager.fullname" . }}
  labels:
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "task-manager.selectorLabels" . | nindent 12 }}
  template:
    metadata:
      labels:
        {{- include "task-manager.selectorLabels" . | nindent 14 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "nginx:alpine"
          ports:
            - containerPort: 80
              protocol: TCP
          env:
            - name: PORT
              value: "80"
```

#### Customize the Service (initial):

Replace `helm/task-manager/templates/service.yaml` with:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "task-manager.fullname" . }}
  labels:
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
      name: http
  selector:
    {{- include "task-manager.selectorLabels" . | nindent 8 }}
```

#### Update values.yaml (initial):

```yaml
replicaCount: 1
```

### 4. Expand to Multiple Services

#### Update deployment.yaml for backend:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "task-manager.fullname" . }}-backend
  labels:
    app: backend
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: backend
      {{- include "task-manager.selectorLabels" . | nindent 12 }}
  template:
    metadata:
      labels:
        app: backend
        {{- include "task-manager.selectorLabels" . | nindent 14 }}
    spec:
      containers:
        - name: backend
          image: "moiz/task-manager-backend:v1"
          ports:
            - containerPort: 5000
              protocol: TCP
          env:
            - name: MONGO_URI
              value: "mongodb://mongodb:27017/task-manager"
            - name: PORT
              value: "5000"
```

#### Create deployment-frontend.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "task-manager.fullname" . }}-frontend
  labels:
    app: frontend
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: frontend
      {{- include "task-manager.selectorLabels" . | nindent 12 }}
  template:
    metadata:
      labels:
        app: frontend
        {{- include "task-manager.selectorLabels" . | nindent 14 }}
    spec:
      containers:
        - name: frontend
          image: "moiz/task-manager-frontend:v1"
          ports:
            - containerPort: 3000
              protocol: TCP
          env:
            - name: PORT
              value: "3000"
```

#### Create deployment-mongodb.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "task-manager.fullname" . }}-mongodb
  labels:
    app: mongodb
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
      {{- include "task-manager.selectorLabels" . | nindent 12 }}
  template:
    metadata:
      labels:
        app: mongodb
        {{- include "task-manager.selectorLabels" . | nindent 14 }}
    spec:
      containers:
        - name: mongodb
          image: "mongo:latest"
          ports:
            - containerPort: 27017
              protocol: TCP
          volumeMounts:
            - name: mongodb-data
              mountPath: /data/db
      volumes:
        - name: mongodb-data
          emptyDir: {}
```

#### Update service.yaml for backend:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "task-manager.fullname" . }}-backend
  labels:
    app: backend
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 5000
      protocol: TCP
      name: http
  selector:
    app: backend
    {{- include "task-manager.selectorLabels" . | nindent 8 }}
```

#### Create service-frontend.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "task-manager.fullname" . }}-frontend
  labels:
    app: frontend
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
  selector:
    app: frontend
    {{- include "task-manager.selectorLabels" . | nindent 8 }}
```

#### Create service-mongodb.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "task-manager.fullname" . }}-mongodb
  labels:
    app: mongodb
    {{- include "task-manager.labels" . | nindent 8 }}
spec:
  type: ClusterIP
  ports:
    - port: 27017
      targetPort: 27017
      protocol: TCP
      name: mongodb
  selector:
    app: mongodb
    {{- include "task-manager.selectorLabels" . | nindent 8 }}
```

#### Update ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "task-manager.fullname" . }}
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: {{ include "task-manager.fullname" . }}-backend
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {{ include "task-manager.fullname" . }}-frontend
                port:
                  number: 80
```

### 5. Deploy to EKS

```bash
aws eks --region us-east-1 update-kubeconfig --name task-manager-eks --kubeconfig ~/.kube/config
cd ~/Desktop/Devops-Ass-3/task-manager
helm install task-manager ./helm/task-manager
```

Expected output:

```
NAME: task-manager
LAST DEPLOYED: Sun May 11 19:13:00 2025
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

### Set Up Ingress

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=task-manager-eks
helm upgrade task-manager ./helm/task-manager
kubectl get ingress task-manager -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Fallback to Minikube

```bash
minikube start --driver=docker
kubectl config use-context minikube
helm install task-manager ./helm/task-manager
kubectl get pods
```

Access the app:

```bash
kubectl port-forward service/task-manager-frontend 3000:80
# Open http://localhost:3000
kubectl port-forward service/task-manager-backend 5000:80
# Open http://localhost:5000/api
```

## Create Screencast

```bash
sudo apt update
sudo apt install kazam
```

Use Kazam to record:

* Run `kazam`
* Record `ls -R`, `cat` Helm files, `docker images`, `helm install` errors, `minikube` errors.
* Save as `task-manager-demo.mp4`

## Usage

* **EKS (if successful)**: http\://<alb-url>/ (frontend), http\://<alb-url>/api (backend)
* **Local (Minikube)**: [http://localhost:3000](http://localhost:3000) (frontend), [http://localhost:5000/api](http://localhost:5000/api) (backend)

## Components

* **Backend**:

  * Image: moiz/task-manager-backend\:v1
  * Port: 5000
  * Env: MONGO\_URI=mongodb://mongodb:27017/task-manager
* **Frontend**:

  * Image: moiz/task-manager-frontend\:v1
  * Port: 3000
* **MongoDB**:

  * Image: mongo\:latest
  * Port: 27017

## Deployment Issues

### EKS:

* Error: `Kubernetes cluster unreachable`
* Fixes tried:

  * Set AWS credentials
  * Manual `kubeconfig` edits
  * Verified AWS token/authentication
* Likely cause: IAM or cluster config

### Minikube:

* Error: `connect: connection refused`
* Cause: Docker driver or state issue

## Deliverables

* `helm/task-manager/`: Helm chart files
* `task-manager-demo.mp4`: Screencast
* Docker Images: moiz/task-manager-backend\:v1, moiz/task-manager-frontend\:v1

## Submission

```bash
cd ~/Desktop/Devops-Ass-3
task-manager-submission.zip task-manager
```

## Directory Structure

```
helm/task-manager/: Helm chart files
docker-compose.yml: Original Compose file
task-manager-demo.mp4: Screencast
backend/, frontend/: Docker source
documentation: README-part1.md, README-part2.md, README-complete.md
```

## Notes

* Requires working EKS IAM permissions or functional Minikube setup
* Contact instructor for cluster resolution

## Final Steps

```bash
ls ~/Desktop/Devops-Ass-3/task-manager/
# Should show README-part1.md, README-part2.md, README-complete.md, backend/, frontend/, task-manager-demo.mp4
cd ~/Desktop/Devops-Ass-3
zip -r task-manager-submission.zip task-manager
```
