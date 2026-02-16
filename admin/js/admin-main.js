// ============ ADMIN MAIN MODULE - Complete Functional ============
let products = [];
let currentProductId = null;
let productImages = [];
let companyDetails = {};

// ============ API BASE ============
const API_BASE = window.API_BASE || 'https://milly-sheiklike-radically.ngrok-free.dev';

// ============ TAB NAVIGATION ============
window.showTab = function(tabId) {
    console.log("🔄 Switching to tab:", tabId);
    
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active');
    
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(
        btn => btn.textContent.toLowerCase().includes(tabId.toLowerCase())
    );
    if (activeBtn) activeBtn.classList.add('active');
    
    // Load data based on tab
    if (tabId === 'dashboard') loadDashboardData();
    else if (tabId === 'products') loadProducts();
    else if (tabId === 'addProduct') {
        document.querySelector('#addProduct h3').textContent = 'Add New Product';
        resetProductForm();
    }
    else if (tabId === 'categories') loadCategories();
    else if (tabId === 'company') loadCompanyDetails();
    else if (tabId === 'settings') loadGitHubSettings();
};

// ============ DASHBOARD ============
window.loadDashboardData = async function() {
    console.log("📊 Loading dashboard");
    
    try {
        const response = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (response.ok) {
            products = await response.json();
            
            // Calculate stats
            const totalProducts = products.length;
            const evBatteries = products.filter(p => p.category === 'EV Battery').length;
            const eRickshawBatteries = products.filter(p => p.category === 'E-Rickshaw Battery').length;
            const homeBatteries = products.filter(p => p.category === 'Home Battery').length;
            const inverters = products.filter(p => p.category === 'Solar Inverter').length;
            
            document.getElementById('totalProducts').textContent = totalProducts;
            document.getElementById('evBatteries').textContent = evBatteries;
            document.getElementById('eRickshawBatteries').textContent = eRickshawBatteries;
            document.getElementById('homeBatteries').textContent = homeBatteries;
            document.getElementById('inverters').textContent = inverters;
            
            // Load company details for contact info
            await loadCompanyDetailsForDashboard();
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
};

async function loadCompanyDetailsForDashboard() {
    try {
        const response = await fetch(`${API_BASE}/api/company`, { credentials: 'include' });
        if (response.ok) {
            companyDetails = await response.json();
            document.getElementById('contactPhone').textContent = companyDetails.phone || 'Not set';
            document.getElementById('contactWhatsapp').textContent = companyDetails.whatsapp || 'Not set';
            document.getElementById('contactEmail').textContent = companyDetails.email || 'Not set';
            document.getElementById('contactAddress').textContent = companyDetails.address || 'Not set';
        }
    } catch (error) {
        console.error('Error loading company:', error);
    }
}

// ============ PRODUCTS MANAGEMENT ============
window.loadProducts = async function() {
    console.log("📦 Loading products");
    
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Loading products...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (response.ok) {
            products = await response.json();
            displayProductsByCategory();
        } else {
            productsDiv.innerHTML = '<div class="loading">Failed to load products</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsDiv.innerHTML = '<div class="loading">Network error</div>';
    }
};

function displayProductsByCategory() {
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv || !products.length) {
        productsDiv.innerHTML = '<div class="loading">No products found. Click "Add Product" to create one.</div>';
        return;
    }
    
    // Group by category
    const categories = {
        'EV Battery': [],
        'E-Rickshaw Battery': [],
        'Home Battery': [],
        'Solar Inverter': [],
        'Accessories': []
    };
    
    products.forEach(product => {
        const cat = product.category || 'Accessories';
        if (categories[cat]) categories[cat].push(product);
        else categories['Accessories'].push(product);
    });
    
    let html = '';
    
    for (let [category, items] of Object.entries(categories)) {
        if (items.length === 0) continue;
        
        html += `<h3 style="color: var(--gold); margin: 30px 0 15px 0; border-bottom: 2px solid var(--gold); padding-bottom: 5px;">
                    ${category} (${items.length})
                    <button class="btn btn-info" style="float: right;" onclick="addProductInCategory('${category}')">
                        <i class="fas fa-plus"></i> Add New
                    </button>
                </h3>`;
        html += '<div class="products-grid">';
        
        items.forEach(product => {
            const productImage = product.images?.length > 0 ? product.images[0] : 'https://via.placeholder.com/300?text=No+Image';
            
            html += `
                <div class="product-card">
                    <img src="${productImage}" class="product-image" alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/300?text=Error'">
                    <h4 style="color: var(--gold); margin: 10px 0;">${product.name || 'Unnamed'}</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${product.description?.substring(0, 60) || ''}...</p>
                    <p style="color: var(--success); font-size: 1.2rem; margin: 10px 0;">₹${product.price || 'N/A'}</p>
                    <p style="color: var(--text-muted);"><small>Model: ${product.model || 'N/A'}</small></p>
                    <div style="display: flex; gap: 5px; margin-top: 10px;">
                        <button class="btn btn-info" onclick="editProduct('${product.id}')" style="flex:1;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" style="flex:1;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <button class="btn btn-success" onclick="generateProductPage('${product.id}')" style="width:100%; margin-top:5px;">
                        <i class="fas fa-file"></i> Generate Page
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    productsDiv.innerHTML = html;
}

window.addProductInCategory = function(category) {
    document.getElementById('productCategory').value = category;
    showTab('addProduct');
};

// ============ ADD/EDIT PRODUCT ============
window.saveProduct = async function() {
    console.log("💾 Saving product");
    
    // Get all form values
    const productData = {
        name: document.getElementById('productName')?.value || '',
        price: document.getElementById('productPrice')?.value || '',
        category: document.getElementById('productCategory')?.value || '',
        description: document.getElementById('productDescription')?.value || '',
        specs: document.getElementById('productSpecs')?.value || '',
        voltage: document.getElementById('productVoltage')?.value || '',
        capacity: document.getElementById('productCapacity')?.value || '',
        model: document.getElementById('productModel')?.value || '',
        configuration: document.getElementById('productConfig')?.value || '',
        chemistry: document.getElementById('productChemistry')?.value || 'LiFePO₄',
        warranty: document.getElementById('productWarranty')?.value || '3 Year Warranty',
        features: document.getElementById('productFeatures')?.value?.split('\n').filter(f => f.trim()) || [],
        applications: document.getElementById('productApplications')?.value?.split(',').map(a => a.trim()) || [],
        weight: document.getElementById('productWeight')?.value || '',
        dimensions: document.getElementById('productDimensions')?.value || '',
        cycleLife: document.getElementById('productCycleLife')?.value || '',
        images: productImages,
        status: 'active',
        slug: generateSlug(document.getElementById('productName')?.value || '')
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
            const savedProduct = await response.json();
            window.showMessage(currentProductId ? 'Product updated' : 'Product added', 'success');
            
            // Auto-generate product page
            await generateProductPage(savedProduct.id || currentProductId);
            
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
};

function generateSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// ============ GENERATE PRODUCT PAGE ============
window.generateProductPage = async function(productId) {
    console.log("📄 Generating product page for:", productId);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        window.showMessage('Product not found', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/generate-product-page`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product }),
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            window.showMessage(`Product page generated: ${data.url}`, 'success');
            
            // Open the product page in new tab
            window.open(data.url, '_blank');
        } else {
            window.showMessage('Failed to generate product page', 'error');
        }
    } catch (error) {
        console.error('Error generating page:', error);
        window.showMessage('Network error', 'error');
    }
};

