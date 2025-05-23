document.addEventListener('DOMContentLoaded', function() {
    console.log('= dom contents loaded =');
    fetchHistories();

    const tbody = document.querySelector('.history-table tbody');
    tbody.addEventListener('click', function(e) {
        if (e.target.classList.contains('history-details-btn')) {
            const historyId = e.target.getAttribute('data-id');
            fetchHistoryDetails(historyId);
        } else if (e.target.classList.contains('history-download-btn')){
            const historyId = e.target.getAttribute('data-id');
            downloadBill(historyId);
        }
    })
});

async function fetchHistories() {
    try {
        const response = await fetch('/api/transaction-history', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json();
        console.log('== fetchHistories() data ==\n', data);
        if (data.success) {
            updateHistoryTable(data.payments);
        }
    } catch (e) {
        console.log(e);
    }
}

async function updateHistoryTable(items) {
    const tbody = document.querySelector('.history-table tbody');
    tbody.innerHTML = '';

    items.forEach(item => {
        const itemRow = document.createElement('tr');
        itemRow.className = 'history-row';
        itemRow.innerHTML = `
            <td>${item?.order_id}</td>
            <td>${item?.amount}</td>
            <td>${item?.status}</td>
            <td>
                <button class = "history-details-btn btn" data-id = "${item?.id}"> View Details </button>
            </td>
        `;
        //      <button class = "history-download-btn" data-id = "${item?.id}"> Download Bill </button>
        //  </td>
        // `;
        tbody.append(itemRow);
    });
}

async function fetchHistoryDetails(historyId) {
    window.location.href = `/history/${historyId}`;
    // try {
    //     const response = await fetch(`/api/transaction/${historyId}`, {
    //         method: 'GET',
    //         credentials: 'include',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //     const data = await response.json();
    //     if (data.success) {
    //         updateHistoryDetailsTable(historyId, data);
    //     }
    // } catch (e) {
    //     console.log(e);
    // }
}

// async function updateHistoryDetailsTable(historyId, data) {
//     res.render('pages/history-detail.handlebars', {
//         layout: 'main.handlebars',
//         history_id: historyId,
//         data: data
//     });
// }

async function downloadBill(historyId) {
    //
}