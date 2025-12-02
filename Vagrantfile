 
 Vagrant.configure("2") do |config|
 # Base box for all machines
 config.vm.box = "cloudicio/ubuntu-server"

  # Simple synced folder (current project folder -> /vagrant in VMs)
  config.vm.synced_folder ".", "/vagrant"
  #######################
  # Master node (control)
  #######################

   config.vm.define "k3s-master" do |master|
    master.vm.hostname = "k3s-master"

    # Private network IP for the master
      master.vm.network "private_network", ip: "192.168.56.10"

      master.vm.provider "virtualbox" do |vb|
        vb.name = "k3s-master"
        vb.memory = 2048
        vb.cpus = 2
      end
      master.vm.provision "shell", inline: <<-SHELL
  echo "[k3s-master] Updating packages..."
  apt-get update -y

  echo "[k3s-master] Installing dependencies..."
  apt-get install -y curl

  echo "[k3s-master] Installing K3s server..."
  # Important: force K3s to use the private IP as node-ip / advertise-address
  curl -sfL https://get.k3s.io | \
  INSTALL_K3S_EXEC="server \
    --node-ip 192.168.56.10 \
    --advertise-address 192.168.56.10 \
    --tls-san 192.168.56.10 \
    --flannel-iface enp0s9" \
  sh -

  echo "[k3s-master] Saving node token and kubeconfig to /vagrant..."
  cat /var/lib/rancher/k3s/server/node-token > /vagrant/node-token

  cp /etc/rancher/k3s/k3s.yaml /vagrant/k3s.yaml
  chown vagrant:vagrant /vagrant/k3s.yaml

  echo "[k3s-master] Cluster nodes:"
  sudo kubectl get nodes -o wide || true
SHELL
    end

     ########################
    # Agent node (worker)
     ########################

     config.vm.define "k3s-agent1" do |agent|
      agent.vm.hostname = "k3s-agent1"
  
      # Private network IP for the agent
      agent.vm.network "private_network", ip: "192.168.56.11"
  
      agent.vm.provider "virtualbox" do |vb|
        vb.name = "k3s-agent1"
        vb.memory = 2048
        vb.cpus = 2
      end
      agent.vm.provision "shell", inline: <<-SHELL
      echo "[k3s-agent1] Updating packages..."
      apt-get update -y
    
      echo "[k3s-agent1] Installing dependencies..."
      apt-get install -y curl
    
      echo "[k3s-agent1] Installing K3s agent and joining master..."
    
      while [ ! -f /vagrant/node-token ]; do
        echo "[k3s-agent1] Waiting for /vagrant/node-token from master..."
        sleep 5
      done
    
      NODE_TOKEN=$(cat /vagrant/node-token)
    
      # Important: force K3s agent to use its private IP
curl -sfL https://get.k3s.io | \
  K3S_URL=https://192.168.56.10:6443 \
  K3S_TOKEN=${NODE_TOKEN} \
  INSTALL_K3S_EXEC="agent \
    --node-ip 192.168.56.11 \
    --flannel-iface enp0s9" \
  sh -
    
      echo "[k3s-agent1] Done. This node should now appear in 'kubectl get nodes' on the master."
    SHELL
    end
  end