// ============ EDIT PRODUCT ============
window.editProduct = function(productId) {
    console.log("✏️ Editing product:", productId);
    
    currentProductId = productId;
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Fill all form fields
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productSpecs').value = product.specs || '';
        document.getElementById('productVoltage').value = product.voltage || '';
        document.getElementById('productCapacity').value = product.capacity || '';
        document.getElementById('productModel').value = product.model || '';
        document.getElementById('productConfig').value = product.configuration || '';
        document.getElementById('productChemistry').value = product.chemistry || 'LiFePO₄';
        document.getElementById('productWarranty').value = product.warranty || '3 Year Warranty';
        document.getElementById('productFeatures').value = product.features?.join('\n') || '';
        document.getElementById('productApplications').value = product.applications?.join(', ') || '';
        document.getElementById('productWeight').value = product.weight || '';
        document.getElementById('productDimensions').value = product.dimensions || '';
        document.getElementById('productCycleLife').value = product.cycleLife || '';
        
        // Load images
        if (product.images && product.images.length > 0) {
            productImages = [...product.images];
            displayProductImages();
        } else {
            productImages = [];
            const grid = document.getElementById('productImagesPreview');
            if (grid) grid.innerHTML = '';
        }
        
        showTab('addProduct');
        document.querySelector('#addProduct h3').textContent = 'Edit Product';
        window.showMessage('Product loaded for editing', 'success');
    }
};

// ============ DELETE PRODUCT ============
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

