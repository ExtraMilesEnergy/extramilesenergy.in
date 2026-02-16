// ============ ADMIN MAIN MODULE ============
// यह फाइल सारे admin functions handle करती है - Products, Company, Sync etc.

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
        const response = await fetch(`${API_BASE}/api/stats`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalProducts').textContent = stats.totalProducts || '0';
            document.getElementById('activeProducts').textContent = stats.activeProducts || '0';
            document.getElementById('draftProducts').textContent = stats.draftProducts || '0';
            document.getElementById('pagesGenerated').textContent = stats.pagesGenerated || '0';
            document.getElementById('lastSync').textContent = stats.lastSync || '--';
        }
        
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to demo data
        document.getElementById('totalProducts').textContent = '0';
        document.getElementById('activeProducts').textContent = '0';
        document.getElementById('draftProducts').textContent = '0';
        document.getElementById('pagesGenerated').textContent = '0';
        document.getElementById('lastSync').textContent = '--';
    }
};

async function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    if (!activityDiv) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/activity`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const activities = await response.json();
            
            if (activities.length === 0) {
                activityDiv.innerHTML = '<div class="loading">No recent activity</div>';
                return;
            }
            
            let html = '<ul style="list-style: none; padding: 0;">';
            activities.forEach(act => {
                html += `
                    <li style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; gap: 15px;">
                        <span style="color: var(--gold-light); min-width: 100px;">${act.time || 'Just now'}</span>
                        <span style="color: var(--text);">${act.action || 'Activity'}</span>
                    </li>
                `;
            });
            html += '</ul>';
            activityDiv.innerHTML = html;
        } else {
            // Demo activity if API fails
            showDemoActivity();
        }
    } catch (error) {
        console.error('Error loading activity:', error);
        showDemoActivity();
    }
}

function showDemoActivity() {
    const activityDiv = document.getElementById('recentActivity');
    if (!activityDiv) return;
    
    const activities = [
        { time: '2 min ago', action: 'Dashboard viewed' },
        { time: '15 min ago', action: 'Products synced with GitHub' },
        { time: '1 hour ago', action: 'New product added' }
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
    console.log("📦 Loading products from GitHub");
    
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Loading products...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            products = await response.json();
            displayProducts();
        } else {
            productsDiv.innerHTML = '<div class="loading">Failed to load products</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsDiv.innerHTML = '<div class="loading">Network error. Make sure backend is running.</div>';
    }
};

function displayProducts() {
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    if (!products || products.length === 0) {
        productsDiv.innerHTML = '<div class="loading">No products found. Click "Add Product" to create one.</div>';
        return;
    }
    
    let html = '<div class="products-grid">';
    products.forEach(product => {
        // Get first image or placeholder
        const productImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'https://via.placeholder.com/300?text=No+Image';
        
        html += `
            <div class="product-card">
                <img src="${productImage}" 
                     class="product-image" alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/300?text=Error'">
                <h3 style="color: var(--gold); margin: 10px 0;">${product.name || 'Unnamed Product'}</h3>
                <p style="color: var(--text-muted);">${product.description ? product.description.substring(0, 50) + '...' : 'No description'}</p>
                <p style="color: var(--success); font-size: 1.2rem; margin: 10px 0;">
                    <strong>₹${product.price || 'N/A'}</strong>
                </p>
                <p style="color: var(--text-muted);"><small>Category: ${product.category || 'N/A'} | Model: ${product.model || 'N/A'}</small></p>
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
        // Fill form with product data
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productSpecs').value = product.specs || '';
        
        // Additional fields if they exist in your form
        if (document.getElementById('productVoltage')) {
            document.getElementById('productVoltage').value = product.voltage || '';
        }
        if (document.getElementById('productModel')) {
            document.getElementById('productModel').value = product.model || '';
        }
        if (document.getElementById('productConfig')) {
            document.getElementById('productConfig').value = product.configuration || '';
        }
        if (document.getElementById('productChemistry')) {
            document.getElementById('productChemistry').value = product.chemistry || 'LiFePO₄';
        }
        if (document.getElementById('productWarranty')) {
            document.getElementById('productWarranty').value = product.warranty || '3 Year Warranty';
        }
        if (document.getElementById('productFeatures')) {
            document.getElementById('productFeatures').value = product.features ? product.features.join('\n') : '';
        }
        
        // Load images
        if (product.images && product.images.length > 0) {
            productImages = [...product.images];
            displayProductImages();
        } else {
            productImages = [];
            const grid = document.getElementById('productImagesPreview');
            if (grid) grid.innerHTML = '';
        }
        
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
    
    try {
        const response = await fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.showMessage('Product deleted successfully', 'success');
            loadProducts();
        } else {
            const error = await response.json();
            window.showMessage(error.error || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        window.showMessage('Network error', 'error');
    }
};

