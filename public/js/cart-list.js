document.addEventListener('DOMContentLoaded', function() {
    console.log('== dom contents loaded ==');
    fetchCartItems();

    document.getElementById('.actions clear-cart').addEventListener('click', clearCart);
    document.getElementById('.actions cart-checkout').addEventListener('click', checkoutCart);

    // Cart-item Rows
    const tbody = document.querySelector('.carts-table tbody');
    tbody.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-cart-item')) {
            const cartItemId = e.target.getAttribute('data-id');
            deleteCartItem(cartItemId);
        } else if (e.target.classList.contains('edit-cart-item')) {
            const cartItemId = e.target.getAttribute('data-id');
            editCartItem(cartItemId);
        }
    });

    document.getElementById('edit-cart-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateItemList();
    });
    document.getElementById('cancel-edit-cart').addEventListener('click', function() {
        document.getElementById('edit-cart-form-container').style.display = 'none';
    });

});

// Listing = = = =
async function fetchCartItems() {
    try {
        const response = await fetch('/api/cart-item-list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            updateCartTable(data.items );
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateCartTable(items) {
    const tbody = document.querySelector('.carts-table tbody');
    tbody.innerHTML = '';

    items.forEach(item => {
        const itemRow = document.createElement('tr');
        itemRow.className = 'cart-item-row';
        itemRow.innerHTML = `
            <td>${item?.Product?.id}</td>
            <td>${item?.Product?.name}</td>
            <td>${item?.quantity}</td>
            <td>${item?.quantity * item?.Product?.price}</td>
            <td>
                <button class = "edit-cart-item" data-id = "${item?.id}"> Edit </button>
                <button class = "delete-cart-item" data-id = "${item?.id}"> Remove From Cart </button>
            </td>
        `;
        tbody.appendChild(itemRow);
    });
}