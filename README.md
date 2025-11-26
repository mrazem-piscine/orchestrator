# Kubernetes Microservices Orchestrator

This project deploys a microservices architecture on a K3s Kubernetes cluster. The architecture includes inventory and billing services with their respective databases, a message queue (RabbitMQ), and an API gateway.

## Architecture Overview

The microservices architecture consists of the following components:

### Services

1. **inventory-database** (PostgreSQL)
   - Port: 5432
   - Deployment: StatefulSet with PersistentVolume
   - Contains inventory data

2. **billing-database** (PostgreSQL)
   - Port: 5432
   - Deployment: StatefulSet with PersistentVolume
   - Contains billing data

3. **inventory-app**
   - Port: 8080
   - Deployment: Deployment with HPA (Horizontal Pod Autoscaler)
   - Connected to inventory-database
   - Auto-scaling: Min 1, Max 3 replicas, CPU threshold 60%

4. **billing-app**
   - Port: 8080
   - Deployment: StatefulSet
   - Connected to billing-database
   - Consumes messages from RabbitMQ

5. **RabbitMQ**
   - Ports: 5672 (AMQP), 15672 (Management UI)
   - Deployment: Deployment
   - Message queue service

6. **api-gateway**
   - Port: 3000
   - Deployment: Deployment with HPA
   - Forwards requests to other services
   - Auto-scaling: Min 1, Max 3 replicas, CPU threshold 60%
   - Exposed via Ingress

## Prerequisites

Before starting, ensure you have the following installed on your local machine:

1. **Vagrant** (latest version)
   - Download from: https://www.vagrantup.com/downloads
   - Verify: `vagrant --version`

2. **Virtualization Provider**
   - Parallels Desktop (for macOS) OR
   - VirtualBox (if using VirtualBox, update Vagrantfile provider)
   - Verify provider is installed and working

3. **kubectl** (Kubernetes command-line tool)
   - Download from: https://kubernetes.io/docs/tasks/tools/
   - Verify: `kubectl version --client`

4. **Docker** (for building and pushing images)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version`

5. **Docker Hub Account**
   - Create at: https://hub.docker.com/
   - Required for pushing application images

## Project Structure

```
.
├── Manifests/              # Kubernetes YAML manifests
│   ├── secrets.yaml        # Kubernetes secrets (DB passwords, RabbitMQ credentials)
│   ├── inventory-database.yaml
│   ├── billing-database.yaml
│   ├── rabbitmq.yaml
│   ├── inventory-app.yaml
│   ├── billing-app.yaml
│   ├── api-gateway.yaml
│   ├── hpa.yaml            # Horizontal Pod Autoscalers
│   ├── ingress.yaml        # Ingress configuration
│   └── deploy.sh           # Deployment script
├── Scripts/                # Utility scripts (if any)
├── Dockerfiles/            # Dockerfiles for applications (if provided)
├── Vagrantfile            # Vagrant configuration for K3s cluster
└── orchestrator.sh        # Main orchestration script
```

## Configuration

### 1. Docker Hub Configuration

Before deploying, update the image references in the following manifest files:

- `Manifests/inventory-app.yaml`
- `Manifests/billing-app.yaml`
- `Manifests/api-gateway.yaml`

Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```yaml
image: YOUR_DOCKERHUB_USERNAME/inventory-app:latest
```

### 2. Build and Push Docker Images

Build and push your application images to Docker Hub:

```bash
# Login to Docker Hub
docker login

# Build and push inventory-app
cd path/to/inventory-app
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-app:latest .
docker push YOUR_DOCKERHUB_USERNAME/inventory-app:latest

# Build and push billing-app
cd path/to/billing-app
docker build -t YOUR_DOCKERHUB_USERNAME/billing-app:latest .
docker push YOUR_DOCKERHUB_USERNAME/billing-app:latest

