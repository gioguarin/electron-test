document.addEventListener('DOMContentLoaded', () => {
    // Display version information
    const electronVersion = document.getElementById('electron-version');
    const nodeVersion = document.getElementById('node-version');
    
    if (electronVersion && nodeVersion) {
        const versions = window.electronAPI.getVersions();
        electronVersion.textContent = versions.electron;
        nodeVersion.textContent = versions.node;
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const toolCards = document.querySelectorAll('.tool-card');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        toolCards.forEach(card => {
            const title = card.querySelector('.tool-title').textContent.toLowerCase();
            const description = card.querySelector('.tool-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Check if any cards are visible in each category
        document.querySelectorAll('.category-section').forEach(section => {
            const visibleCards = section.querySelectorAll('.tool-card:not([style*="display: none"])');
            if (visibleCards.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    });

    // Tool card click handlers
    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            const toolName = card.dataset.tool;
            const isAvailable = card.dataset.available === 'true';
            
            console.log('Tool clicked:', toolName, 'Available:', isAvailable);
            
            if (isAvailable) {
                // Navigate to the tool
                console.log('Navigating to:', toolName);
                window.electronAPI.navigateToTool(toolName);
            } else {
                // Show coming soon message
                showNotification('This tool is coming soon!');
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    });

    // Notification function
    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #333;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                transform: translateY(100px);
                transition: transform 0.3s ease;
                z-index: 1000;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.transform = 'translateY(0)';

        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
        }, 3000);
    }

    // Add hover effect sounds (optional)
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (card.dataset.available === 'true') {
                card.style.cursor = 'pointer';
            }
        });
    });

    // Animate cards on page load
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    toolCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});