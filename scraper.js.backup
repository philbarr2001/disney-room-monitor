// Disney Resort Availability Scraper (Self-Hosted Version)
// Direct API calls - identical to your Apify code, but with stealth features
// Features: Random delays, user-agent rotation, realistic headers

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Resort name mapping (from your Apify code)
const resortNames = {
  'animal-kingdom-lodge': "Disney's Animal Kingdom Lodge",
  'animal-kingdom-villas-jambo': "Disney's Animal Kingdom Villas - Jambo House",
  'animal-kingdom-villas-kidani': "Disney's Animal Kingdom Villas - Kidani Village",
  'bay-lake-tower-at-contemporary': "Bay Lake Tower at Disney's Contemporary Resort",
  'beach-club-resort': "Disney's Beach Club Resort",
  'beach-club-villas': "Disney's Beach Club Villas",
  'boardwalk-inn': "Disney's BoardWalk Inn",
  'boardwalk-villas': "Disney's BoardWalk Villas",
  'boulder-ridge-villas-at-wilderness-lodge': "Boulder Ridge Villas at Disney's Wilderness Lodge",
  'copper-creek-villas-and-cabins': "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
  'old-key-west-resort': "Disney's Old Key West Resort",
  'polynesian-village-resort': "Disney's Polynesian Village Resort",
  'polynesian-villas-bungalows': "Disney's Polynesian Villas & Bungalows",
  'riviera-resort': "Disney's Riviera Resort",
  'saratoga-springs-resort-and-spa': "Disney's Saratoga Springs Resort & Spa",
  'villas-at-grand-floridian-resort-and-spa': "The Villas at Disney's Grand Floridian Resort & Spa",
  'dvc-cabins-at-fort-wilderness-resort': "The Cabins at Disney's Fort Wilderness Resort",
  'contemporary-resort': "Disney's Contemporary Resort",
  'grand-floridian-resort-and-spa': "Disney's Grand Floridian Resort & Spa",
  'wilderness-lodge-resort': "Disney's Wilderness Lodge",
  'yacht-club-resort': "Disney's Yacht Club Resort",
  'all-star-movies-resort': "Disney's All-Star Movies Resort",
  'all-star-music-resort': "Disney's All-Star Music Resort",
  'all-star-sports-resort': "Disney's All-Star Sports Resort",
  'art-of-animation-resort': "Disney's Art of Animation Resort",
  'pop-century-resort': "Disney's Pop Century Resort",
  'caribbean-beach-resort': "Disney's Caribbean Beach Resort",
  'coronado-springs-resort': "Disney's Coronado Springs Resort",
  'port-orleans-resort-french-quarter': "Disney's Port Orleans Resort - French Quarter",
  'port-orleans-resort-riverside': "Disney's Port Orleans Resort - Riverside"
};

// Map internal slugs to Disney API slugs
const slugToDisneyAPI = {
  'animal-kingdom-villas-jambo': 'animal-kingdom-lodge',
  'animal-kingdom-villas-kidani': 'animal-kingdom-lodge',
  'polynesian-village-resort': 'polynesian-villas-bungalows'
};

