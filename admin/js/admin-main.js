// ============ ADMIN MAIN MODULE ============
// यह फाइल सारे admin functions handle करती है - Products, Company, Sync etc.

let products = [];
let currentProductId = null;
let productImages = [];

// ============ TAB NAVIGATION ============
function showTab(tabId) {
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
}

// ============ DASHBOARD FUNCTIONS ============
async function loadDashboardData() {
    try {
        // Load stats from backend
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
        window.showMessage('Failed to load dashboard', 'error');
    }
}

async function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    
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
            
            let html = '<ul style="list-style: none;">';
            activities.forEach(act => {
                html += `
                    <li style="padding: 10px; border-bottom: 1px solid var(--border);">
                        <span style="color: var(--gold-light);">${act.time}</span> - ${act.action}
                    </li>
                `;
            });
            html += '</ul>';
            activityDiv.innerHTML = html;
        } else {
            activityDiv.innerHTML = '<div class="loading">No recent activity</div>';
        }
    } catch (error) {
        activityDiv.innerHTML = '<div class="loading">Failed to load activity</div>';
    }
}

// ============ PRODUCTS FUNCTIONS ============
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            products = await response.json();
            displayProducts();
        } else {
            window.showMessage('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        window.showMessage('Network error', 'error');
    }
}

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
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                <p><strong>Price:</strong> ₹${product.price || 'N/A'}</p>
                <p><small>Category: ${product.category || 'N/A'}</small></p>
                <div class="product-actions">
                    <button class="btn btn-info" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    productsDiv.innerHTML = html;
}

function editProduct(productId) {
    currentProductId = productId;
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Fill form
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productSpecs').value = product.specs || '';
        
        // Load images
        if (product.images && product.images.length > 0) {
            productImages = [...product.images];
            displayProductImages();
        }
        
        // Go to add product tab
        showTab('addProduct');
        
        // Change form title
        document.querySelector('#addProduct h3').textContent = 'Edit Product';
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.showMessage('Product deleted successfully', 'success');
            loadProducts();
        } else {
            window.showMessage('Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        window.showMessage('Network error', 'error');
    }
}

// ============ ADD/EDIT PRODUCT FUNCTIONS ============
async function saveProduct() {
    const productData = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        specs: document.getElementById('productSpecs').value,
        images: productImages
    };
    
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
            productData.id = currentProductId;
        }
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
            credentials: 'include'
        });
        
        if (response.ok) {
            window.showMessage(currentProductId ? 'Product updated' : 'Product added', 'success');
            resetProductForm();
            loadProducts();
            showTab('products');
        } else {
            const error = await response.json();
            window.showMessage(error.error || 'Failed to save product', 'error');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        window.showMessage('Network error', 'error');
    }
}

function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productSpecs').value = '';
    
    productImages = [];
    currentProductId = null;
    
    document.querySelector('#addProduct h3').textContent = 'Add New Product';
    
    // Clear image preview
    const imagesGrid = document.getElementById('productImagesPreview');
    if (imagesGrid) {
        imagesGrid.innerHTML = '';
    }
}

// ============ IMAGE UPLOAD FUNCTIONS ============
function triggerFileUpload() {
    document.getElementById('imageUpload').click();
}

async function handleImageUpload(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    for (let file of files) {
        await uploadImage(file);
    }
}

async function uploadImage(file) {
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
                window.showMessage('Image uploaded', 'success');
            } else {
                window.showMessage('Failed to upload image', 'error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            window.showMessage('Network error', 'error');
        }
    };
    
    reader.readAsDataURL(file);
}

