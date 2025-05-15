document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
});

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

function updateProductTableV2(products) {
    const tbody = document.querySelector('.products-table tbody');  // tbody elem of class = "products-table"
    tbody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');   // Creating a <tr>
        row.innerHTML = `
            <td>${product?.id}</td>
            <td>${product?.name}</td>
            <td>${product?.price}</td>
            <td>N/A</td>
            <td>
                <button class = "edit-product' data-id = "${product?.id}">Edit</button>
                <button class = "delete-product' data-id = "${product?.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateProductTable(products) {
    const tbody = document.querySelector('.products-table tbody');
    tbody.innerHTML = '';

    products.forEach(product => {
        // Main product row
        const productRow = document.createElement('tr');
        productRow.className = 'product-row';
        productRow.innerHTML = `
            <td>${product.id}</td
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
            const expiryDate = inventory.expiry ? new Date(inventory.expiry).toLocaleDateString() : 'N/A';
            inventoryRow.innerHTML = `
                <td colspan="2" style="padding-left: 30px;">
                    <strong>Inventory ID:</strong> ${inventory.id}
                </td>
                <td>
                    <strong>Stock:</strong> ${inventory.stock}
                </td>
                <td>
                    <strong>Expiry:</strong> ${expiryDate}
                </td>
                <td>
                    <button class="edit-inventory" data-id="${inventory.id}">Edit</button>
                    <button class="delete-inventory" data-id="${inventory.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(inventoryRow);
        });
    });

    // Event listener for toggle buttons
    document.querySelectorAll('.toggle-inventory').forEach(button => {
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