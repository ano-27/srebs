document.addEventListener('DOMContentLoaded', function() {
    console.log('== dom contents loaded ==');
    fetchCartItems();

    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('cart-checkout').addEventListener('click', checkoutCart);

    // Cart-item Rows
    const tbody = document.querySelector('.carts-table tbody');
    tbody.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-cart-item')) {
            const cartItemId = e.target.getAttribute('data-id');
            deleteCartItem(cartItemId);
        } else if (e.target.classList.contains('edit-cart-item')) {
            const cartItemId = e.target.getAttribute('data-id');
            openItemEditForm(cartItemId);
        }
    });

    document.getElementById('edit-cart-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const cartItemId = document.getElementById('edit_cart_item_id');
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
            updateCartTable(data.items);
        } else {
            console.log('API returned error: ', data.message);
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
                <button class = "edit-cart-item" data-id = "${item?.id}"> Edit Quantity</button>
                <button class = "delete-cart-item" data-id = "${item?.id}"> Remove From Cart </button>
            </td>
        `;
        tbody.appendChild(itemRow);
    });
}

// Delete cart item = = = =
async function deleteCartItem(cartItemId) {
    try {
        if (confirm('Remove selected item?')) {
            const response = await fetch(`/api/remove-from-cart/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                fetchCartItems();
            } else {
                alert('Failed to remove item from cart' + data.message);
            }
        }
    } catch(err) {
        console.log(err);
    }
}

// Edit cart item = = = =
async function openItemEditForm(cartItemId) {
    try {
        const response = await fetch(`/api/cart-item/${cartItemId}`, {
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            const item = data.item;

            // Populate the form
            document.getElementById('edit_cart_item_id').value = cartItemId;
            document.getElementById('edit_item_product_name').textContent = item?.Product?.name;
            document.getElementById('edit_cart_item_quantity').value = item?.quantity;

            // Show the form
            document.getElementById('edit-cart-form-container').style.display = 'block';
        } else {
            alert('Failed to fetch Cart Item details');
        }
    } catch (err) {
        console.log('Error fetching Cart Item Details', err);
        alert('An error occurred while fetching Cart Item details');
    }
}

async function updateItemList() {
    const cartItemId = document.getElementById('edit_cart_item_id').value;
    const quantity = document.getElementById('edit_cart_item_quantity').value;
    try {
        const response = await fetch(`/api/cart-item/${cartItemId}`, {
            method: 'PATCH',
            credentials: 'include',  // As api/cart-item uses authenticateToken MW, so we need auth stuff to be sent
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity: parseInt(quantity)
            })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('edit-cart-form-container').style.display = 'none';
            fetchCartItems();
        } else {
            alert(data.message || 'Failed to update cart item');
        }
    } catch (err) {
        console.log('Error updating cart item:', err);
        alert('An error occurred while updating cart item');
    }
}

// Clear Cart = = = =
async function clearCart() {
    if (confirm('Remove all items from Cart?')) {
        const response = await fetch(`/api/empty-cart`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json()
        if (data.success) {
            fetchCartItems();
        } else {
            alert(`Failed to empty cart: ${data.message}`);
        }
    }
}

// Checkout From Cart = = = =
async function checkoutCart() {
    const response = await fetch(`/api/cart-checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-type': 'application/json'
        }
    });
    const data = await response.json();
    if (response.ok) {
        window.location.href = `api/checkout?order_id=${data.id}`;
    }
}