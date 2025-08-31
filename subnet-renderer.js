// Subnet Calculator Renderer Process
document.addEventListener('DOMContentLoaded', () => {
    // Display version information
    const versions = window.electronAPI.getVersions();
    const electronVersion = document.getElementById('electron-version');
    const nodeVersion = document.getElementById('node-version');
    
    if (electronVersion) electronVersion.textContent = versions.electron;
    if (nodeVersion) nodeVersion.textContent = versions.node;
    
    // Back button navigation
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.electronAPI.navigateToHome();
        });
    }
    
    // Focus on IP input
    const ipInput = document.getElementById('ip');
    if (ipInput) {
        ipInput.focus();
    }
});

// Validation functions
function validateIPAddress(ip) {
    const regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(regex);
    
    if (!match) return false;
    
    return match.slice(1).every(octet => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
    });
}

function validateSubnetMask(mask) {
    // Check for CIDR notation
    if (mask.startsWith('/')) {
        const cidr = parseInt(mask.substring(1), 10);
        return !isNaN(cidr) && cidr >= 0 && cidr <= 32;
    }
    
    // Check for dotted decimal notation
    if (validateIPAddress(mask)) {
        const octets = mask.split('.').map(o => parseInt(o, 10));
        const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('');
        // Valid subnet mask should have all 1s followed by all 0s
        const firstZero = binary.indexOf('0');
        if (firstZero === -1) return true; // All 1s (255.255.255.255)
        return !binary.substring(firstZero).includes('1');
    }
    
    return false;
}

function maskToCIDR(mask) {
    if (mask.startsWith('/')) {
        return parseInt(mask.substring(1), 10);
    }
    
    const octets = mask.split('.').map(o => parseInt(o, 10));
    const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('');
    return binary.split('1').length - 1;
}

// Calculate subnet
async function calculateSubnet() {
    const ipInput = document.getElementById('ip');
    const subnetInput = document.getElementById('subnet');
    const ipError = document.getElementById('ipError');
    const subnetError = document.getElementById('subnetError');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Reset errors
    ipInput.classList.remove('error');
    subnetInput.classList.remove('error');
    ipError.classList.remove('show');
    subnetError.classList.remove('show');
    
    const ip = ipInput.value.trim();
    const subnet = subnetInput.value.trim();
    
    // Validate IP
    if (!ip) {
        ipInput.classList.add('error');
        ipError.classList.add('show');
        ipError.textContent = 'Please enter an IP address';
        return;
    }
    
    if (!validateIPAddress(ip)) {
        ipInput.classList.add('error');
        ipError.classList.add('show');
        ipError.textContent = 'Please enter a valid IP address';
        return;
    }
    
    // Validate subnet
    if (!subnet) {
        subnetInput.classList.add('error');
        subnetError.classList.add('show');
        subnetError.textContent = 'Please enter a subnet mask or CIDR';
        return;
    }
    
    if (!validateSubnetMask(subnet)) {
        subnetInput.classList.add('error');
        subnetError.classList.add('show');
        subnetError.textContent = 'Please enter a valid subnet mask or CIDR notation';
        return;
    }
    
    // Convert subnet mask to CIDR if needed
    const cidr = maskToCIDR(subnet);
    
    // Disable button during calculation
    calculateBtn.disabled = true;
    calculateBtn.innerHTML = 'Calculating<span class="loading"></span>';
    
    try {
        const result = await window.electronAPI.calculateSubnet(ip, cidr);
        
        if (result.success) {
            displayResults(result.data);
        } else {
            console.error('Calculation error:', result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        calculateBtn.disabled = false;
        calculateBtn.textContent = 'Calculate';
    }
}

// Display results
function displayResults(data) {
    const results = document.getElementById('results');
    
    // Network address
    document.getElementById('networkAddress').textContent = data.networkAddress;
    document.getElementById('networkBinary').textContent = 
        data.networkAddress.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.');
    
    // Broadcast address
    document.getElementById('broadcastAddress').textContent = data.broadcastAddress;
    document.getElementById('broadcastBinary').textContent = 
        data.broadcastAddress.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.');
    
    // Subnet mask
    document.getElementById('subnetMask').textContent = data.subnetMask;
    document.getElementById('subnetBinary').textContent = 
        data.subnetMask.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.');
    
    // CIDR
    document.getElementById('cidr').textContent = `/${data.cidr}`;
    
    // Host range
    if (data.usableHosts > 0) {
        document.getElementById('hostRange').textContent = `${data.firstHost} - ${data.lastHost}`;
    } else {
        document.getElementById('hostRange').textContent = 'N/A';
    }
    
    // Total hosts
    document.getElementById('totalHosts').textContent = `${data.totalHosts.toLocaleString()} (${data.usableHosts.toLocaleString()} usable)`;
    
    // IP class
    document.getElementById('ipClass').textContent = data.ipClass;
    
    // Show results
    results.classList.add('show');
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const ipInput = document.getElementById('ip');
    const subnetInput = document.getElementById('subnet');
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateSubnet);
    }
    
    // Enter key to calculate
    if (ipInput) {
        ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateSubnet();
            }
        });
        
        ipInput.addEventListener('input', () => {
            ipInput.classList.remove('error');
            document.getElementById('ipError').classList.remove('show');
        });
    }
    
    if (subnetInput) {
        subnetInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateSubnet();
            }
        });
        
        subnetInput.addEventListener('input', () => {
            subnetInput.classList.remove('error');
            document.getElementById('subnetError').classList.remove('show');
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (ipInput) ipInput.value = '';
            if (subnetInput) subnetInput.value = '';
            if (ipInput) ipInput.focus();
            const results = document.getElementById('results');
            if (results) results.classList.remove('show');
        }
    });
});