# Build and push api-gateway
cd path/to/api-gateway
docker build -t YOUR_DOCKERHUB_USERNAME/api-gateway:latest .
docker push YOUR_DOCKERHUB_USERNAME/api-gateway:latest
```

### 3. Secrets

Secrets are defined in `Manifests/secrets.yaml`. The default credentials are:

- **Inventory Database:**
  - User: `inventory_user`
  - Password: `inventory_password_123`
  - Database: `inventory_db`

- **Billing Database:**
  - User: `billing_user`
  - Password: `billing_password_123`
  - Database: `billing_db`

- **RabbitMQ:**
  - User: `rabbitmq_user`
  - Password: `rabbitmq_password_123`

**Important:** Change these credentials in production environments! Update `Manifests/secrets.yaml` before deployment.

## Setup and Installation

### Step 1: Create the K3s Cluster

The `orchestrator.sh` script manages the entire cluster lifecycle:

```bash
# Create and provision the cluster
./orchestrator.sh create
```

This will:
- Create two VMs (master and worker)
- Install K3s on both nodes
- Configure kubectl on your local machine
- Verify cluster connectivity

### Step 2: Verify Cluster Status

```bash
# Check cluster status
./orchestrator.sh status

# Or manually check nodes
kubectl get nodes
```

Expected output:
```
NAME          STATUS   ROLES    AGE   VERSION
k3s-master    Ready    <none>   Xm    v1.xx.x+k3s1
k3s-worker    Ready    <none>   Xm    v1.xx.x+k3s1
```

### Step 3: Deploy Microservices

Deploy all services using the deployment script:

```bash
cd Manifests
./deploy.sh
```

Or deploy manually:

```bash
kubectl apply -f Manifests/secrets.yaml
kubectl apply -f Manifests/inventory-database.yaml
kubectl apply -f Manifests/billing-database.yaml
kubectl apply -f Manifests/rabbitmq.yaml
kubectl apply -f Manifests/inventory-app.yaml
kubectl apply -f Manifests/billing-app.yaml
kubectl apply -f Manifests/api-gateway.yaml
kubectl apply -f Manifests/hpa.yaml
kubectl apply -f Manifests/ingress.yaml
```

### Step 4: Verify Deployment

Check the status of all pods:

```bash
kubectl get pods
```

All pods should be in `Running` status. Wait a few moments if some are still starting.

Check services:

```bash
kubectl get services
```

Check ingress:

```bash
kubectl get ingress
```

## Usage

### Managing the Cluster

```bash
# Start the cluster
./orchestrator.sh start

# Stop the cluster
./orchestrator.sh stop

# Destroy the cluster (removes all VMs)
./orchestrator.sh destroy

# Show cluster status
./orchestrator.sh status

# Configure kubectl (if needed)
./orchestrator.sh kubectl
```

### Accessing Services

#### API Gateway

The API gateway is exposed via Ingress. Access it using:

```bash
# Get the ingress IP
kubectl get ingress api-gateway-ingress

# Add to /etc/hosts (or equivalent):
# <INGRESS_IP> api-gateway.local

# Then access via:
curl http://api-gateway.local
```

Or port-forward directly:

```bash
kubectl port-forward service/api-gateway 3000:3000
# Access at http://localhost:3000
```

#### RabbitMQ Management UI

```bash
kubectl port-forward service/rabbitmq 15672:15672
# Access at http://localhost:15672
# Login: rabbitmq_user / rabbitmq_password_123
```

#### Direct Service Access

Port-forward to any service:

```bash
# Inventory app
kubectl port-forward service/inventory-app 8080:8080

# Billing app
kubectl port-forward service/billing-app 8080:8080
```

### Monitoring and Logs

#### View Pod Logs

```bash
# API Gateway
kubectl logs -f deployment/api-gateway

# Inventory App
kubectl logs -f deployment/inventory-app

# Billing App
kubectl logs -f statefulset/billing-app

# RabbitMQ
kubectl logs -f deployment/rabbitmq

# Databases
kubectl logs -f statefulset/inventory-database
kubectl logs -f statefulset/billing-database
```

#### Check HPA Status

```bash
kubectl get hpa

