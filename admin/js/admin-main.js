// ============ ADMIN MAIN MODULE ============
let products = [];
let currentProductId = null;
let productImages = [];

// ============ TAB NAVIGATION ============
window.showTab = function(tabId) {
    console.log("🔄 Switching to tab:", tabId);
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate selected button
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(
        btn => btn.textContent.toLowerCase().includes(tabId.toLowerCase())
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load data based on tab
    if (tabId === 'dashboard') {
        loadDashboardData();
    } else if (tabId === 'products') {
        loadProducts();
    } else if (tabId === 'company') {
        loadCompanyDetails();
    }
};

// ============ DASHBOARD FUNCTIONS ============
window.loadDashboardData = async function() {
    console.log("📊 Loading dashboard data");
    
    try {
        // Demo data for now (since backend APIs might not be ready)
        document.getElementById('totalProducts').textContent = '5';
        document.getElementById('activeProducts').textContent = '3';
        document.getElementById('draftProducts').textContent = '2';
        document.getElementById('pagesGenerated').textContent = '8';
        document.getElementById('lastSync').textContent = 'Just now';
        
        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
};

function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    if (!activityDiv) return;
    
    const activities = [
        { time: '2 min ago', action: 'Product "Solar Inverter" was updated' },
        { time: '15 min ago', action: 'New product "LiFePO4 Battery 100Ah" added' },
        { time: '1 hour ago', action: 'Company details updated' },
        { time: '3 hours ago', action: 'GitHub sync completed' }
    ];
    
    let html = '<ul style="list-style: none; padding: 0;">';
    activities.forEach(act => {
        html += `
            <li style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; gap: 15px;">
                <span style="color: var(--gold-light); min-width: 100px;">${act.time}</span>
                <span style="color: var(--text);">${act.action}</span>
            </li>
        `;
    });
    html += '</ul>';
    
    activityDiv.innerHTML = html;
}

// ============ PRODUCTS FUNCTIONS ============
window.loadProducts = async function() {
    console.log("📦 Loading products");
    
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    // Demo products
    const demoProducts = [
        {
            id: '1',
            name: 'LiFePO4 Battery 100Ah',
            price: '25000',
            category: 'battery',
            description: '12.8V 100Ah Lithium Iron Phosphate Battery',
            image: 'https://via.placeholder.com/300',
            specs: 'Cycle Life: 4000+ cycles'
        },
        {
            id: '2',
            name: 'Solar Inverter 3kW',
            price: '35000',
            category: 'inverter',
            description: 'Pure Sine Wave Solar Inverter',
            image: 'https://via.placeholder.com/300',
            specs: 'MPPT Charge Controller'
        },
        {
            id: '3',
            name: 'Solar Panel 330W',
            price: '12000',
            category: 'solar',
            description: 'Mono-crystalline Solar Panel',
            image: 'https://via.placeholder.com/300',
            specs: 'Efficiency: 19.5%'
        }
    ];
    
    products = demoProducts;
    displayProducts();
};

function displayProducts() {
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    if (products.length === 0) {
        productsDiv.innerHTML = '<div class="loading">No products found</div>';
        return;
    }
    
    let html = '<div class="products-grid">';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300'}" 
                     class="product-image" alt="${product.name}">
                <h3 style="color: var(--gold); margin: 10px 0;">${product.name}</h3>
                <p style="color: var(--text-muted);">${product.description || ''}</p>
                <p style="color: var(--success); font-size: 1.2rem; margin: 10px 0;">
                    <strong>₹${product.price || 'N/A'}</strong>
                </p>
                <p style="color: var(--text-muted);"><small>Category: ${product.category || 'N/A'}</small></p>
                <div class="product-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-info" onclick="editProduct('${product.id}')" style="flex: 1;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" style="flex: 1;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    productsDiv.innerHTML = html;
}

window.editProduct = function(productId) {
    console.log("✏️ Editing product:", productId);
    
    currentProductId = productId;
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Fill form
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productSpecs').value = product.specs || '';
        
        // Go to add product tab
        showTab('addProduct');
        
        // Change form title
        const titleElement = document.querySelector('#addProduct h3');
        if (titleElement) {
            titleElement.textContent = 'Edit Product';
        }
        
        window.showMessage('Product loaded for editing', 'success');
    }
};

window.deleteProduct = async function(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    console.log("🗑️ Deleting product:", productId);
    
    // Remove from demo array
    products = products.filter(p => p.id !== productId);
    displayProducts();
    window.showMessage('Product deleted successfully', 'success');
};

// ============ ADD/EDIT PRODUCT FUNCTIONS ============
window.saveProduct = async function() {
    console.log("💾 Saving product");
    
    const productData = {
        name: document.getElementById('productName')?.value || '',
        price: document.getElementById('productPrice')?.value || '',
        category: document.getElementById('productCategory')?.value || '',
        description: document.getElementById('productDescription')?.value || '',
        specs: document.getElementById('productSpecs')?.value || '',
        images: productImages
    };
    
    if (!productData.name) {
        window.showMessage('Product name is required', 'error');
        return;
    }
    
    if (currentProductId) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData, id: currentProductId };
            window.showMessage('Product updated successfully', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            ...productData,
            id: Date.now().toString(),
            image: 'https://via.placeholder.com/300'
        };
        products.push(newProduct);
        window.showMessage('Product added successfully', 'success');
    }
    
    resetProductForm();
    loadProducts();
    showTab('products');
};

