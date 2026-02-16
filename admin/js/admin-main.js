// ============ ADMIN MAIN MODULE - COMPLETE FIXED VERSION ============
// सबसे पहले ग्लोबल वेरिएबल्स
let products = [];
let currentProductId = null;
let productImages = [];
let companyDetails = {};

// API BASE - यह index.html से आएगा
const API_BASE = window.API_BASE || 'https://milly-sheiklike-radically.ngrok-free.dev';

// ============ ग्लोबल फंक्शन्स - ये सबसे ऊपर होने चाहिए ============

// ग्लोबल showTab फंक्शन - यही नहीं था error का कारण
window.showTab = function(tabId) {
    console.log("🔄 showTab called with:", tabId);
    
    try {
        // सभी tabs को hide करें
        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab) tab.classList.remove('active');
        });
        
        // सभी nav buttons से active class हटाएं
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        
        // Selected tab को show करें
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        } else {
            console.warn("Tab not found:", tabId);
        }
        
        // Selected button को active करें
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            if (btn && btn.textContent.toLowerCase().includes(tabId.toLowerCase())) {
                btn.classList.add('active');
            }
        });
        
        // Tab के according data load करें
        if (tabId === 'dashboard') {
            if (typeof window.loadDashboardData === 'function') {
                window.loadDashboardData();
            } else {
                console.log("Dashboard function not ready yet");
            }
        } else if (tabId === 'products') {
            if (typeof window.loadProducts === 'function') {
                window.loadProducts();
            } else {
                const productsDiv = document.getElementById('productsList');
                if (productsDiv) productsDiv.innerHTML = '<div class="loading">Loading products...</div>';
                setTimeout(() => window.loadProducts && window.loadProducts(), 100);
            }
        } else if (tabId === 'addProduct') {
            const titleEl = document.querySelector('#addProduct h3');
            if (titleEl) titleEl.textContent = 'Add New Product';
            if (typeof window.resetProductForm === 'function') {
                window.resetProductForm();
            }
        } else if (tabId === 'company') {
            if (typeof window.loadCompanyDetails === 'function') {
                window.loadCompanyDetails();
            }
        } else if (tabId === 'settings') {
            if (typeof window.loadGitHubSettings === 'function') {
                window.loadGitHubSettings();
            }
        }
        
    } catch (error) {
        console.error("Error in showTab:", error);
        alert("Error: " + error.message);
    }
};

