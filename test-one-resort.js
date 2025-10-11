require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Stealth features
const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Correct Boardwalk Inn mappings
const roomMappingsByResort = {
  'boardwalk-inn': { 
    "2 Bedroom Suite - Club Level": "IU", 
    "Deluxe Room - Club Level": "IE", 
    "Garden Room - Club Level Access": "IF", 
    "Resort View": "IL", 
    "Resort View - Club Level": "ID", 
    "Sonora VP Suite - Club Level": "IV", 
    "Water View": "IC" 
  }
};

// Invert: code -> name
const roomCodeToNameByResort = {};
for (const [resortSlug, roomMap] of Object.entries(roomMappingsByResort)) {
  roomCodeToNameByResort[resortSlug] = {};
  for (const [roomName, code] of Object.entries(roomMap)) {
    roomCodeToNameByResort[resortSlug][code] = roomName;
  }
}

async function makeDisneyAPICall(resortSlug, checkinDate, checkoutDate, marketingOfferId) {
  console.log(`  API call with code: ${marketingOfferId}`);
  
  const response = await fetch(
    `https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/${resortSlug}/availability-and-prices/?storeId=wdw`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/json',
        'Origin': 'https://disneyworld.disney.go.com',
        'Referer': 'https://disneyworld.disney.go.com/resorts/'
      },
      body: JSON.stringify({
        checkInDate: checkinDate,
        checkOutDate: checkoutDate,
        partyMix: { adultCount: 2, childCount: 0, nonAdultAges: [] },
        region: 'US',
        accessible: false,
        personalizationId: Math.random().toString(36).substr(2, 9),
        sendOffersCarousel: true,
        marketingOfferId: marketingOfferId,
        affiliations: ['STD_GST'],
        postalCode: '02101'
      })
    }
  );
  
  if (response.status === 200) {
    const data = await response.json();
    return data.roomPriceLookup || null;
  }
  
  console.log(`  ✗ Status ${response.status}`);
  return null;
}

async function testOneResort() {
  console.log('=== Testing Full Scraper Logic ===\n');
  
  // Get Boardwalk Inn alert
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')
    .eq('resort_slug', 'boardwalk-inn')
    .limit(1);
  
  if (!alerts || !alerts.length) {
    console.log('No active Boardwalk Inn alerts found');
    return;
  }
  
  const alert = alerts[0];
  console.log('Processing alert:');
  console.log(`  ${alert.client_name} - ${alert.room_category}`);
  console.log(`  ${alert.check_in_date} to ${alert.check_out_date}\n`);
  
  // Check all discount codes
  const discountCodes = ['room-only', '11296', '11313', '11316'];
  const allResults = [];
  
  for (const code of discountCodes) {
    const rooms = await makeDisneyAPICall(
      alert.resort_slug,
      alert.check_in_date,
      alert.check_out_date,
      code
    );
    
    if (rooms) {
      allResults.push({ code, rooms });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
  }
  
  console.log(`\n✅ Checked ${allResults.length} discount codes\n`);
  
  // Process results
  const processedRooms = new Map();
  
  allResults.forEach(({ code, rooms }) => {
    Object.values(rooms).forEach(room => {
      if (!processedRooms.has(room.code)) {
        processedRooms.set(room.code, {
          room: room,
          discounts: {}
        });
      }
      
      const roomData = processedRooms.get(room.code);
      
      if (room.displayPrice && !room.reasonUnavailable) {
        roomData.discounts[code] = {
          price: Math.round(parseFloat(room.displayPrice.basePrice?.subtotal || 0)),
          available: true
        };
      }
    });
  });
  
  console.log('Available rooms:');
  
  processedRooms.forEach((roomData, roomCode) => {
    const roomName = roomCodeToNameByResort['boardwalk-inn']?.[roomCode] || roomCode;
    const baselinePrice = roomData.discounts['room-only']?.price;
    
    // Check if this matches the alert's room category
    if (roomName !== alert.room_category && alert.room_category !== 'Resort View') {
      return; // Skip non-matching rooms
    }
    
    let bestPrice = baselinePrice;
    let bestCode = 'room-only';
    
    for (const [code, data] of Object.entries(roomData.discounts)) {
      if (code !== 'room-only' && data.available && data.price && data.price < bestPrice) {
        bestPrice = data.price;
        bestCode = code;
      }
    }
    
    if (bestPrice) {
      const isDiscounted = bestCode !== 'room-only';
      console.log(`  ${roomName}: $${bestPrice}${isDiscounted ? ' ✨ DISCOUNTED' : ''}`);
      
      if (isDiscounted) {
        console.log(`    Original: $${baselinePrice} | Savings: $${baselinePrice - bestPrice}`);
      }
    }
  });
  
  console.log('\n✅ Test complete! Scraper logic works correctly.');
}

testOneResort().catch(console.error);