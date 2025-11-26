Vagrant.configure("2") do |config|
    # Detect architecture and set appropriate box
    arch = `uname -m`.strip
    if arch == "arm64" || arch == "aarch64"
      config.vm.box = "ubuntu/jammy64"
    else
      config.vm.box = "ubuntu/jammy64"
    end
  
    # MASTER NODE
    config.vm.define "k3s-master" do |master|
      master.vm.hostname = "k3s-master"
      master.vm.network "private_network", ip: "192.168.56.10"
  
      # Parallels provider configuration
      master.vm.provider "parallels" do |prl|
        prl.memory = 2048
        prl.cpus = 2
      end
  
      # VirtualBox provider configuration
      master.vm.provider "virtualbox" do |vb|
        vb.memory = 2048
        vb.cpus = 2
      end
  
      master.vm.provision "shell", inline: <<-SHELL
        set -e
        echo "Setting up K3s master node..."
        sudo apt update -y
        sudo apt install -y curl
        
        # Install K3s server
        curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -
        
        # Wait for K3s to be ready
        echo "Waiting for K3s to be ready..."
        until sudo k3s kubectl get nodes &> /dev/null; do
          echo "Waiting for K3s..."
          sleep 2
        done
        
        # Copy node token
        sudo cat /var/lib/rancher/k3s/server/node-token > /vagrant/node-token
        chmod 644 /vagrant/node-token
        
        echo "Master node setup complete!"
      SHELL
    end
  
    # WORKER NODE
    config.vm.define "k3s-worker" do |worker|
      worker.vm.hostname = "k3s-worker"
      worker.vm.network "private_network", ip: "192.168.56.11"
  
      # Parallels provider configuration
      worker.vm.provider "parallels" do |prl|
        prl.memory = 2048
        prl.cpus = 2
      end
  
      # VirtualBox provider configuration
      worker.vm.provider "virtualbox" do |vb|
        vb.memory = 2048
        vb.cpus = 2
      end
  
      worker.vm.provision "shell", inline: <<-SHELL
        set -e
        echo "Setting up K3s worker node..."
        sudo apt update -y
        sudo apt install -y curl
        
        # Wait for master node token
        echo "Waiting for master node token..."
        while [ ! -f /vagrant/node-token ]; do
          echo "Waiting for token from master..."
          sleep 3
        done
        
        TOKEN=$(cat /vagrant/node-token)
        MASTER_IP="192.168.56.10"
        
        # Install K3s agent
        curl -sfL https://get.k3s.io | \
          K3S_URL=https://${MASTER_IP}:6443 \
          K3S_TOKEN=${TOKEN} \
          sh -
        
        echo "Worker node setup complete!"
      SHELL
    end
  end
  