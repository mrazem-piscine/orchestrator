Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204-arm64"


  # ==============================
  # MASTER NODE
  # ==============================
  config.vm.define "k3s-master" do |master|
    master.vm.hostname = "k3s-master"
    master.vm.network "private_network", ip: "192.168.56.10"

    master.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end

    master.vm.provision "shell", inline: <<-SHELL
set -e
echo "Setting up K3s master node..."
sudo apt update -y
sudo apt install -y curl

curl -sfL https://get.k3s.io | sh -

echo "Waiting for K3s to be ready..."
until sudo k3s kubectl get nodes &> /dev/null; do
  echo "Waiting for K3s..."
  sleep 2
done

sudo cat /var/lib/rancher/k3s/server/node-token > /vagrant/node-token
chmod 644 /vagrant/node-token

echo "Master setup complete!"
SHELL
  end

  # ==============================
  # WORKER NODE
  # ==============================
  config.vm.define "k3s-worker" do |worker|
    worker.vm.hostname = "k3s-worker"
    worker.vm.network "private_network", ip: "192.168.56.11"

    worker.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end

    worker.vm.provision "shell", inline: <<-SHELL
set -e
echo "Setting up K3s worker node..."
sudo apt update -y
sudo apt install -y curl

echo "Waiting for master token..."
while [ ! -f /vagrant/node-token ]; do
  echo "Token not found, waiting..."
  sleep 3
done

TOKEN=$(cat /vagrant/node-token)
MASTER_IP="192.168.56.10"

curl -sfL https://get.k3s.io | \
  K3S_URL=https://${MASTER_IP}:6443 \
  K3S_TOKEN=${TOKEN} \
  sh -

echo "Worker setup complete!"
SHELL
  end
end
