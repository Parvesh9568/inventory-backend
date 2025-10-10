import { initDatabase } from '../config/database.js';
import PayalPriceChart from '../models/PayalPriceChart.js';

async function seedPayalPriceChart() {
  try {
    // Initialize database connection
    await initDatabase();
    console.log('✅ Database connected');

    // Initial price chart data
    const initialData = [
      { wireThickness: '22mm', payalType: 'Moorni', pricePerKg: 120 },
      { wireThickness: '22mm', payalType: 'Silver', pricePerKg: 200 },
      { wireThickness: '22mm', payalType: 'Golden', pricePerKg: 350 },
      { wireThickness: '22mm', payalType: 'Diamond', pricePerKg: 700 },
      { wireThickness: '28mm', payalType: 'Moorni', pricePerKg: 150 },
      { wireThickness: '28mm', payalType: 'Silver', pricePerKg: 250 },
      { wireThickness: '28mm', payalType: 'Golden', pricePerKg: 400 },
      { wireThickness: '28mm', payalType: 'Diamond', pricePerKg: 800 },
      { wireThickness: '30mm', payalType: 'Moorni', pricePerKg: 180 },
      { wireThickness: '30mm', payalType: 'Silver', pricePerKg: 280 },
      { wireThickness: '30mm', payalType: 'Golden', pricePerKg: 450 },
      { wireThickness: '30mm', payalType: 'Diamond', pricePerKg: 850 },
      { wireThickness: '32mm', payalType: 'Moorni', pricePerKg: 200 },
      { wireThickness: '32mm', payalType: 'Silver', pricePerKg: 300 },
      { wireThickness: '32mm', payalType: 'Golden', pricePerKg: 500 },
      { wireThickness: '32mm', payalType: 'Diamond', pricePerKg: 900 }
    ];

    // Clear existing data
    await PayalPriceChart.deleteMany({});
    console.log('🗑️ Cleared existing price chart data');

    // Insert new data
    const result = await PayalPriceChart.insertMany(initialData);
    console.log(`✅ Seeded ${result.length} price chart entries`);

    // Display the seeded data
    console.log('\n📊 Payal Price Chart:');
    console.log('Wire Thickness | Payal Type | Price per Kg');
    console.log('---------------|------------|-------------');
    
    result.forEach(item => {
      console.log(`${item.wireThickness.padEnd(13)} | ${item.payalType.padEnd(10)} | ₹${item.pricePerKg}`);
    });

    console.log('\n🎉 Payal price chart seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding payal price chart:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPayalPriceChart();
