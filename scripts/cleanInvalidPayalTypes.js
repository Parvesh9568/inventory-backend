import { initDatabase } from '../config/database.js';
import Transaction from '../models/Transaction.js';
import PayalPriceChart from '../models/PayalPriceChart.js';

async function cleanInvalidPayalTypes() {
  try {
    // Initialize database connection
    await initDatabase();
    console.log('✅ Database connected');

    console.log('\n📝 PayalType enum validation has been removed from the models.');
    console.log('All payalType values are now accepted in both Transaction and PayalPriceChart collections.');
    
    // Show current payalTypes in use
    console.log('\n🔍 Current payalTypes in Transactions:');
    const transactionPayalTypes = await Transaction.distinct('payalType');
    console.log('Transaction payalTypes:', transactionPayalTypes);

    console.log('\n🔍 Current payalTypes in PayalPriceChart:');
    const priceChartPayalTypes = await PayalPriceChart.distinct('payalType');
    console.log('PayalPriceChart payalTypes:', priceChartPayalTypes);

    console.log('\n✅ No cleanup needed - all payalType values are now valid!');
    console.log('The system now accepts any payalType value.');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error during check:', error);
    process.exit(1);
  }
}

// Run the cleanup function
cleanInvalidPayalTypes();