// ============ ADD/EDIT PRODUCT FUNCTIONS ============
window.saveProduct = async function() {
    console.log("💾 Saving product to GitHub");
    
    // Collect all form data
    const productData = {
        name: document.getElementById('productName')?.value || '',
        price: document.getElementById('productPrice')?.value || '',
        category: document.getElementById('productCategory')?.value || '',
        description: document.getElementById('productDescription')?.value || '',
        specs: document.getElementById('productSpecs')?.value || '',
        images: productImages,
        status: 'active'
    };
    
    // Add optional fields if they exist
    if (document.getElementById('productVoltage')) {
        productData.voltage = document.getElementById('productVoltage').value;
    }
    if (document.getElementById('productModel')) {
        productData.model = document.getElementById('productModel').value;
    }
    if (document.getElementById('productConfig')) {
        productData.configuration = document.getElementById('productConfig').value;
    }
    if (document.getElementById('productChemistry')) {
        productData.chemistry = document.getElementById('productChemistry').value;
    }
    if (document.getElementById('productWarranty')) {
        productData.warranty = document.getElementById('productWarranty').value;
    }
    if (document.getElementById('productFeatures')) {
        const featuresText = document.getElementById('productFeatures').value;
        productData.features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
    }
    
    if (!productData.name) {
        window.showMessage('Product name is required', 'error');
        return;
    }
    
    try {
        let url = `${API_BASE}/api/products`;
        let method = 'POST';
        
        if (currentProductId) {
            url = `${API_BASE}/api/products/${currentProductId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            window.showMessage(currentProductId ? 'Product updated successfully' : 'Product added successfully', 'success');
            resetProductForm();
            loadProducts();
            showTab('products');
        } else {
            const error = await response.json();
            window.showMessage(error.error || 'Failed to save product', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        window.showMessage('Network error. Make sure backend is running.', 'error');
    }
};

window.resetProductForm = function() {
    console.log("🔄 Resetting form");
    
    // Reset all form fields
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productSpecs').value = '';
    
    // Reset optional fields if they exist
    if (document.getElementById('productVoltage')) {
        document.getElementById('productVoltage').value = '';
    }
    if (document.getElementById('productModel')) {
        document.getElementById('productModel').value = '';
    }
    if (document.getElementById('productConfig')) {
        document.getElementById('productConfig').value = '';
    }
    if (document.getElementById('productChemistry')) {
        document.getElementById('productChemistry').value = 'LiFePO₄';
    }
    if (document.getElementById('productWarranty')) {
        document.getElementById('productWarranty').value = '3 Year Warranty';
    }
    if (document.getElementById('productFeatures')) {
        document.getElementById('productFeatures').value = '';
    }
    
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
    
    window.showMessage(`Uploading ${files.length} image(s)...`, 'info');
    
    for (let file of files) {
        await uploadImage(file);
    }
};

async function uploadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            const base64Image = e.target.result.split(',')[1];
            
            try {
                const response = await fetch(`${API_BASE}/api/upload-image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        base64Image: base64Image,
                        filename: file.name
                    }),
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    productImages.push(data.url);
                    addImagePreview(data.url);
                    window.showMessage(`Uploaded: ${file.name}`, 'success');
                    resolve(data.url);
                } else {
                    const error = await response.json();
                    window.showMessage(`Failed to upload ${file.name}: ${error.error}`, 'error');
                    reject(error);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                window.showMessage(`Network error uploading ${file.name}`, 'error');
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            window.showMessage(`Error reading file: ${file.name}`, 'error');
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

function addImagePreview(url, isPrimary = false) {
    const grid = document.getElementById('productImagesPreview');
    if (!grid) return;
    
    const div = document.createElement('div');
    div.className = 'image-preview-item';
    div.innerHTML = `
        <img src="${url}" alt="Product image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/150?text=Error'">
        ${isPrimary ? '<span class="primary-badge">Primary</span>' : ''}
        <button class="btn btn-danger" style="position:absolute; top:5px; right:5px; padding:2px 6px; font-size:0.8rem;" onclick="removeImage('${url}')">
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
    
    try {
        const response = await fetch(`${API_BASE}/api/company`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const company = await response.json();
            displayCompanyDetails(company);
        } else {
            // Demo company data if API fails
            const demoCompany = {
                name: 'Extra Miles Energy',
                address: '123 Solar Park, New Delhi, India',
                phone: '+91 98765 43210',
                email: 'info@extramilesenergy.com',
                gst: '07ABCDE1234F1Z5',
                website: 'www.extramilesenergy.com'
            };
            displayCompanyDetails(demoCompany);
        }
    } catch (error) {
        console.error('Error loading company:', error);
        // Demo company data on error
        const demoCompany = {
            name: 'Extra Miles Energy',
            address: '123 Solar Park, New Delhi, India',
            phone: '+91 98765 43210',
            email: 'info@extramilesenergy.com',
            gst: '07ABCDE1234F1Z5',
            website: 'www.extramilesenergy.com'
        };
        displayCompanyDetails(demoCompany);
    }
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
    
    try {
        const response = await fetch(`${API_BASE}/api/company`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData),
            credentials: 'include'
        });
        
        if (response.ok) {
            window.showMessage('Company details saved successfully', 'success');
        } else {
            window.showMessage('Failed to save company details', 'error');
        }
    } catch (error) {
        console.error('Error saving company:', error);
        window.showMessage('Network error', 'error');
    }
};

// ============ GITHUB SYNC FUNCTIONS ============
window.syncProductsToGitHub = async function() {
    console.log("🔄 Syncing products to GitHub");
    
    const progressBar = document.getElementById('productSyncProgress');
    const progressFill = document.getElementById('productSyncFill');
    
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '0%';
    
    try {
        const response = await fetch(`${API_BASE}/api/sync/products`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Animate progress
            let width = 0;
            const interval = setInterval(() => {
                width += 10;
                if (progressFill) progressFill.style.width = width + '%';
                
                if (width >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        if (progressBar) progressBar.classList.remove('active');
                        window.showMessage('Products synced successfully', 'success');
                        loadProducts(); // Reload products after sync
                    }, 500);
                }
            }, 100);
        } else {
            window.showMessage('Failed to sync products', 'error');
            if (progressBar) progressBar.classList.remove('active');
        }
    } catch (error) {
        console.error('Error syncing products:', error);
        window.showMessage('Network error', 'error');
        if (progressBar) progressBar.classList.remove('active');
    }
};

window.syncCompanyToGitHub = async function() {
    console.log("🔄 Syncing company to GitHub");
    
    const progressBar = document.getElementById('companySyncProgress');
    const progressFill = document.getElementById('companySyncFill');
    
    if (progressBar) progressBar.classList.add('active');
    if (progressFill) progressFill.style.width = '0%';
    
    try {
        const response = await fetch(`${API_BASE}/api/sync/company`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Animate progress
            let width = 0;
            const interval = setInterval(() => {
                width += 10;
                if (progressFill) progressFill.style.width = width + '%';
                
                if (width >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        if (progressBar) progressBar.classList.remove('active');
                        window.showMessage('Company details synced successfully', 'success');
                    }, 500);
                }
            }, 100);
        } else {
            window.showMessage('Failed to sync company', 'error');
            if (progressBar) progressBar.classList.remove('active');
        }
    } catch (error) {
        console.error('Error syncing company:', error);
        window.showMessage('Network error', 'error');
        if (progressBar) progressBar.classList.remove('active');
    }
};

window.fetchProductsFromGitHub = function() {
    window.showMessage('Fetching products from GitHub...', 'info');
    loadProducts();
};

window.fetchCompanyFromGitHub = function() {
    window.showMessage('Fetching company from GitHub...', 'info');
    loadCompanyDetails();
};

// ============ CAMERA FUNCTIONS ============
let cameraStream = null;
let currentCamera = 'environment';

window.openCamera = function() {
    document.getElementById('cameraModal').classList.add('active');
    startCamera();
};

window.closeCamera = function() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('cameraModal').classList.remove('active');
};

async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentCamera }
        });
        const video = document.getElementById('cameraPreview');
        video.srcObject = cameraStream;
    } catch (error) {
        console.error('Camera error:', error);
        window.showMessage('Could not access camera', 'error');
    }
}

window.switchCamera = function() {
    currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        startCamera();
    }
};

window.capturePhoto = function() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        await uploadImage(file);
        closeCamera();
    }, 'image/jpeg');
};
// ============ GITHUB SETTINGS FUNCTIONS ============

// Test GitHub Connection
window.testGitHubConnection = async function() {
    console.log("🔌 Testing GitHub connection");
    
    const username = document.getElementById('settings_github_username')?.value || 'ExtraMilesEnergy';
    const repo = document.getElementById('settings_github_repo')?.value || 'extramilesenergy.in';
    const token = document.getElementById('settings_github_token')?.value;
    const branch = document.getElementById('settings_github_branch')?.value || 'main';
    const productsPath = document.getElementById('settings_products_path')?.value || 'all-products.json';
    
    if (!token) {
        window.showMessage('Please enter your GitHub token', 'error');
        return;
    }
    
    const statusDiv = document.getElementById('githubConnectionStatus');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Testing connection...</div>';
    
    try {
        // Test 1: Check if repository exists
        const repoUrl = `https://api.github.com/repos/${username}/${repo}`;
        const repoResponse = await fetch(repoUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!repoResponse.ok) {
            statusDiv.innerHTML = `
                <div class="message error" style="display: block;">
                    <i class="fas fa-times-circle"></i> Repository not found or token invalid.<br>
                    Make sure repository "${username}/${repo}" exists and token has correct permissions.
                </div>
            `;
            return;
        }
        
        const repoData = await repoResponse.json();
        
        // Test 2: Check if products file exists
        const fileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${productsPath}`;
        const fileResponse = await fetch(fileUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let fileStatus = '';
        if (fileResponse.ok) {
            fileStatus = '<span style="color: var(--success);">✅ File exists</span>';
        } else {
            fileStatus = '<span style="color: var(--warning);">⚠️ File not found (will be created)</span>';
        }
        
        statusDiv.innerHTML = `
            <div class="message success" style="display: block;">
                <i class="fas fa-check-circle"></i> GitHub connection successful!<br><br>
                <strong>Repository:</strong> ${repoData.full_name}<br>
                <strong>Default Branch:</strong> ${repoData.default_branch}<br>
                <strong>Private:</strong> ${repoData.private ? 'Yes' : 'No'}<br>
                <strong>Products File:</strong> ${productsPath} - ${fileStatus}<br>
                <strong>Token Permissions:</strong> Valid
            </div>
        `;
        
        // Save token to session (not localStorage)
        sessionStorage.setItem('github_token', token);
        
    } catch (error) {
        console.error('Connection test error:', error);
        statusDiv.innerHTML = `
            <div class="message error" style="display: block;">
                <i class="fas fa-times-circle"></i> Connection failed: ${error.message}
            </div>
        `;
    }
};

// Save GitHub Settings
window.saveGitHubSettings = function() {
    console.log("💾 Saving GitHub settings");
    
    const settings = {
        username: document.getElementById('settings_github_username')?.value || 'ExtraMilesEnergy',
        repo: document.getElementById('settings_github_repo')?.value || 'extramilesenergy.in',
        branch: document.getElementById('settings_github_branch')?.value || 'main',
        productsPath: document.getElementById('settings_products_path')?.value || 'all-products.json'
    };
    
    // Save to localStorage (except token)
    localStorage.setItem('github_settings', JSON.stringify(settings));
    
    const token = document.getElementById('settings_github_token')?.value;
    if (token) {
        sessionStorage.setItem('github_token', token);
    }
    
    window.showMessage('GitHub settings saved successfully', 'success');
    
    // Update connection status
    const statusDiv = document.getElementById('githubConnectionStatus');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `
        <div class="message success" style="display: block;">
            <i class="fas fa-check-circle"></i> Settings saved. Click "Test Connection" to verify.
        </div>
    `;
};

// Load GitHub Settings
window.loadGitHubSettings = function() {
    console.log("📂 Loading GitHub settings");
    
    const saved = localStorage.getItem('github_settings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            document.getElementById('settings_github_username').value = settings.username || 'ExtraMilesEnergy';
            document.getElementById('settings_github_repo').value = settings.repo || 'extramilesenergy.in';
            document.getElementById('settings_github_branch').value = settings.branch || 'main';
            document.getElementById('settings_products_path').value = settings.productsPath || 'all-products.json';
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    
    // Check for saved token in session
    const token = sessionStorage.getItem('github_token');
    if (token) {
        document.getElementById('settings_github_token').value = token;
    }
};

// Reset GitHub Settings
window.resetGitHubSettings = function() {
    if (!confirm('Are you sure you want to reset all GitHub settings?')) return;
    
    localStorage.removeItem('github_settings');
    sessionStorage.removeItem('github_token');
    
    // Reset form to defaults
    document.getElementById('settings_github_username').value = 'ExtraMilesEnergy';
    document.getElementById('settings_github_repo').value = 'extramilesenergy.in';
    document.getElementById('settings_github_branch').value = 'main';
    document.getElementById('settings_products_path').value = 'all-products.json';
    document.getElementById('settings_github_token').value = '';
    
    const statusDiv = document.getElementById('githubConnectionStatus');
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `
        <div class="message warning" style="display: block;">
            <i class="fas fa-undo"></i> Settings reset to defaults
        </div>
    `;
    
    window.showMessage('Settings reset successfully', 'success');
};

// Clear GitHub Token
window.clearGitHubToken = function() {
    sessionStorage.removeItem('github_token');
    document.getElementById('settings_github_token').value = '';
    window.showMessage('GitHub token cleared', 'info');
};

// Sync Images to GitHub
window.syncImagesToGitHub = async function() {
    console.log("🖼️ Syncing images to GitHub");
    window.showMessage('Image sync feature coming soon...', 'info');
};

// ============ UPDATE EXISTING FUNCTIONS TO USE SAVED SETTINGS ============

// Override fetch functions to use saved token
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Add GitHub token to API calls if available
    if (url.includes('/api/') && !url.includes('/send-otp') && !url.includes('/verify-otp')) {
        const token = sessionStorage.getItem('github_token');
        if (token) {
            options.headers = {
                ...options.headers,
                'X-GitHub-Token': token
            };
        }
    }
    return originalFetch(url, options);
};

// Update loadProducts to use token from session
const originalLoadProducts = window.loadProducts;
window.loadProducts = async function() {
    console.log("📦 Loading products from GitHub with saved settings");
    
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Loading products...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            credentials: 'include',
            headers: {
                'X-GitHub-Token': sessionStorage.getItem('github_token') || ''
            }
        });
        
        if (response.ok) {
            products = await response.json();
            displayProducts();
        } else {
            productsDiv.innerHTML = '<div class="loading">Failed to load products. Check GitHub settings.</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsDiv.innerHTML = '<div class="loading">Network error. Make sure backend is running.</div>';
    }
};

// Load settings when settings tab is shown
const originalShowTab = window.showTab;
window.showTab = function(tabId) {
    originalShowTab(tabId);
    if (tabId === 'settings') {
        loadGitHubSettings();
    }
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Admin panel loaded");
    
    // Check if user is logged in by seeing if dashboard is visible
    if (document.getElementById('adminDashboard').style.display === 'block') {
        loadDashboardData();
    }
    
    // Add event listener for Enter key in OTP input
    const otpInput = document.getElementById('otpInput');
    if (otpInput) {
        otpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyOTP();
            }
        });
    }
});