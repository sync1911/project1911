((function() {
    const myuniquefbAppId = '968542564276719';

    window.fbAsyncInit = function () {
        FB.init({
            appId: myuniquefbAppId,
            cookie: true,
            xfbml: true,
            version: 'v16.0',
        });
    };

    window.promptLogin = function() {
        FB.login(function (response) {
            if (response.authResponse) {
                // Redirect to the dashboard page
                window.location.href = 'dashboard.html';
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'email,ads_read' });
    };

    function fetchAdAccounts() {
        return new Promise((resolve, reject) => {
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    const accessToken = response.authResponse.accessToken;
                    FB.api('/me', { fields: 'id,name,email', access_token: accessToken }, function (userInfo) {
                        if (userInfo && !userInfo.error) {
                            console.log('User email:', userInfo.email);
                        } else {
                            console.error('Error fetching user email:', userInfo.error);
                        }
                    });

                    FB.api('/me/adaccounts', { fields: 'id,name', access_token: accessToken }, function (response) {
                        if (response && !response.error) {
                            const adAccountSelect = document.getElementById('adAccountSelect');
                            response.data.forEach(account => {
                                const option = document.createElement('option');
                                option.value = account.id;
                                option.textContent = account.name;
                                adAccountSelect.appendChild(option);
                            });

                            // Use jQuery to create and show the modal
                            jQuery('#adAccountModal').modal('show');

                            // Add an event listener for when the user selects an ad account
                            adAccountSelect.addEventListener('change', function () {
                                const selectedAdAccountId = adAccountSelect.value;
                                if (selectedAdAccountId) {
                                    updatePages(selectedAdAccountId, accessToken, false);
                                }
                            });

                            resolve();
                        } else {
                            console.error('Error fetching ad accounts:', response.error);
                            reject(response.error);
                        }
                    });
                } else {
                    console.error('User is not logged in or the access token is not available.');
                    reject(new Error('User is not logged in or the access token is not available.'));
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Call initAudit when the audit page is loaded
        if (window.location.pathname === '/audit.html' || window.location.pathname.endsWith('/audit.html')) {
            initAudit();
        }
        // Call initDashboard when the dashboard page is loaded
        if (window.location.pathname === '/dashboard.html' || window.location.pathname.endsWith('/dashboard.html')) {
            initDashboard();
        }
    });

    function fetchMetrics(adAccountId, accessToken, date_preset) {
        return new Promise(async (resolve, reject) => {
            // Define the fields and parameters for the Facebook API request
            const fields = 'actions,clicks,outbound_clicks,impressions,spend';
            const params = {
                'level': 'ad',
                'date_preset': date_preset,
                'fields': fields,
                'access_token': accessToken
            };

            // Make the API request to fetch the metrics
            FB.api(`/${adAccountId}/insights`, 'GET', params, function (response) {
                if (response && !response.error) {
                    resolve(response.data);
                } else {
                    console.error('Error fetching metrics:', response.error);
                    reject(response.error);
                }
            });
        });
    }

    function updateDashboard(rates) {
        console.log('updateDashboard() function called');
        // Update the CTR, QCP, CR, and CPM cards with the calculated values
        document.getElementById('ctrCard').innerText = rates.ctr.toFixed(2) + '%';
        document.getElementById('qcpCard').innerText = rates.qcp.toFixed(2) + '%';
        document.getElementById('crCard').innerText = rates.conversionRate.toFixed(2) + '%';
        document.getElementById('cpmCard').innerText = rates.cpm.toFixed(2) + ' RON';

        // Replace the existing charts with charts displaying real sales data
        // You can use a chart library like Chart.js or Google Charts to create the charts
    }

    function generateAuditTableRow(category, value, greenThreshold, yellowThreshold) {
        console.log(`generateAuditTableRow() function called for ${category}`);
        let status;
        let color;

        if (value >= greenThreshold) {
        status = 'Good';
        color = 'green';
    } else if (value >= yellowThreshold) {
        status = 'Requires Improvement';
        color = 'yellow';
    } else {
        status = 'Urgent to Fix';
        color = 'red';
    }

    return `
        <tr>
            <td>${category}</td>
            <td>${value.toFixed(2)}%</td>
            <td style="background-color: ${color};">${status}</td>
        </tr>
    `;
}

function updateAuditTable(rates) {
    console.log('updateAuditTable() function called');
    const tableBody = document.getElementById('auditTable');

    tableBody.innerHTML = `
        ${generateAuditTableRow('CTR', rates.ctr, 2, 1)}
        ${generateAuditTableRow('Conversion Rate', rates.conversionRate, 2, 1)}
        ${generateAuditTableRow('VC to ATC', rates.vcToAtc, 25, 10)}
        ${generateAuditTableRow('ATC to ITC', rates.atcToItc, 30, 15)}
        ${generateAuditTableRow('ITC to PUR', rates.itcToPur, 45, 20)}
        ${generateAuditTableRow('QCP', rates.qcp, 80, 60)}
    `;
}

async function updatePages(adAccountId, accessToken, useMockData = false) {
    let metrics;

    if (useMockData) {
        metrics = generateMockData();
    } else {
        metrics = await fetchMetrics(adAccountId, accessToken); // Add await here
    }

    const rates = window.calculateRates(metrics[0]); // Pass the first element of the metrics array
    updateDashboard(rates);
    updateAuditTable(rates);
}

function generateMockData() {
    console.log('generateMockData() function called');
    return [
        {
            clicks: 1000,
            outbound_clicks: [{ value: 500 }],
            impressions: 50000,
            spend: 800,
            actions: [
                { action_type: 'view_content', value: 500 },
                { action_type: 'add_to_cart', value: 300 },
                { action_type: 'initiate_checkout', value: 50 },
                { action_type: 'purchase', value: 20 },
            ],
        },
    ];
}

let myChart; // Declare myChart variable inside the IIFE

const mockData = {
    linkClicks: 1000,
    outboundClicks: 500,
    ctr: 3,
    viewContent: 500,
    addToCart: 300,
    initiateCheckout: 50,
    purchases: 2,
    roas: 1.40,
    cpm: 27.23,
    purchaseValue: 500
};



function updateSalesChart(data) {
    console.log('updateSalesChart() function called with data:', data);

    const ctx = document.getElementById('myAreaChart').getContext('2d');
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Link Clicks', 'Outbound Clicks', 'View Content', 'Add to Cart', 'Initiate Checkout', 'Purchases'],
            datasets: [{
                label: 'Sales',
                data: [data.linkClicks, data.outboundClicks, data.viewContent, data.addToCart, data.initiateCheckout, data.purchases],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initAudit() {
    console.log('initAudit() function called');
    // Call the test function after the DOM and the Facebook SDK are fully loaded
    updatePages(null, null, true);
}

function initDashboard() {
    console.log('initDashboard() function called');
    updateSalesChart(mockData);
}


function calculateRates(metrics) {
    // Extract the required values from the metrics
    const totalOutboundClicks = metrics.outbound_clicks[0].value;
    const totalLinkClicks = metrics.clicks;
    const totalImpressions = metrics.impressions;
    const totalSpend = metrics.spend;
    const totalContentViews = metrics.actions.find(action => action.action_type === 'view_content').value;
    const totalAddToCart = metrics.actions.find(action => action.action_type === 'add_to_cart').value;
    const totalInitiateCheckouts = metrics.actions.find(action => action.action_type === 'initiate_checkout').value;
    const totalPurchases = metrics.actions.find(action => action.action_type === 'purchase').value;

    // Calculate the rates based on the provided definitions
    const ctr = (totalLinkClicks / totalImpressions) * 100;
    const conversionRate = (totalPurchases / totalOutboundClicks) * 100;
    const vcToAtc = (totalContentViews / totalAddToCart) * 100;
    const atcToItc = (totalAddToCart / totalInitiateCheckouts) * 100;
    const itcToPur = (totalInitiateCheckouts / totalPurchases) * 100;
    const qcp = (totalOutboundClicks / totalLinkClicks) * 100;
    const cpm = (totalSpend / totalImpressions) * 1000;

    return {
        ctr: ctr,
        conversionRate: conversionRate,
        vcToAtc: vcToAtc,
        atcToItc: atcToItc,
        itcToPur: itcToPur,
        qcp: qcp,
        cpm: cpm
    };
}

window.updatePages = updatePages;
window.initAudit = initAudit;
window.initDashboard = initDashboard;
window.mockData = mockData;
window.myChart = myChart; // Expose myChart to the global scope
window.calculateRates = calculateRates;

})()); // End of the IIFE


