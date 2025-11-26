#!/bin/bash

# Test script to verify Vagrantfile configuration

echo "=== Testing Vagrantfile Configuration ==="
echo ""

cd "$(dirname "$0")"

# Check if Vagrant is installed
if ! command -v vagrant &> /dev/null; then
    echo "❌ Vagrant is not installed"
    exit 1
fi
echo "✅ Vagrant is installed: $(vagrant --version)"

# Check Ruby syntax
echo ""
echo "Checking Ruby syntax..."
if ruby -c Vagrantfile 2>&1 | grep -q "Syntax OK"; then
    echo "✅ Vagrantfile syntax is valid"
else
    echo "❌ Vagrantfile has syntax errors"
    ruby -c Vagrantfile
    exit 1
fi

# Check for VM definitions
echo ""
echo "Checking VM definitions..."
if grep -q "k3s-master" Vagrantfile && grep -q "k3s-worker" Vagrantfile; then
    echo "✅ Found both VM definitions: k3s-master and k3s-worker"
else
    echo "❌ Missing VM definitions"
    exit 1
fi

# Check for providers
echo ""
echo "Checking provider support..."
if grep -q "provider.*parallels" Vagrantfile; then
    echo "✅ Parallels provider configured"
else
    echo "⚠️  Parallels provider not found"
fi

if grep -q "provider.*virtualbox" Vagrantfile; then
    echo "✅ VirtualBox provider configured"
else
    echo "⚠️  VirtualBox provider not found"
fi

# Check if boxes are available
echo ""
echo "Checking for available boxes..."
BOX_COUNT=$(vagrant box list 2>/dev/null | wc -l | tr -d ' ')
echo "📦 Found $BOX_COUNT box(es) installed"

# Check provider availability
echo ""
echo "Checking provider availability..."
if command -v prlctl &> /dev/null || [ -f "/usr/local/bin/prlctl" ]; then
    echo "✅ Parallels Desktop Pro detected"
    PARALLELS_AVAILABLE=true
else
    echo "⚠️  Parallels Desktop Pro not found (prlctl not in PATH)"
    PARALLELS_AVAILABLE=false
fi

if command -v VBoxManage &> /dev/null; then
    echo "✅ VirtualBox detected: $(VBoxManage --version)"
    VBOX_AVAILABLE=true
else
    echo "⚠️  VirtualBox not found"
    VBOX_AVAILABLE=false
fi

echo ""
echo "=== Summary ==="
if [ "$PARALLELS_AVAILABLE" = true ] || [ "$VBOX_AVAILABLE" = true ]; then
    echo "✅ Vagrantfile is ready to use"
    if [ "$VBOX_AVAILABLE" = true ]; then
        echo "💡 You can use VirtualBox provider (default if Parallels unavailable)"
    fi
    if [ "$PARALLELS_AVAILABLE" = true ]; then
        echo "💡 You can use Parallels provider"
    fi
    echo ""
    echo "To test creating VMs, run:"
    echo "  ./orchestrator.sh create"
    echo ""
    echo "Or manually with Vagrant:"
    echo "  vagrant up k3s-master"
    echo "  vagrant up k3s-worker"
else
    echo "⚠️  No virtualization provider detected!"
    echo "Please install either:"
    echo "  - VirtualBox: https://www.virtualbox.org/"
    echo "  - Parallels Desktop Pro: https://www.parallels.com/"
    exit 1
fi