window.resetProductForm = function() {
    console.log("🔄 Resetting form");
    
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productSpecs').value = '';
    
    productImages = [];
    currentProductId = null;
    
    const titleElement = document.querySelector('#addProduct h3');
    if (titleElement) {
        titleElement.textContent = 'Add New Product';
    }
    
    // Clear image preview
    const imagesGrid = document.getElementById('productImagesPreview');
    if (imagesGrid) {
        imagesGrid.innerHTML = '';
    }
};

// ============ IMAGE UPLOAD FUNCTIONS ============
window.triggerFileUpload = function() {
    document.getElementById('imageUpload').click();
};

window.handleImageUpload = async function(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    for (let file of files) {
        // Demo: Just add placeholder images
        const imageUrl = 'https://via.placeholder.com/300?text=' + file.name;
        productImages.push(imageUrl);
        addImagePreview(imageUrl);
        window.showMessage('Image uploaded: ' + file.name, 'success');
    }
};

function addImagePreview(url, isPrimary = false) {
    const grid = document.getElementById('productImagesPreview');
    if (!grid) return;
    
    const div = document.createElement('div');
    div.className = 'image-preview-item';
    div.innerHTML = `
        <img src="${url}" alt="Product image" style="width: 100%; height: 100%; object-fit: cover;">
        ${isPrimary ? '<span class="primary-badge">Primary</span>' : ''}
        <button class="btn btn-danger" style="position:absolute; top:5px; right:5px; padding:2px 6px;" onclick="removeImage('${url}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    grid.appendChild(div);
}

window.removeImage = function(url) {
    productImages = productImages.filter(img => img !== url);
    displayProductImages();
};

function displayProductImages() {
    const grid = document.getElementById('productImagesPreview');
    if (!grid) return;
    
    grid.innerHTML = '';
    productImages.forEach((url, index) => {
        addImagePreview(url, index === 0);
    });
}

// ============ COMPANY DETAILS FUNCTIONS ============
window.loadCompanyDetails = async function() {
    console.log("🏢 Loading company details");
    
    const detailsDiv = document.getElementById('companyDetails');
    if (!detailsDiv) return;
    
    // Demo company data
    const company = {
        name: 'Extra Miles Energy',
        address: '123 Solar Park, New Delhi, India',
        phone: '+91 98765 43210',
        email: 'info@extramilesenergy.com',
        gst: '07ABCDE1234F1Z5',
        website: 'www.extramilesenergy.com'
    };
    
    displayCompanyDetails(company);
};

function displayCompanyDetails(company) {
    const detailsDiv = document.getElementById('companyDetails');
    if (!detailsDiv) return;
    
    let html = '<div class="company-details-form">';
    
    const fields = [
        { key: 'name', label: 'Company Name' },
        { key: 'address', label: 'Address' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'gst', label: 'GST Number' },
        { key: 'website', label: 'Website' }
    ];
    
    fields.forEach(field => {
        html += `
            <div class="detail-item" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm);">
                <label style="min-width: 120px; color: var(--gold-light); font-weight: 500;">${field.label}:</label>
                <input type="text" value="${company[field.key] || ''}" 
                       id="company_${field.key}" class="form-input" style="flex: 1;">
            </div>
        `;
    });
    
    html += `
        <div style="display: flex; gap: 15px; margin-top: 20px;">
            <button class="btn btn-success" onclick="saveCompanyDetails()">
                <i class="fas fa-save"></i> Save Changes
            </button>
        </div>
    </div>`;
    
    detailsDiv.innerHTML = html;
}

window.saveCompanyDetails = async function() {
    console.log("💾 Saving company details");
    
    const companyData = {};
    const fields = ['name', 'address', 'phone', 'email', 'gst', 'website'];
    
    fields.forEach(field => {
        const input = document.getElementById(`company_${field}`);
        if (input) {
            companyData[field] = input.value;
        }
    });
    
    window.showMessage('Company details saved successfully', 'success');
};

// ============ GITHUB SYNC FUNCTIONS ============
window.syncProductsToGitHub = async function() {
    console.log("🔄 Syncing products to GitHub");
    
    const progressBar = document.getElementById('productSyncProgress');
    const progressFill = document.getElementById('productSyncFill');
    
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '0%';
    
    // Simulate progress
    let width = 0;
    const interval = setInterval(() => {
        width += 10;
        if (progressFill) progressFill.style.width = width + '%';
        
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (progressBar) progressBar.classList.remove('active');
                window.showMessage('Products synced to GitHub successfully', 'success');
            }, 500);
        }
    }, 200);
};

window.syncCompanyToGitHub = async function() {
    console.log("🔄 Syncing company to GitHub");
    
    const progressBar = document.getElementById('companySyncProgress');
    const progressFill = document.getElementById('companySyncFill');
    
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '0%';
    
    // Simulate progress
    let width = 0;
    const interval = setInterval(() => {
        width += 10;
        if (progressFill) progressFill.style.width = width + '%';
        
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (progressBar) progressBar.classList.remove('active');
                window.showMessage('Company details synced to GitHub successfully', 'success');
            }, 500);
        }
    }, 200);
};

window.fetchProductsFromGitHub = function() {
    window.showMessage('Fetching products from GitHub...', 'success');
    setTimeout(() => {
        loadProducts();
        window.showMessage('Products fetched from GitHub', 'success');
    }, 1500);
};

window.fetchCompanyFromGitHub = function() {
    window.showMessage('Fetching company from GitHub...', 'success');
    setTimeout(() => {
        loadCompanyDetails();
        window.showMessage('Company details fetched from GitHub', 'success');
    }, 1500);
};

// ============ SETTINGS TAB ============
// Settings tab already has "Coming soon..." message

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Admin panel loaded");
    
    // Check if dashboard is visible
    if (document.getElementById('adminDashboard').style.display === 'block') {
        loadDashboardData();
    }
});