#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying microservices to K3s cluster..."

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: kubectl is not configured or cluster is not accessible"
    echo "Run: ./orchestrator.sh kubectl"
    exit 1
fi

# Apply manifests in order
echo "1. Creating secrets..."
kubectl apply -f "${SCRIPT_DIR}/secrets.yaml"

echo "2. Deploying databases..."
kubectl apply -f "${SCRIPT_DIR}/inventory-database.yaml"
kubectl apply -f "${SCRIPT_DIR}/billing-database.yaml"

echo "3. Deploying RabbitMQ..."
kubectl apply -f "${SCRIPT_DIR}/rabbitmq.yaml"

echo "4. Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=inventory-database --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=billing-database --timeout=120s || true

echo "5. Deploying applications..."
kubectl apply -f "${SCRIPT_DIR}/inventory-app.yaml"
kubectl apply -f "${SCRIPT_DIR}/billing-app.yaml"
kubectl apply -f "${SCRIPT_DIR}/api-gateway.yaml"

echo "6. Deploying HPA..."
kubectl apply -f "${SCRIPT_DIR}/hpa.yaml"

echo "7. Deploying Ingress..."
kubectl apply -f "${SCRIPT_DIR}/ingress.yaml"

echo ""
echo "Deployment complete!"
echo ""
echo "Check status with:"
echo "  kubectl get pods"
echo "  kubectl get services"
echo "  kubectl get ingress"
echo ""
echo "View logs with:"
echo "  kubectl logs -f deployment/inventory-app"
echo "  kubectl logs -f deployment/api-gateway"
echo "  kubectl logs -f statefulset/billing-app"