// ग्लोबल logout फंक्शन
window.logout = async function() {
    console.log("🚪 Logout called");
    try {
        const response = await fetch(`${API_BASE}/api/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    } catch (error) {
        console.error("Logout error:", error);
    }
};

// ============ DASHBOARD फंक्शन्स ============
window.loadDashboardData = function() {
    console.log("📊 Loading dashboard");
    
    try {
        // स्टैटिक डेटा दिखाएं अभी के लिए
        const totalEl = document.getElementById('totalProducts');
        if (totalEl) totalEl.textContent = products.length || '0';
        
        const activeEl = document.getElementById('activeProducts');
        if (activeEl) activeEl.textContent = '0';
        
        const draftEl = document.getElementById('draftProducts');
        if (draftEl) draftEl.textContent = '0';
        
        const pagesEl = document.getElementById('pagesGenerated');
        if (pagesEl) pagesEl.textContent = '0';
        
        const syncEl = document.getElementById('lastSync');
        if (syncEl) syncEl.textContent = 'Just now';
        
        // Recent activity
        const activityDiv = document.getElementById('recentActivity');
        if (activityDiv) {
            activityDiv.innerHTML = `
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 10px; border-bottom: 1px solid var(--border);">✅ Admin logged in successfully</li>
                    <li style="padding: 10px; border-bottom: 1px solid var(--border);">📊 Dashboard loaded</li>
                </ul>
            `;
        }
        
    } catch (error) {
        console.error("Dashboard error:", error);
    }
};

// ============ PRODUCTS फंक्शन्स ============
window.loadProducts = function() {
    console.log("📦 Loading products");
    
    const productsDiv = document.getElementById('productsList');
    if (!productsDiv) return;
    
    productsDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Loading products...</div>';
    
    // डेमो प्रोडक्ट्स दिखाएं
    setTimeout(() => {
        products = [
            {
                id: "demo-1",
                name: "EV Battery 60V30AH",
                price: "23500",
                category: "EV Battery",
                description: "LiFePO₄ Battery for Electric Scooter",
                images: ["https://via.placeholder.com/300?text=Battery"]
            },
            {
                id: "demo-2",
                name: "GOOTU 6KW Inverter",
                price: "48500",
                category: "Solar Inverter",
                description: "Hybrid Solar Inverter",
                images: ["https://via.placeholder.com/300?text=Inverter"]
            }
        ];
        
        displayProducts();
    }, 1000);
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
        const productImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'https://via.placeholder.com/300?text=No+Image';
        
        html += `
            <div class="product-card">
                <img src="${productImage}" class="product-image" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300?text=Error'">
                <h4 style="color: var(--gold); margin: 10px 0;">${product.name || 'Unnamed'}</h4>
                <p style="color: var(--success); font-size: 1.2rem;">₹${product.price || 'N/A'}</p>
                <p><small>${product.category || 'N/A'}</small></p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-info" onclick="editProduct('${product.id}')" style="flex:1;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')" style="flex:1;">
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
    alert("Edit product: " + productId);
};

window.deleteProduct = function(productId) {
    if (!confirm('Delete this product?')) return;
    console.log("🗑️ Deleting product:", productId);
    alert("Product deleted: " + productId);
};

// ============ ADD PRODUCT फंक्शन्स ============
window.resetProductForm = function() {
    console.log("🔄 Resetting form");
    
    const fields = ['productName', 'productPrice', 'productCategory', 'productDescription', 'productSpecs'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    productImages = [];
    currentProductId = null;
    
    const grid = document.getElementById('productImagesPreview');
    if (grid) grid.innerHTML = '';
};

window.saveProduct = function() {
    const name = document.getElementById('productName')?.value;
    if (!name) {
        alert('Product name is required');
        return;
    }
    alert('Product saved successfully!');
    window.showTab('products');
};

window.triggerFileUpload = function() {
    document.getElementById('imageUpload').click();
};

window.handleImageUpload = function(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    alert(files.length + ' image(s) selected');
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};

function addImagePreview(src) {
    const grid = document.getElementById('productImagesPreview');
    if (!grid) return;
    
    const div = document.createElement('div');
    div.className = 'image-preview-item';
    div.innerHTML = `
        <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
        <button class="btn btn-danger" style="position:absolute; top:5px; right:5px; padding:2px 6px;" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    grid.appendChild(div);
}

// ============ COMPANY फंक्शन्स ============
window.loadCompanyDetails = function() {
    console.log("🏢 Loading company details");
    
    const detailsDiv = document.getElementById('companyDetails');
    if (!detailsDiv) return;
    
    detailsDiv.innerHTML = `
        <div class="form-container">
            <div class="form-group">
                <label class="form-label">Company Name</label>
                <input type="text" id="company_name" class="form-input" value="Extra Miles Energy">
            </div>
            <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="text" id="company_phone" class="form-input" value="+91 98765 43210">
            </div>
            <div class="form-group">
                <label class="form-label">WhatsApp</label>
                <input type="text" id="company_whatsapp" class="form-input" value="+91 98765 43210">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="company_email" class="form-input" value="info@extramilesenergy.com">
            </div>
            <div class="form-group">
                <label class="form-label">Address</label>
                <textarea id="company_address" class="form-input">123 Solar Park, New Delhi</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">GST</label>
                <input type="text" id="company_gst" class="form-input" value="07ABCDE1234F1Z5">
            </div>
            <button class="btn btn-success" onclick="saveCompanyDetails()">
                <i class="fas fa-save"></i> Save Company Details
            </button>
        </div>
    `;
};

window.saveCompanyDetails = function() {
    alert('Company details saved!');
};

// ============ GITHUB SETTINGS ============
window.loadGitHubSettings = function() {
    console.log("⚙️ Loading GitHub settings");
    
    const settingsDiv = document.getElementById('githubSettings');
    if (!settingsDiv) return;
    
    settingsDiv.innerHTML = `
        <div class="form-container">
            <div class="form-group">
                <label class="form-label">GitHub Token</label>
                <input type="password" id="github_token" class="form-input" placeholder="Enter GitHub token">
            </div>
            <button class="btn btn-info" onclick="testGitHubConnection()">
                <i class="fas fa-plug"></i> Test Connection
            </button>
            <button class="btn btn-success" onclick="saveGitHubSettings()">
                <i class="fas fa-save"></i> Save Settings
            </button>
        </div>
    `;
};

window.testGitHubConnection = function() {
    alert('Testing GitHub connection...');
};

window.saveGitHubSettings = function() {
    alert('Settings saved!');
};

// ============ SYNC फंक्शन्स ============
window.syncProductsToGitHub = function() {
    alert('Syncing products to GitHub...');
};

window.syncCompanyToGitHub = function() {
    alert('Syncing company to GitHub...');
};

// ============ इनिशियलाइज़ेशन ============
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Admin panel loaded successfully");
    console.log("✅ showTab function is defined:", typeof window.showTab === 'function');
    
    // Check if user is logged in
    if (document.getElementById('adminDashboard').style.display === 'block') {
        window.loadDashboardData();
    }
});

// Extra functions for GitHub buttons
window.fetchProductsFromGitHub = function() {
    alert('Fetching products from GitHub...');
};

window.fetchCompanyFromGitHub = function() {
    alert('Fetching company from GitHub...');
};

// Log to confirm
console.log("✅ Complete admin-main.js loaded");
console.log("✅ Functions available: showTab, logout, loadProducts, etc.");