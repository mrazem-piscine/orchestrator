#!/bin/bash

set -e

VAGRANT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MASTER_IP="192.168.56.10"
KUBECONFIG_FILE="${HOME}/.kube/config"
KUBECONFIG_BACKUP="${HOME}/.kube/config.backup.$(date +%Y%m%d_%H%M%S)"

function print_usage() {
    echo "Usage: $0 {create|start|stop|destroy|status|kubectl}"
    echo ""
    echo "Commands:"
    echo "  create   - Create and provision the K3s cluster VMs"
    echo "  start    - Start the K3s cluster VMs"
    echo "  stop     - Stop the K3s cluster VMs"
    echo "  destroy  - Destroy the K3s cluster VMs"
    echo "  status   - Show cluster status"
    echo "  kubectl  - Configure kubectl to connect to the cluster"
    exit 1
}

function check_vagrant() {
    if ! command -v vagrant &> /dev/null; then
        echo "Error: vagrant is not installed"
        exit 1
    fi
}

function setup_kubectl() {
    echo "Setting up kubectl configuration..."
    
    # Create .kube directory if it doesn't exist
    mkdir -p "${HOME}/.kube"
    
    # Backup existing kubeconfig if it exists
    if [ -f "${KUBECONFIG_FILE}" ]; then
        echo "Backing up existing kubeconfig to ${KUBECONFIG_BACKUP}"
        cp "${KUBECONFIG_FILE}" "${KUBECONFIG_BACKUP}"
    fi
    
    # Copy kubeconfig from master node
    echo "Copying kubeconfig from master node..."
    cd "${VAGRANT_DIR}"
    vagrant ssh k3s-master -c "sudo cat /etc/rancher/k3s/k3s.yaml" | \
        sed "s/127.0.0.1/${MASTER_IP}/g" > /tmp/k3s-kubeconfig.yaml
    
    # Check if we got valid kubeconfig
    if ! kubectl --kubeconfig=/tmp/k3s-kubeconfig.yaml get nodes &> /dev/null; then
        echo "Warning: Could not validate kubeconfig. The cluster might still be starting."
        echo "Wait a few moments and run: $0 kubectl"
    else
        cp /tmp/k3s-kubeconfig.yaml "${KUBECONFIG_FILE}"
        echo "kubectl configured successfully!"
        echo "You can now use: kubectl get nodes"
        kubectl get nodes
    fi
    
    rm -f /tmp/k3s-kubeconfig.yaml
}

function create_cluster() {
    echo "Creating K3s cluster..."
    check_vagrant
    cd "${VAGRANT_DIR}"
    
    vagrant up
    
    echo "Waiting for cluster to be ready..."
    sleep 10
    
    setup_kubectl
    
    echo ""
    echo "Cluster created successfully!"
    echo "Nodes:"
    kubectl get nodes || echo "Cluster is still initializing. Run '$0 kubectl' in a moment."
}

function start_cluster() {
    echo "Starting K3s cluster..."
    check_vagrant
    cd "${VAGRANT_DIR}"
    vagrant up
    setup_kubectl
    echo "Cluster started"
}

function stop_cluster() {
    echo "Stopping K3s cluster..."
    check_vagrant
    cd "${VAGRANT_DIR}"
    vagrant halt
    echo "Cluster stopped"
}

function destroy_cluster() {
    echo "Destroying K3s cluster..."
    check_vagrant
    cd "${VAGRANT_DIR}"
    vagrant destroy -f
    rm -f node-token
    echo "Cluster destroyed"
}

function show_status() {
    echo "Cluster status:"
    check_vagrant
    cd "${VAGRANT_DIR}"
    vagrant status
    
    echo ""
    echo "Kubernetes nodes:"
    if kubectl get nodes &> /dev/null; then
        kubectl get nodes
    else
        echo "kubectl not configured or cluster not accessible"
        echo "Run: $0 kubectl"
    fi
}

# Main script logic
case "${1:-}" in
    create)
        create_cluster
        ;;
    start)
        start_cluster
        ;;
    stop)
        stop_cluster
        ;;
    destroy)
        destroy_cluster
        ;;
    status)
        show_status
        ;;
    kubectl)
        setup_kubectl
        ;;
    *)
        print_usage
        ;;
esac