// ============ RESET FORM ============
window.resetProductForm = function() {
    console.log("🔄 Resetting form");
    
    const fields = [
        'productName', 'productPrice', 'productCategory', 'productDescription',
        'productSpecs', 'productVoltage', 'productCapacity', 'productModel',
        'productConfig', 'productChemistry', 'productWarranty', 'productFeatures',
        'productApplications', 'productWeight', 'productDimensions', 'productCycleLife'
    ];
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Set defaults
    const chemEl = document.getElementById('productChemistry');
    if (chemEl) chemEl.value = 'LiFePO₄';
    
    const warrantyEl = document.getElementById('productWarranty');
    if (warrantyEl) warrantyEl.value = '3 Year Warranty';
    
    productImages = [];
    currentProductId = null;
    
    const titleElement = document.querySelector('#addProduct h3');
    if (titleElement) titleElement.textContent = 'Add New Product';
    
    const grid = document.getElementById('productImagesPreview');
    if (grid) grid.innerHTML = '';
};

// ============ IMAGE UPLOAD ============
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
                    reject('Upload failed');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                reject(error);
            }
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

// ============ COMPANY DETAILS MANAGEMENT ============
window.loadCompanyDetails = async function() {
    console.log("🏢 Loading company details");
    
    try {
        const response = await fetch(`${API_BASE}/api/company`, { credentials: 'include' });
        if (response.ok) {
            companyDetails = await response.json();
            displayCompanyForm();
        } else {
            // Default values
            companyDetails = {
                name: 'Extra Miles Energy',
                address: '',
                phone: '',
                whatsapp: '',
                email: '',
                gst: '',
                website: '',
                timings: '9:00 AM - 7:00 PM'
            };
            displayCompanyForm();
        }
    } catch (error) {
        console.error('Error loading company:', error);
    }
};

function displayCompanyForm() {
    const formDiv = document.getElementById('companyDetailsForm');
    if (!formDiv) return;
    
    formDiv.innerHTML = `
        <div class="form-container">
            <h3 style="color: var(--gold);">Company Information</h3>
            
            <div class="form-group">
                <label class="form-label">Company Name</label>
                <input type="text" id="company_name" class="form-input" value="${companyDetails.name || ''}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Address</label>
                <textarea id="company_address" class="form-input" rows="3">${companyDetails.address || ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="text" id="company_phone" class="form-input" value="${companyDetails.phone || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">WhatsApp Number</label>
                    <input type="text" id="company_whatsapp" class="form-input" value="${companyDetails.whatsapp || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="company_email" class="form-input" value="${companyDetails.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">GST Number</label>
                    <input type="text" id="company_gst" class="form-input" value="${companyDetails.gst || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Website</label>
                    <input type="text" id="company_website" class="form-input" value="${companyDetails.website || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Business Hours</label>
                    <input type="text" id="company_timings" class="form-input" value="${companyDetails.timings || '9:00 AM - 7:00 PM'}">
                </div>
            </div>
            
            <div class="form-actions">
                <button class="btn btn-success" onclick="saveCompanyDetails()">
                    <i class="fas fa-save"></i> Save Company Details
                </button>
                <button class="btn btn-info" onclick="syncCompanyToGitHub()">
                    <i class="fab fa-github"></i> Sync to GitHub
                </button>
            </div>
            
            <div id="companySyncStatus" style="margin-top: 20px;"></div>
        </div>
    `;
}

