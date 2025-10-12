import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import 'dotenv/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Email transporter - SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // This is literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY
  }
});

// Helper functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 2000, max = 8000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Map internal slugs to Disney API slugs (from Apify)
const slugToDisneyAPI = {
  'animal-kingdom-villas-jambo': 'animal-kingdom-lodge',
  'animal-kingdom-villas-kidani': 'animal-kingdom-lodge',
  'polynesian-village-resort': 'polynesian-villas-bungalows',
};

function getDisneyAPISlug(internalSlug) {
  return slugToDisneyAPI[internalSlug] || internalSlug;
}

// Resort name mapping (from Apify)
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
  'campsites-at-fort-wilderness-resort': "The Campsites at Disney's Fort Wilderness Resort",
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

// Complete room code mappings from Apify
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
  'boardwalk-inn': { "Water View": "IC", "Resort View - Club Level": "ID", "Deluxe Room - Club Level": "IE", "Garden Room - Club Level": "IF", "Resort View": "IL", "2 Bedroom Suite - Club Level": "IU", "Sonora VP Suite - Club Level": "IV" },
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

// Create reverse mapping: code -> room name
const roomCodeToNameByResort = {};
for (const [resortSlug, roomMap] of Object.entries(roomMappingsByResort)) {
  roomCodeToNameByResort[resortSlug] = {};
  for (const [roomName, code] of Object.entries(roomMap)) {
    roomCodeToNameByResort[resortSlug][code] = roomName;
  }
}

// Helper function to get room name from code
function getRoomName(resortSlug, roomCode) {
  return roomCodeToNameByResort[resortSlug]?.[roomCode] || roomCode;
}

// Discount code validity periods
const discountCodePeriods = {
  '11296': { // Fall 2025 discount
    start: new Date('2025-10-01'),
    end: new Date('2025-12-31')
  },
  '11313': { // Spring 2026 discount
    start: new Date('2026-01-01'),
    end: new Date('2026-05-31')
  },
  '11316': { // Package discount
    start: new Date('2026-01-01'),
    end: new Date('2026-07-31')
  }
};

// Filter discount codes based on check-in date
function getValidDiscountCodes(checkinDate, selectedCodes) {
  const checkin = new Date(checkinDate);
  const validCodes = [];
  
  for (const code of selectedCodes) {
    // room-only is always valid
    if (code === 'room-only') {
      validCodes.push(code);
      continue;
    }
    
    const period = discountCodePeriods[code];
    if (!period) {
      // Unknown code, include it to be safe
      validCodes.push(code);
      continue;
    }
    
    // Check if checkin date falls within the discount period
    if (checkin >= period.start && checkin <= period.end) {
      validCodes.push(code);
    }
  }
  
  return validCodes;
}

// Fetch room availability from Disney API
async function fetchDisneyRooms(resortId, discountCode, checkinDate, checkoutDate) {
  const apiSlug = getDisneyAPISlug(resortId);
  
  try {
    const response = await fetch(`https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/${apiSlug}/availability-and-prices/?storeId=wdw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        checkInDate: checkinDate,
        checkOutDate: checkoutDate,
        partyMix: { adultCount: 2, childCount: 0, nonAdultAges: [] },
        region: 'US',
        accessible: false,
        personalizationId: Math.random().toString(36).substr(2, 9),
        sendOffersCarousel: true,
        marketingOfferId: discountCode,
        affiliations: ['STD_GST'],
        postalCode: '02101'
      })
    });

    if (!response.ok) {
      console.log(`  ✗ ${resortId} API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const roomPriceLookup = data.roomPriceLookup || {};
    
    // Convert to array of rooms with their codes
    return Object.values(roomPriceLookup).map(room => ({
      ...room,
      discountCode
    }));

  } catch (error) {
    console.log(`  ✗ ${resortId} fetch error: ${error.message}`);
    return [];
  }
}

// Find matching rooms based on alert criteria
function findMatchingRooms(rooms, alert) {
  const matches = [];
  
  // Get the room code from the alert's room_category
  const alertRoomCode = roomMappingsByResort[alert.resort_slug]?.[alert.room_category];
  
  if (!alertRoomCode) {
    console.log(`  Warning: No room code found for ${alert.room_category} at ${alert.resort_slug}`);
    return matches;
  }
  
  for (const room of rooms) {
    // Skip if room code doesn't match alert
    if (room.code !== alertRoomCode) continue;
    
    // Skip if unavailable
    if (room.reasonUnavailable) continue;
    
    // Skip if no price
    if (!room.displayPrice?.basePrice?.subtotal) continue;
    
    const roomPrice = Math.round(room.displayPrice.basePrice.subtotal);
    
    // For discounted-only alerts, only include if there's an actual discount
    if (alert.availability_type === 'discounted') {
      // Skip room-only for discounted-only searches
      if (room.discountCode === 'room-only') {
        console.log(`  Skipping ${alert.room_category} - no discount available (discounted-only search)`);
        continue;
      }
    }
    
    // Check price threshold if set
    if (alert.max_price && roomPrice > alert.max_price) continue;
    
    matches.push({
      roomType: getRoomName(alert.resort_slug, room.code),
      roomCode: room.code,
      price: roomPrice,
      discountCode: room.discountCode
    });
  }
  
  return matches;
}

// Send email alert
async function sendAlertEmail(alert, matches) {
  const roomList = matches.map(m => 
    `- ${m.roomType}: $${m.price} (Code: ${m.discountCode})`
  ).join('\n');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: alert.user_email,
    subject: `🏰 Disney Room Alert: ${matches.length} room(s) available!`,
    text: `Great news! We found ${matches.length} room(s) matching your alert:

Client: ${alert.client_name}
Resort: ${alert.resort_name}
Dates: ${alert.check_in_date} to ${alert.check_out_date}

Available Rooms:
${roomList}

Book now at https://disneyworld.disney.go.com/

---
This is an automated alert from your Disney Room Monitor.
`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`  ✓ Email sent to ${alert.user_email}`);
  } catch (error) {
    console.log(`  ✗ Email error: ${error.message}`);
  }
}

