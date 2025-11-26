#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying microservices to K3s cluster..."

if ! kubectl cluster-info &> /dev/null; then
    echo "Error: kubectl is not configured or cluster is not accessible"
    echo "Run: ./orchestrator.sh kubectl"
    exit 1
fi

kubectl apply -f "${SCRIPT_DIR}/secrets.yaml"
kubectl apply -f "${SCRIPT_DIR}/inventory-database.yaml"
kubectl apply -f "${SCRIPT_DIR}/billing-database.yaml"
kubectl apply -f "${SCRIPT_DIR}/rabbitmq.yaml"

echo "Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=inventory-database --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=billing-database --timeout=120s || true

kubectl apply -f "${SCRIPT_DIR}/inventory-app.yaml"
kubectl apply -f "${SCRIPT_DIR}/billing-app.yaml"
kubectl apply -f "${SCRIPT_DIR}/api-gateway.yaml"
kubectl apply -f "${SCRIPT_DIR}/hpa.yaml"
kubectl apply -f "${SCRIPT_DIR}/ingress.yaml"

echo "Deployment complete!"