window.saveCompanyDetails = async function() {
    console.log("💾 Saving company details");
    
    const companyData = {
        name: document.getElementById('company_name')?.value || '',
        address: document.getElementById('company_address')?.value || '',
        phone: document.getElementById('company_phone')?.value || '',
        whatsapp: document.getElementById('company_whatsapp')?.value || '',
        email: document.getElementById('company_email')?.value || '',
        gst: document.getElementById('company_gst')?.value || '',
        website: document.getElementById('company_website')?.value || '',
        timings: document.getElementById('company_timings')?.value || '9:00 AM - 7:00 PM'
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/company`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData),
            credentials: 'include'
        });
        
        if (response.ok) {
            companyDetails = companyData;
            window.showMessage('Company details saved successfully', 'success');
            
            // Update dashboard contact info
            document.getElementById('contactPhone').textContent = companyData.phone || 'Not set';
            document.getElementById('contactWhatsapp').textContent = companyData.whatsapp || 'Not set';
            document.getElementById('contactEmail').textContent = companyData.email || 'Not set';
            document.getElementById('contactAddress').textContent = companyData.address || 'Not set';
        } else {
            window.showMessage('Failed to save company details', 'error');
        }
    } catch (error) {
        console.error('Error saving company:', error);
        window.showMessage('Network error', 'error');
    }
};

// ============ CATEGORIES MANAGEMENT ============
async function loadCategories() {
    console.log("📂 Loading categories");
    
    const categoriesDiv = document.getElementById('categoriesList');
    if (!categoriesDiv) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
        if (response.ok) {
            products = await response.json();
            
            // Count products per category
            const categoryCount = {};
            products.forEach(p => {
                const cat = p.category || 'Uncategorized';
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            });
            
            let html = '<div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">';
            
            const categories = [
                { name: 'EV Battery', icon: '🔋', desc: 'Electric Scooter & Motorcycle Batteries' },
                { name: 'E-Rickshaw Battery', icon: '🛺', desc: 'Batteries for E-Rickshaws' },
                { name: 'Home Battery', icon: '🏠', desc: 'Home Backup & Solar Storage' },
                { name: 'Solar Inverter', icon: '☀️', desc: 'Hybrid Solar Inverters' },
                { name: 'Accessories', icon: '🔧', desc: 'BMS, Chargers & Accessories' }
            ];
            
            categories.forEach(cat => {
                const count = categoryCount[cat.name] || 0;
                html += `
                    <div class="category-card" style="background: rgba(255,215,0,0.1); border: 2px solid var(--gold); border-radius: var(--radius); padding: 20px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">${cat.icon}</div>
                        <h4 style="color: var(--gold);">${cat.name}</h4>
                        <p style="color: var(--text-muted);">${cat.desc}</p>
                        <p style="color: var(--success); font-size: 1.2rem;">${count} Products</p>
                        <button class="btn btn-info" onclick="addProductInCategory('${cat.name}')" style="margin-top: 10px;">
                            <i class="fas fa-plus"></i> Add Product
                        </button>
                    </div>
                `;
            });
            
            html += '</div>';
            categoriesDiv.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ============ GITHUB SYNC ============
window.syncCompanyToGitHub = async function() {
    console.log("🔄 Syncing company to GitHub");
    
    const statusDiv = document.getElementById('companySyncStatus');
    statusDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Syncing...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/sync/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyDetails),
            credentials: 'include'
        });
        
        if (response.ok) {
            statusDiv.innerHTML = '<div class="message success" style="display: block;">✅ Company details synced to GitHub successfully!</div>';
            setTimeout(() => statusDiv.innerHTML = '', 3000);
        } else {
            statusDiv.innerHTML = '<div class="message error" style="display: block;">❌ Failed to sync</div>';
        }
    } catch (error) {
        statusDiv.innerHTML = '<div class="message error" style="display: block;">❌ Network error</div>';
    }
};

// ============ GITHUB SETTINGS ============
window.loadGitHubSettings = function() {
    console.log("⚙️ Loading GitHub settings");
    
    const saved = localStorage.getItem('github_settings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            document.getElementById('settings_github_username').value = settings.username || 'ExtraMilesEnergy';
            document.getElementById('settings_github_repo').value = settings.repo || 'extramilesenergy.in';
            document.getElementById('settings_github_branch').value = settings.branch || 'main';
            document.getElementById('settings_products_path').value = settings.productsPath || 'content/products/all-products.json';
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    
    const token = sessionStorage.getItem('github_token');
    if (token) {
        document.getElementById('settings_github_token').value = token;
    }
};

window.saveGitHubSettings = function() {
    const settings = {
        username: document.getElementById('settings_github_username')?.value || 'ExtraMilesEnergy',
        repo: document.getElementById('settings_github_repo')?.value || 'extramilesenergy.in',
        branch: document.getElementById('settings_github_branch')?.value || 'main',
        productsPath: document.getElementById('settings_products_path')?.value || 'content/products/all-products.json'
    };
    
    localStorage.setItem('github_settings', JSON.stringify(settings));
    
    const token = document.getElementById('settings_github_token')?.value;
    if (token) {
        sessionStorage.setItem('github_token', token);
    }
    
    window.showMessage('GitHub settings saved', 'success');
};

window.testGitHubConnection = async function() {
    const token = document.getElementById('settings_github_token')?.value;
    if (!token) {
        window.showMessage('Please enter GitHub token', 'error');
        return;
    }
    
    window.showMessage('Testing connection...', 'info');
    
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (response.ok) {
            window.showMessage('✅ GitHub connection successful!', 'success');
        } else {
            window.showMessage('❌ Invalid token or connection failed', 'error');
        }
    } catch (error) {
        window.showMessage('❌ Network error', 'error');
    }
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Admin panel loaded");
    
    // Check if user is logged in
    if (document.getElementById('adminDashboard').style.display === 'block') {
        loadDashboardData();
    }
});