// Complete room mappings from your Apify code
const roomMappingsByResort = {
  'all-star-movies-resort': { "Preferred Room": "EP", "Standard Room": "EA" },
  'all-star-music-resort': { "Standard Room": "AA", "Preferred Room": "AP", "Family Suite": "AB" },
  'all-star-sports-resort': { "Standard Room": "SA", "Preferred Room": "SP" },
  'animal-kingdom-lodge': { "Savanna View - King Bed - Club Level": "1V", "Savanna View - King Bed": "7F", "Resort View - King Bed": "BB", "Water View - King Bed": "ZV", "Savanna View": "QC", "Resort View": "QA", "Water View": "QB", "Resort View - 1 BR Suite - Club Level": "QM", "Savanna View - Club Level": "QG", "Savanna View - 1 BR Suite - Club Level": "Q1", "2-Bedroom Suite - Club Level": "Q2", "Royal Asante Presidential Suite - Club Level": "QP" },
  'animal-kingdom-villas-jambo': { "Deluxe Studio - Savanna View (Jambo)": "U2", "1 Bedroom Villa - Savanna View (Jambo)": "U3", "3 Bedroom Grand Villa - Savanna View (Jambo)": "U5", "Studio - Value (Jambo)": "U7", "1 Bedroom Villa - Value (Jambo)": "U8", "Deluxe Studio - Resort View (Jambo)": "UR", "1 Bedroom Villa - Resort View (Jambo)": "US", "Deluxe Studio - Club Level (Jambo)": "UX", "1 Bedroom Villa - Club Level (Jambo)": "UY" },
  'animal-kingdom-villas-kidani': { "Deluxe Studio - Savanna View (Kidani)": "AU", "1 Bedroom Villa - Savanna View (Kidani)": "BU", "2 Bedroom Villa - Savanna View (Kidani)": "CU", "3 Bedroom Grand Villa - Savanna View (Kidani)": "DU", "Deluxe Studio - Resort View (Kidani)": "UA", "1 Bedroom Villa - Resort View (Kidani)": "UB", "2 Bedroom Villa - Resort View (Kidani)": "UC", "3 Bedroom Grand Villa - Resort View (Kidani)": "UD" },
  'art-of-animation-resort': { "The Little Mermaid Standard Room": "VA", "Family Suite": "VS", "The Lion King Family Suite": "VL", "Cars Family Suite": "VC", "Finding Nemo Family Suite": "VN" },
  'bay-lake-tower-at-contemporary': { "Deluxe Studio - Theme Park View": "4A", "1-Bedroom Villa - Theme Park View": "4B", "2-Bedroom Villa – Theme Park View": "4C", "3-Bedroom Grand Villa – Theme Park View": "4D", "1 Bedroom Villa - Preferred View": "4O", "Deluxe Studio - Preferred View": "4S", "2 Bedroom Villa - Preferred View": "4T", "3 Bedroom Grand Villa - Preferred View": "4V", "Deluxe Studio - Resort View": "4W", "1 Bedroom Villa - Resort View": "4X", "2 Bedroom Villa - Resort View": "4Y" },
  'beach-club-resort': { "Resort View": "WC", "Water View": "WD", "Deluxe Room": "XX", "Resort View - Club Level": "WK", "Water View - Club Level": "WG", "1 Bedroom Suite - Club Level": "W1", "2 Bedroom Suite - Club Level": "W2", "Nantucket VP Suite - Club Level": "WN", "Newport Presidential Suite - Club Level": "WP" },
  'beach-club-villas': { "Deluxe Studio": "DA", "1 Bedroom Villa": "DB", "2 Bedroom Villa": "DC" },
  'boardwalk-inn': { "2 Bedroom Suite - Club Level": "IU", "Deluxe Room - Club Level": "IE", "Garden Room - Club Level Access": "IF", "Resort View": "IL", "Resort View - Club Level": "ID", "Sonora VP Suite - Club Level": "IV", "Water View": "IC" },
  'boardwalk-villas': { "Deluxe Studio - Garden or Pool View": "AZ", "1 Bedroom Villa - Garden or Pool View": "BZ", "3 Bedroom Grand Villa": "DZ", "1 Bedroom Villa - Boardwalk View": "OZ", "Deluxe Studio - Boardwalk View": "SZ", "Deluxe Studio - Resort View": "ZA", "1 Bedroom Villa - Resort View": "ZB" },
  'boulder-ridge-villas-at-wilderness-lodge': { "2 Bedroom Villa": "XC", "1 Bedroom Villa": "XB", "Deluxe Studio": "XA" },
  'caribbean-beach-resort': { "King Bed": "RK", "Standard View - 5th Sleeper": "CX", "Water or Pool View": "RD", "Water or Pool View - 5th Sleeper": "D8", "Preferred Room": "RP", "Standard View": "RA", "Standard Location": "AG5", "Preferred Location": "AHE" },
  'contemporary-resort': { "Garden Wing - Resort View": "CA", "Garden Wing - Water View": "CB", "Resort View - Club Level": "CC", "Main Tower - Theme Park View": "CF", "Garden Wing - King": "CG", "Garden Wing -1 Bedroom Hospitality Suite": "CH", "Garden Wing - 1 Bedroom Suite": "CJ", "Garden Wing - Deluxe Room": "CK", "Water View - 2 Bedroom Suite - Club Level": "CL", "Theme Park View - 2 Bedroom Suite - Club Level": "CM", "Theme Park View - 1 Bedroom Suite - Club Level": "CN", "Theme Park View - Presidential Suite Club Level": "CP", "Water View - 1 Bedroom Suite - Club Level": "CQ", "Theme Park View - Atrium Club Level": "CR", "Main Tower - Water View": "CT", "Resort View - King - Club Level": "CW" },
  'copper-creek-villas-and-cabins': { "Deluxe Studio": "2A", "2 Bedroom Villa": "2F", "1 Bedroom Villa": "2E", "3 Bedroom Grand Villa": "2I", "Deluxe Studio with Shower": "2D", "2 Bedroom Cabin": "2K" },
  'coronado-springs-resort': { "Tower - Water View": "F3", "Tower - Water View - King Bed": "F4", "Tower - Resort View": "F1", "Tower - Resort View - King Bed": "F2", "Tower - Resort View - Club Level": "X5", "Tower - Deluxe Suite - Club Level": "F5", "Tower - One Bedroom Suite - Club Level": "F8", "Tower - Presidential Suite - Club Level": "F9", "Village - Standard View - King Bed": "NK", "Village - Standard View": "NA", "Village - Water View": "ND", "Village - Preferred Room": "NY", "Village - Water View - King Bed": "NW", "Village - Preferred Room - King Bed": "NZ", "Village - 1 Bedroom Suite": "NT", "Village - 1 Bedroom Suite - King Bed": "NG", "Village - Executive Suite": "NU", "Village - Standard Location": "AHN", "Village - Preferred Location": "AHT", "Village - Standard Location - King Bed": "AIP", "Village - Preferred Location - King Bed": "AIU" },
  'grand-floridian-resort-and-spa': { "1 Bedroom Suite - Club Level": "B1", "2 Bedroom Suite - Club Level": "B2", "Resort View": "BA", "2 BR - Theme Park View - Club Level Access": "BC", "1 BR - Theme Park View - Club Level Access": "BD", "Theme Park View - Club Level": "BE", "Water View": "BG", "Resort View - Club Level": "BJ", "Grand Suite - Club Level": "BK", "1 Bedroom Suite - Club Level Access": "BN", "Deluxe Room - Club Level": "BO", "Deluxe King Room - Club Level": "BP", "2 Bedroom Suite - Club Level Access": "BQ", "Disney Suite - Club Level": "BS", "Theme Park View": "BU", "Victorian Suite - Club Level": "BW" },
  'old-key-west-resort': { "1 Bedroom Villa": "KB", "Deluxe Studio": "KA", "3 Bedroom Grand Villa": "KD", "2 Bedroom Villa": "KC" },
  'polynesian-village-resort': { "Resort View": "PB", "Water View": "P8", "Theme Park View": "PC", "Resort View - Club Level": "PM", "Water View - Club Level": "PL", "Theme Park View - Club Level": "PE", "1 Bedroom Suite - Club Level": "P1", "Honeymoon Room - Club Level": "PY", "Ambassador VP Suite - Club Level": "P2", "King Kamehameha Suite - Club Level": "P5" },
  'polynesian-villas-bungalows': { "Deluxe Studio - Resort View": "MU", "Deluxe Studio - Preferred View": "MV", "Tower - Duo Studio - Resort View": "AFR", "Tower - Duo Studio - Preferred View": "AFV", "Tower - Duo Studio - Premium View": "AFW", "Tower - Deluxe Studio - Resort View": "AFX", "Tower - Deluxe Studio - Preferred View": "AF1", "Tower - Deluxe Studio - Theme Park View": "AF3", "Tower - 1 Bedroom Villa - Resort View": "AF7", "Tower - 1 Bedroom Villa - Preferred View": "AF9", "Tower - 1 Bedroom Villa - Theme Park View": "AGA", "Tower - 2 Bedroom Villa - Theme Park View": "AGF", "Tower - 2 Bedroom Penthouse - Preferred View": "AGH", "Tower - 2 Bedroom Penthouse - Theme Park View": "AGJ", "Bungalow": "MW" },
  'pop-century-resort': { "Standard Room": "GA", "Preferred Room": "GV", "Standard Pool View": "GP", "Preferred Pool View": "GW" },
  'port-orleans-resort-french-quarter': { "King Bed": "OK", "Garden View": "OB", "River View": "OE", "Pool View": "OD", "Standard View": "OA", "Standard Location": "AHY", "Preferred Location": "AH4" },
  'port-orleans-resort-riverside': { "Woods View - 5th Sleeper": "AS", "Standard View": "LA", "Standard View - 5th Sleeper": "AC", "Woods View": "LB", "King Bed": "LK", "Pool View": "LD", "Preferred Room": "LF", "River View": "LE", "Standard Location": "AH9", "Standard Location - 5th Sleeper": "AIC", "Preferred Location": "AIE", "Royal Guest Room - Standard View": "LS", "Royal Guest Room - Woods View": "LG", "Royal Guest Room - River View": "LV", "Royal Guest Room": "AIK" },
  'riviera-resort': { "Deluxe Studio - Resort View": "10", "Deluxe Studio - Preferred View": "A1", "2 Bedroom Villa - Resort View": "H0", "2 Bedroom Villa - Preferred View": "J0", "Tower Studio - Resort View": "W0", "1 Bedroom Villa - Preferred View": "C0", "1 Bedroom Villa - Resort View": "A9", "3 Bedroom Grand Villa": "T0" },
  'saratoga-springs-resort-and-spa': { "Deluxe Studio": "TA", "Deluxe Studio - Preferred": "S9", "1 Bedroom Villa - Preferred": "SB", "2 Bedroom Villa": "TC", "2 Bedroom Villa - Preferred": "SH", "Treehouse Villa": "TH", "3-Bedroom Grand Villa - Preferred": "SK", "3-Bedroom Grand Villa": "TD", "1 Bedroom Villa": "TB" },
  'dvc-cabins-at-fort-wilderness-resort': { "1 Bedroom Cabin": "AD6" },
  'villas-at-grand-floridian-resort-and-spa': { "Deluxe Studio - Preferred View": "81", "1 Bedroom Villa - Preferred View": "82", "2 Bedroom Villa - Preferred View": "83", "3 Bedroom Grand Villa - Preferred View": "85", "Deluxe Studio - Resort View": "86", "1 Bedroom Villa - Resort View": "87", "2 Bedroom Villa - Resort View": "88", "Resort Studio - Resort View": "AAI", "Resort Studio - Preferred View": "AAN", "Resort Studio - Theme Park View": "AAT" },
  'wilderness-lodge-resort': { "Fireworks View": "JZ", "Resort View": "JB", "Resort View - King Bed": "Z3", "Water View": "JC", "Water View - King Bed": "Z9", "Fireworks View - King Bed": "Z5", "Resort View - Club Level": "JD", "Deluxe Room - Club Level Access": "JS", "Resort View - King Bed - Club Level": "ZS" },
  'yacht-club-resort': { "2 Bedroom Suite - Club Level Access": "Y2", "Resort View": "YC", "Water View": "YD", "Water View - Club Level": "YG", "Captain's Deck Suite - Club Level Access": "YH", "Resort View - Club Level": "YK", "Turret Suite - Club Level Access": "YT", "Commodore VP Suite - Club Level": "YV" }
};

