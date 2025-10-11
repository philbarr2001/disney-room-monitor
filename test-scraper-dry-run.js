require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function dryRun() {
  console.log('=== DRY RUN TEST ===\n');
  
  // Get one alert
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')
    .eq('resort_slug', 'boardwalk-inn')
    .limit(1);
  
  if (error || !alerts.length) {
    console.log('No Boardwalk Inn alerts found');
    return;
  }
  
  const alert = alerts[0];
  console.log('Testing with alert:');
  console.log(`  Client: ${alert.client_name}`);
  console.log(`  Resort: ${alert.resort_name}`);
  console.log(`  Room: ${alert.room_category}`);
  console.log(`  Dates: ${alert.check_in_date} to ${alert.check_out_date}`);
  console.log(`  Type: ${alert.availability_type}\n`);
  
  // Test Disney API call
  console.log('Calling Disney API...');
  const response = await fetch(
    `https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/${alert.resort_slug}/availability-and-prices/?storeId=wdw`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://disneyworld.disney.go.com',
        'Referer': 'https://disneyworld.disney.go.com/resorts/'
      },
      body: JSON.stringify({
        checkInDate: alert.check_in_date,
        checkOutDate: alert.check_out_date,
        partyMix: { adultCount: 2, childCount: 0, nonAdultAges: [] },
        region: 'US',
        accessible: false,
        personalizationId: Math.random().toString(36).substr(2, 9),
        sendOffersCarousel: true,
        marketingOfferId: 'room-only',
        affiliations: ['STD_GST'],
        postalCode: '02101'
      })
    }
  );
  
  console.log('API Status:', response.status);
  
  if (response.status === 200) {
    const data = await response.json();
    const rooms = data.roomPriceLookup || {};
    console.log(`✅ Found ${Object.keys(rooms).length} rooms\n`);
    
    // Show first 3 rooms
    Object.entries(rooms).slice(0, 3).forEach(([id, room]) => {
      console.log(`  ${room.code} - Available: ${!room.reasonUnavailable} - $${room.displayPrice?.basePrice?.subtotal || 'N/A'}`);
    });
    
    console.log('\n✅ Scraper is ready to run!');
  } else {
    console.log('❌ API call failed');
  }
}

dryRun().catch(console.error);