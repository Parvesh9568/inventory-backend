import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4001/api';

async function addDataViaAPI() {
  try {
    console.log('🚀 Adding vendors and items to database via API...\n');

    // Define the data to add
    const vendors = ['Anuj', 'Parvesh', 'Neeraj', 'Avinash'];
    const items = ['22m', '28m', '32m', '38m'];

    // Add vendors
    console.log('📝 Adding vendors:');
    for (const vendorName of vendors) {
      try {
        const response = await fetch(`${API_BASE}/vendors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: vendorName }),
        });

        if (response.ok) {
          const vendor = await response.json();
          console.log(`✅ Added vendor: ${vendor.name}`);
        } else {
          const error = await response.json();
          if (error.error === 'Vendor already exists') {
            console.log(`ℹ️  Vendor already exists: ${vendorName}`);
          } else {
            console.log(`❌ Failed to add vendor ${vendorName}: ${error.error}`);
          }
        }
      } catch (err) {
        console.log(`❌ Error adding vendor ${vendorName}: ${err.message}`);
      }
    }

    console.log('\n📦 Adding items:');
    // Add items
    for (const itemName of items) {
      try {
        const response = await fetch(`${API_BASE}/vendors/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: itemName }),
        });

        if (response.ok) {
          const item = await response.json();
          console.log(`✅ Added item: ${item.name}`);
        } else {
          const error = await response.json();
          if (error.error === 'Item already exists') {
            console.log(`ℹ️  Item already exists: ${itemName}`);
          } else {
            console.log(`❌ Failed to add item ${itemName}: ${error.error}`);
          }
        }
      } catch (err) {
        console.log(`❌ Error adding item ${itemName}: ${err.message}`);
      }
    }

    console.log('\n🎉 Data addition complete!');
    console.log('📊 Summary:');
    console.log(`   - Vendors: ${vendors.join(', ')}`);
    console.log(`   - Items: ${items.join(', ')}`);
    console.log('\n✅ Your IN/OUT panels now have access to this data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ Backend server is running\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it first with: npm start');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await addDataViaAPI();
  }
}

main();