// Invert mappings: code -> name for lookup
const roomCodeToNameByResort = {};
for (const [resortSlug, roomMap] of Object.entries(roomMappingsByResort)) {
  roomCodeToNameByResort[resortSlug] = {};
  for (const [roomName, code] of Object.entries(roomMap)) {
    roomCodeToNameByResort[resortSlug][code] = roomName;
  }
}

function getDisneyAPISlug(internalSlug) {
  return slugToDisneyAPI[internalSlug] || internalSlug;
}

// STEALTH FEATURES
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomDelay(min = 2000, max = 8000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Make API call to Disney (no browser needed!)
async function makeDisneyAPICall(resortSlug, disneySlug, checkinDate, checkoutDate, marketingOfferId) {
  console.log(`API call: ${resortSlug} with code ${marketingOfferId}`);
  
  try {
    const response = await fetch(
      `https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/${disneySlug}/availability-and-prices/?storeId=wdw`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': getRandomUserAgent(),
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
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
      const roomCount = Object.keys(data.roomPriceLookup || {}).length;
      console.log(`  ✓ ${resortSlug} returned ${roomCount} rooms`);
      return data.roomPriceLookup || null;
    }
    
    console.log(`  ✗ ${resortSlug} returned status ${response.status}`);
    return null;
  } catch (error) {
    console.log(`  ✗ ${resortSlug} API error: ${error.message}`);
    return null;
  }
}

// Check a single resort for availability
async function scrapeResort(resortSlug, alertData) {
  console.log(`\n=== Scraping ${resortSlug} ===`);
  
  const disneySlug = getDisneyAPISlug(resortSlug);
  const discountCodes = ['room-only', '11296', '11313', '11316'];
  
  // Make parallel API calls for all discount codes
  const apiCalls = discountCodes.map(code =>
    makeDisneyAPICall(resortSlug, disneySlug, alertData.checkIn, alertData.checkOut, code)
  );
  
  const allResults = await Promise.all(apiCalls);
  
  // Combine results
  const resultsByCode = {};
  discountCodes.forEach((code, index) => {
    resultsByCode[code] = allResults[index];
  });
  
  // Process rooms and find matches
  const matches = [];
  const processedRooms = new Map();
  
  for (const [discountCode, rooms] of Object.entries(resultsByCode)) {
    if (!rooms) continue;
    
    Object.values(rooms).forEach(room => {
      if (!processedRooms.has(room.code)) {
        processedRooms.set(room.code, {
          room: room,
          discounts: {}
        });
      }
      
      const roomData = processedRooms.get(room.code);
      
      if (room.displayPrice && !room.reasonUnavailable) {
        roomData.discounts[discountCode] = {
          price: Math.round(parseFloat(room.displayPrice.basePrice?.subtotal || 0)),
          available: true
        };
      }
    });
  }
  
  // Check which rooms match the alert criteria
  // Check which rooms match the alert criteria
processedRooms.forEach((roomData, roomCode) => {
  const roomName = roomCodeToNameByResort[resortSlug]?.[roomCode] || roomCode;
  const baselinePrice = roomData.discounts['room-only']?.price;
  
  // Check if this room type is being monitored
  if (alertData.roomCategories && !alertData.roomCategories.includes(roomName)) {
    return; // Skip rooms not in the alert
  }
  
  // Find best discount - ONLY check actual discount codes, NOT 'room-only'
  let bestDiscountPrice = null;
  let isDiscounted = false;
  
  // Only check codes that are NOT 'room-only'
  const actualDiscountCodes = Object.keys(roomData.discounts).filter(code => code !== 'room-only');
  
  for (const code of actualDiscountCodes) {
    const data = roomData.discounts[code];
    if (data && data.available && data.price && baselinePrice && data.price < baselinePrice) {
      // This is a REAL discount - price is lower than room-only baseline
      if (!bestDiscountPrice || data.price < bestDiscountPrice) {
        bestDiscountPrice = data.price;
        isDiscounted = true;
      }
    }
  }
  
  // Determine final price to show
  const bestPrice = isDiscounted ? bestDiscountPrice : baselinePrice;
  
  // Check availability type filter
  if (alertData.availabilityType === 'discounted' && !isDiscounted) {
    // User only wants discounted availability, but no discount found
    console.log(`  Skipping ${roomName} - no discount available (discounted-only search)`);
    return;
  }
    
    if (bestPrice) {
      matches.push({
        roomType: roomName,
        roomCode: roomCode,
        price: bestPrice,
        originalPrice: baselinePrice,
        isDiscounted: isDiscounted
      });
    }
  });
  
  console.log(`Found ${matches.length} matching rooms`);
  return matches;
}

// Main function - check all active alerts
async function runScraper() {
  console.log('=== Disney Scraper Started ===');
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  // Get all active alerts from Supabase
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active');
  
  if (error) {
    console.error('Error fetching alerts:', error);
    return;
  }
  
  console.log(`Found ${alerts.length} active alerts`);
  
  // Group alerts by resort to minimize API calls
  const alertsByResort = {};
  alerts.forEach(alert => {
    if (!alertsByResort[alert.resort_slug]) {
      alertsByResort[alert.resort_slug] = [];
    }
    alertsByResort[alert.resort_slug].push(alert);
  });
  
  console.log(`Checking ${Object.keys(alertsByResort).length} unique resorts\n`);
  
  // Process each resort
  for (const [resortSlug, resortAlerts] of Object.entries(alertsByResort)) {
    // For now, just check first alert (in production, combine date ranges)
    const alert = resortAlerts[0];
    
    const matches = await scrapeResort(resortSlug, {
      checkIn: alert.check_in_date,
      checkOut: alert.check_out_date,
      roomCategories: [alert.room_category], // Single category, wrap in array
      availabilityType: alert.availability_type
    });
    
    // Send notifications for matches
    if (matches.length > 0) {
      console.log(`\n📧 Sending ${matches.length} notifications for ${resortSlug}`);
      
      for (const alert of resortAlerts) {
        // Check if this specific alert has matches
        const alertMatches = matches.filter(m => 
          m.roomType === alert.room_category  // Compare single room_category
        );
        
        if (alertMatches.length > 0) {
          // TODO: Send email notification
          console.log(`  → Email to ${alert.user_email}`);
          
          // Update last_checked timestamp
          await supabase
            .from('alerts')
            .update({ 
              last_checked_at: new Date().toISOString(),
              last_searched: new Date().toISOString()
            })
            .eq('id', alert.id);
        } else {
          // Update last_searched only (no matches)
          await supabase
            .from('alerts')
            .update({ last_searched: new Date().toISOString() })
            .eq('id', alert.id);
        }
      }
    } else {
      // No matches found for any alerts at this resort
      for (const alert of resortAlerts) {
        await supabase
          .from('alerts')
          .update({ last_searched: new Date().toISOString() })
          .eq('id', alert.id);
      }
    }
    
    // Polite delay between resorts (random 2-8 seconds for stealth)
    const delay = getRandomDelay(2000, 8000);
    console.log(`Waiting ${(delay/1000).toFixed(1)}s before next resort...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log('\n=== Scraper Complete ===');
}

// Run the scraper
runScraper().catch(console.error);