function addImagePreview(url, isPrimary = false) {
    const grid = document.getElementById('productImagesPreview');
    if (!grid) return;
    
    const div = document.createElement('div');
    div.className = 'image-preview-item';
    div.innerHTML = `
        <img src="${url}" alt="Product image">
        ${isPrimary ? '<span class="primary-badge">Primary</span>' : ''}
        <button class="btn btn-danger" style="position:absolute; top:5px; right:5px; padding:2px 6px;" onclick="removeImage('${url}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    grid.appendChild(div);
}

function removeImage(url) {
    productImages = productImages.filter(img => img !== url);
    displayProductImages();
}

function displayProductImages() {
    const grid = document.getElementById('productImagesPreview');
    if (!grid) return;
    
    grid.innerHTML = '';
    productImages.forEach((url, index) => {
        addImagePreview(url, index === 0);
    });
}

// ============ COMPANY DETAILS FUNCTIONS ============
async function loadCompanyDetails() {
    try {
        const response = await fetch(`${API_BASE}/api/company`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const company = await response.json();
            displayCompanyDetails(company);
        }
    } catch (error) {
        console.error('Error loading company:', error);
    }
}

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
            <div class="detail-item">
                <label>${field.label}:</label>
                <input type="text" value="${company[field.key] || ''}" 
                       id="company_${field.key}" class="form-input">
            </div>
        `;
    });
    
    html += `
        <button class="btn btn-success" onclick="saveCompanyDetails()">
            <i class="fas fa-save"></i> Save Changes
        </button>
    </div>`;
    
    detailsDiv.innerHTML = html;
}

async function saveCompanyDetails() {
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
            window.showMessage('Company details saved', 'success');
        } else {
            window.showMessage('Failed to save company details', 'error');
        }
    } catch (error) {
        console.error('Error saving company:', error);
        window.showMessage('Network error', 'error');
    }
}

// ============ GITHUB SYNC FUNCTIONS ============
async function syncProductsToGitHub() {
    const progressBar = document.getElementById('productSyncProgress');
    const progressFill = document.getElementById('productSyncFill');
    
    progressBar.classList.add('active');
    progressFill.style.width = '0%';
    
    try {
        const response = await fetch(`${API_BASE}/api/sync/products`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            progressFill.style.width = '100%';
            setTimeout(() => {
                progressBar.classList.remove('active');
                window.showMessage('Products synced successfully', 'success');
            }, 1000);
        } else {
            window.showMessage('Failed to sync products', 'error');
            progressBar.classList.remove('active');
        }
    } catch (error) {
        console.error('Error syncing products:', error);
        window.showMessage('Network error', 'error');
        progressBar.classList.remove('active');
    }
}

async function syncCompanyToGitHub() {
    const progressBar = document.getElementById('companySyncProgress');
    const progressFill = document.getElementById('companySyncFill');
    
    progressBar.classList.add('active');
    progressFill.style.width = '0%';
    
    try {
        const response = await fetch(`${API_BASE}/api/sync/company`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            progressFill.style.width = '100%';
            setTimeout(() => {
                progressBar.classList.remove('active');
                window.showMessage('Company details synced', 'success');
            }, 1000);
        } else {
            window.showMessage('Failed to sync company', 'error');
            progressBar.classList.remove('active');
        }
    } catch (error) {
        console.error('Error syncing company:', error);
        window.showMessage('Network error', 'error');
        progressBar.classList.remove('active');
    }
}

function fetchProductsFromGitHub() {
    window.showMessage('Fetching products from GitHub...', 'success');
    // Implement GitHub fetch logic
}

function fetchCompanyFromGitHub() {
    window.showMessage('Fetching company from GitHub...', 'success');
    // Implement GitHub fetch logic
}

// ============ CAMERA FUNCTIONS ============
let cameraStream = null;
let currentCamera = 'environment';

function openCamera() {
    document.getElementById('cameraModal').classList.add('active');
    startCamera();
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('cameraModal').classList.remove('active');
}

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

function switchCamera() {
    currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        startCamera();
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        await uploadImage(file);
        closeCamera();
    }, 'image/jpeg');
}

// ============ EXPORT FUNCTIONS TO WINDOW ============
window.showTab = showTab;
window.loadDashboardData = loadDashboardData;
window.loadProducts = loadProducts;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveProduct = saveProduct;
window.resetProductForm = resetProductForm;
window.triggerFileUpload = triggerFileUpload;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;
window.saveCompanyDetails = saveCompanyDetails;
window.syncProductsToGitHub = syncProductsToGitHub;
window.syncCompanyToGitHub = syncCompanyToGitHub;
window.fetchProductsFromGitHub = fetchProductsFromGitHub;
window.fetchCompanyFromGitHub = fetchCompanyFromGitHub;
window.openCamera = openCamera;
window.closeCamera = closeCamera;
window.switchCamera = switchCamera;
window.capturePhoto = capturePhoto;