# Detailed HPA info
kubectl describe hpa api-gateway-hpa
kubectl describe hpa inventory-app-hpa
```

#### Check Resource Usage

```bash
kubectl top pods
kubectl top nodes
```

### Scaling

HPA automatically scales `api-gateway` and `inventory-app` based on CPU usage. You can also manually scale:

```bash
# Scale inventory-app manually
kubectl scale deployment inventory-app --replicas=2

# Scale api-gateway manually
kubectl scale deployment api-gateway --replicas=2
```

## Key Kubernetes Concepts Used

### StatefulSets

- **Databases**: Use StatefulSets for stable network identities and persistent storage
- **Billing App**: Uses StatefulSet as specified in requirements

### Deployments

- **inventory-app**: Standard deployment with auto-scaling
- **api-gateway**: Standard deployment with auto-scaling
- **RabbitMQ**: Standard deployment

### Horizontal Pod Autoscaler (HPA)

- Automatically scales pods based on CPU utilization
- **api-gateway**: Min 1, Max 3 replicas, CPU threshold 60%
- **inventory-app**: Min 1, Max 3 replicas, CPU threshold 60%

### PersistentVolumes

- Database StatefulSets use PersistentVolumeClaims
- Data persists across pod restarts and node migrations
- Uses `local-path` storage class (K3s default)

### Secrets

- All sensitive data (passwords, credentials) stored in Kubernetes Secrets
- Referenced via environment variables in deployments

### Services

- ClusterIP services for internal communication
- Headless services (ClusterIP: None) for StatefulSets

### Ingress

- Exposes API gateway externally
- Uses Traefik (included with K3s)

## Troubleshooting

### Cluster Issues

**Problem:** `kubectl` not working after cluster creation
```bash
./orchestrator.sh kubectl
```

**Problem:** Nodes not showing as Ready
```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# SSH into VM and check K3s
vagrant ssh k3s-master
sudo systemctl status k3s
```

### Pod Issues

**Problem:** Pods stuck in Pending
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check resource availability
kubectl top nodes
```

**Problem:** Pods in CrashLoopBackOff
```bash
# View logs
kubectl logs <pod-name>

# Check previous container logs
kubectl logs <pod-name> --previous
```

**Problem:** Database connection issues
```bash
# Verify services are running
kubectl get svc inventory-database billing-database

# Test connectivity from app pod
kubectl exec -it <app-pod-name> -- ping inventory-database
```

### Image Pull Issues

**Problem:** ImagePullBackOff error
- Verify Docker Hub images are public or credentials are configured
- Check image name matches your Docker Hub username
- Ensure images are pushed to Docker Hub

### HPA Not Scaling

```bash
# Check metrics-server (required for HPA)
kubectl get deployment metrics-server -n kube-system

# Check HPA status
kubectl describe hpa <hpa-name>

# Verify CPU requests are set in deployments
kubectl describe deployment <deployment-name>
```

## Cleanup

### Remove All Deployments

```bash
kubectl delete -f Manifests/
```

### Destroy Cluster

```bash
./orchestrator.sh destroy
```

This removes all VMs and associated data.

## Security Considerations

1. **Change Default Passwords**: Update secrets in `Manifests/secrets.yaml` before production use
2. **Private Images**: Consider using private Docker registry with image pull secrets
3. **Network Policies**: Implement network policies to restrict pod-to-pod communication
4. **RBAC**: Configure role-based access control for production environments
5. **TLS/SSL**: Configure TLS for ingress and inter-service communication

## Bonus Features

Consider implementing:

- Kubernetes Dashboard for cluster monitoring
- Application log aggregation (e.g., ELK stack, Loki)
- Prometheus and Grafana for metrics and monitoring
- CI/CD pipeline for automated deployments
- Health checks (liveness and readiness probes)
- Resource limits and requests optimization

## Resources and Documentation

- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [K3s Documentation](https://docs.k3s.io/)
- [Vagrant Documentation](https://www.vagrantup.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Training](https://kubernetes.io/training/)

## Support and Questions

For issues or questions:
1. Check the troubleshooting section
2. Review Kubernetes and K3s documentation
3. Check pod logs and events
4. Verify all prerequisites are met

## License

This project is for educational purposes.