// Main scraping function
async function scrapeResorts() {
  console.log('\n=== Disney Scraper Started ===');
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Get all active alerts
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  
  console.log(`Found ${alerts.length} active alerts`);
  
  // Deduplicate API calls: group by resort + dates + discount code
  const uniqueSearches = new Map();
  
  alerts.forEach(alert => {
    let discountCodes = alert.selected_discount_codes || ['room-only'];
    
    // OPTIMIZATION 1: Filter discount codes by date validity
    discountCodes = getValidDiscountCodes(alert.check_in_date, discountCodes);
    
    if (discountCodes.length === 0) {
      console.log(`Warning: Alert ${alert.id} has no valid discount codes for ${alert.check_in_date}`);
      return;
    }
    
    // OPTIMIZATION 2: For discounted-only searches, exclude room-only since we skip it anyway
    if (alert.availability_type === 'discounted') {
      discountCodes = discountCodes.filter(code => code !== 'room-only');
      
      // If no discount codes left, skip this alert
      if (discountCodes.length === 0) {
        console.log(`Warning: Alert ${alert.id} is discounted-only but has no valid discount codes for ${alert.check_in_date}`);
        return;
      }
    }
    
    discountCodes.forEach(code => {
      const key = `${alert.resort_slug}|${alert.check_in_date}|${alert.check_out_date}|${code}`;
      if (!uniqueSearches.has(key)) {
        uniqueSearches.set(key, []);
      }
      uniqueSearches.get(key).push(alert.id);
    });
  });
  
  console.log(`Deduplicated to ${uniqueSearches.size} unique API calls (from ${alerts.length} alerts)\n`);

  // Build API calls grouped by resort for efficient batching
  const searchesByResort = new Map();
  
  for (const [key, alertIds] of uniqueSearches) {
    const [resortSlug, checkin, checkout, code] = key.split('|');
    
    if (!searchesByResort.has(resortSlug)) {
      searchesByResort.set(resortSlug, []);
    }
    
    searchesByResort.get(resortSlug).push({
      resortSlug,
      checkin,
      checkout,
      code,
      key,
      alertIds
    });
  }
  
  console.log(`Checking ${searchesByResort.size} unique resorts\n`);
  
  // Cache for API results
  const apiCache = new Map();
  
  // Process each resort with all its searches in parallel
  for (const [resortSlug, searches] of searchesByResort) {
    console.log(`\n=== Scraping ${resortSlug} (${searches.length} unique searches) ===`);
    
    // Execute all searches for this resort in parallel
    await Promise.all(
      searches.map(async (search) => {
        console.log(`  API: ${search.code} | ${search.checkin} to ${search.checkout}`);
        const rooms = await fetchDisneyRooms(search.resortSlug, search.code, search.checkin, search.checkout);
        console.log(`  ✓ ${search.code} returned ${rooms.length} rooms`);
        
        // Cache the results
        apiCache.set(search.key, rooms);
      })
    );
    
    // Random delay before next resort
    const totalResorts = searchesByResort.size;
    let currentIndex = Array.from(searchesByResort.keys()).indexOf(resortSlug);
    
    if (currentIndex < totalResorts - 1) {
      // Small delay to avoid hammering the API
      await delay(500); // 0.5 seconds instead of 2-8 seconds
    }
  }
  
  console.log('\n=== Processing Results ===\n');
  
  // Match cached results to all alerts
  let totalMatches = 0;
  
  for (const alert of alerts) {
    let discountCodes = alert.selected_discount_codes || ['room-only'];
    
    // Apply same filters as above
    discountCodes = getValidDiscountCodes(alert.check_in_date, discountCodes);
    
    if (alert.availability_type === 'discounted') {
      discountCodes = discountCodes.filter(code => code !== 'room-only');
      if (discountCodes.length === 0) continue;
    }
    
    for (const code of discountCodes) {
      const key = `${alert.resort_slug}|${alert.check_in_date}|${alert.check_out_date}|${code}`;
      const rooms = apiCache.get(key);
      
      if (!rooms) {
        console.log(`Warning: No cached results for alert ${alert.id} with code ${code}`);
        continue;
      }
      
      const matches = findMatchingRooms(rooms, alert);
      
      if (matches.length > 0) {
        totalMatches += matches.length;
        console.log(`Alert ${alert.id}: Found ${matches.length} matching room(s)`);
        await sendAlertEmail(alert, matches);
      }
    }
  }
  
  console.log(`\nTotal: ${totalMatches} matching rooms found across ${alerts.length} alerts`);
  console.log('=== Scraper Complete ===');
}

// Run the scraper
scrapeResorts().catch(console.error);