document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    document.getElementById('product-form').addEventListener('submit', handleProductFormSubmit);
    document.getElementById('cancel-form').addEventListener('click', hideProductForm);

    document.getElementById('new-batch-form').addEventListener('submit', handleNewBatchFormSubmit);
    document.getElementById('cancel-batch-form').addEventListener('click', hideNewBatchForm);
});

// Listing = = = =
function fetchProducts() {
    fetch('/api/product-list', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateProductTable(data.products);
        }
    })
    .catch(err => console.error('Error fetching products:', err));
};

function updateProductTable(products) {
    // Get element tbody of class products-table
    const tbody = document.querySelector('.products-table tbody');  
    tbody.innerHTML = '';

    products.forEach(product => {
        // Main product row
        const productRow = document.createElement('tr');
        productRow.className = 'product-row';
        productRow.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>
                <button class = "toggle-inventory" data-id = "${product.id}">
                    Show Inventory (${product.Inventories.length})
                </button>
            </td>
            <td>
                <button class = "edit-product" data-id = "${product.id}"> Edit </button>
                <button class = "delete-product" data-id = "${product.id}"> Delete </button>
                <button class = "new-batch" data-id = "${product.id}"> New Batch </button>
            </td>
        `;
        tbody.appendChild(productRow);

        // Inventory rows
        product.Inventories.forEach(inventory => {
            const inventoryRow = document.createElement('tr');
            inventoryRow.className = `inventory-row inventory-for-${product.id}`;
            inventoryRow.style.display = 'none';
            inventoryRow.style.border = 0;
            const expiryDate = inventory.expiry ? new Date(inventory.expiry).toLocaleDateString() : 'N/A';
            inventoryRow.innerHTML = `
                <td colspan="2" style="padding-left: 30px;">
                </td>
                <td>
                    
                </td>
                <td>
                    <strong>Stock:</strong> ${inventory.stock} <strong>Expiry:</strong> ${expiryDate}
                </td>
                <td>
                    <button class="edit-inventory" data-id="${inventory.id}">Edit Stock</button>
                    <button class="delete-inventory" data-id="${inventory.id}">Delete Stock</button>
                </td>
            `;
            tbody.appendChild(inventoryRow);
        });
    });

    // Event listener for toggle buttons
    document.querySelectorAll('.toggle-inventory').forEach(button => {
        // When button is clicked
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const inventoryRows = document.querySelectorAll(`.inventory-for-${productId}`);
            inventoryRows.forEach(row => {
                if (row.style.display === 'none') {
                    row.style.display = 'table-row';
                    this.textContent = `Hide Inventory (${inventoryRows.length})`;
                } else {
                    row.style.display = 'none';
                    this.textContent = `Show Inventory (${inventoryRows.length})`;
                }
            });
        });
    });
}

// Edit Product = = = =
function hideProductForm() {
    document.getElementById('product-form-container').style.display = 'none';
}

function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product_id').value;
    const formData = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        product_type: document.getElementById('product_type').value,
        return_window: parseInt(document.getElementById('return_window').value) || undefined
    };

    // Remove unfilled values
    Object.keys(formData).forEach(key => {
        if (formData[key] === undefined) delete formData[key];
    });

    fetch(`/api/product/${productId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hideProductForm();
            fetchProducts(); // Refresh the product list
        } else {
            alert('Failed to update product: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating product:', error);
    });
}

function editProduct(productId) {
    fetch(`/api/product/${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Populate form with product data
            document.getElementById('product_id').value = data.product.id;
            document.getElementById('name').value = data.product.name;
            document.getElementById('price').value = data.product.price;
            document.getElementById('product_type').value = data.product.product_type;
            document.getElementById('return_window').value = data.product.return_window;

            // Show form
            document.getElementById('product-form-container').style.display = 'block';
        }
    })
    .catch(err => console.error('Error fetching product dtails: ', err));
}

// Delete Product = = = =
function deleteProduct(productId) {
    if (confirm('Proceed with deletion?')) {
        fetch(`/api/product/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchProducts();
            } else {
                alert('Failed to delete product: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
        });
    }
}

// New Batch = = = =
function hideNewBatchForm(){
    document.getElementById('new-batch-form-container').style.display = 'none';
}

function showNewBatchForm(productId) {
    fetch(`/api/product/${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('batch_product_id').value = data?.product?.id;
            document.getElementById('batch_product_name').textContent = data?.product?.name;
            document.getElementById('new-batch-form-container').style.display = 'block';
        }
    })
    .catch(err => console.error('Error fetching product details: ', err));
}

function handleNewBatchFormSubmit(e) {
    e.preventDefault();
    const formData = {
        product_id: parseInt(document.getElementById('batch_product_id').value),
        stock: parseInt(document.getElementById('batch_stock').value),
        expiry: document.getElementById('batch_expiry').value || undefined
    };

    fetch('/api/product-batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hideNewBatchForm();
            fetchProducts();
        } else {
            alert('Failed to add new batch' + data.message);
        }
    })
    .catch(err => {
        console.error('Error adding new batch:', err);
    });
}

// Event delegations = = = =
document.querySelector('.products-table tbody').addEventListener('click', function(e) {      // e - - > event object (holds info about the click)
    if (e.target.classList.contains('edit-product')) {  // Check if the clicked element has class - - > edit-product , inside products-table 
        const productId = e.target.getAttribute('data-id');  
        editProduct(productId); // To show form with current values
    } else if (e.target.classList.contains('delete-product')) {
        const productId = e.target.getAttribute('data-id');
        deleteProduct(productId);
    } else if (e.target.classList.contains('new-batch')) {
        const productId = e.target.getAttribute('data-id');
        showNewBatchForm(productId);
    }
});