#!/bin/bash
set -e

CMD="$1"

case "$CMD" in
  create)
    echo "Creating K3s cluster (Vagrant + Parallels)..."
    vagrant up
    echo "cluster created"
    ;;
  start)
    echo "Starting K3s cluster..."
    vagrant up
    echo "cluster started"
    ;;
  stop)
    echo "Stopping K3s cluster..."
    vagrant halt
    echo "cluster stopped"
    ;;
  destroy)
    echo "Destroying K3s cluster..."
    vagrant destroy -f
    echo "cluster destroyed"
    ;;
  kubectl)
    echo "Exporting kubeconfig from master..."
    vagrant ssh k3s-master -c "sudo cat /etc/rancher/k3s/k3s.yaml" > kubeconfig.yaml
    export KUBECONFIG=$(pwd)/kubeconfig.yaml
    echo "You can now run: export KUBECONFIG=$(pwd)/kubeconfig.yaml"
    ;;
  *)
    echo "Usage: ./orchestrator.sh {create|start|stop|destroy|kubectl}"
    ;;
esac
