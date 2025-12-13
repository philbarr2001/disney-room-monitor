import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';  
import 'dotenv/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// Initialize SendGrid 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to format dates as MM-DD-YYYY
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// Map internal slugs to Disney API slugs
const slugToDisneyAPI = {
  'animal-kingdom-villas-jambo': 'animal-kingdom-lodge',
  'animal-kingdom-villas-kidani': 'animal-kingdom-lodge',
  'polynesian-village-resort': 'polynesian-villas-bungalows',
};

function getDisneyAPISlug(internalSlug) {
  return slugToDisneyAPI[internalSlug] || internalSlug;
}
function getDisneyAPISlug(internalSlug) {
  return slugToDisneyAPI[internalSlug] || internalSlug;
}

// Get correct Fort Wilderness room code based on check-in date
function getFortWildernessRoomCode(roomCategory, checkInDate) {
  const checkIn = new Date(checkInDate);
  const cutoffDate = new Date('2026-01-01T00:00:00');
  const use2026Codes = checkIn >= cutoffDate;
  
  const codes2025 = {
    'Tent or Pop-Up Campsite': 'FB',
    'Full Hook-Up Campsite': 'FD',
    'Preferred Campsite': 'FA',
    'Premium Campsite': 'ZZ',
    'Premium Meadow Campsite': 'FP'
  };
  
  const codes2026 = {
    'Tent or Pop-Up Campsite': 'AG0',
    'Full Hook-Up Campsite': 'AG1',
    'Preferred Campsite': 'AG2',
    'Premium Campsite': 'AG3',
    'Premium Meadow Campsite': 'AG4'
  };
  
  return use2026Codes ? codes2026[roomCategory] : codes2025[roomCategory];
}

// Complete room code mappings from Apify
const roomMappingsByResort = {
  
// Complete room code mappings from Apify
const roomMappingsByResort = {
  'all-star-movies-resort': { "Preferred Room": "EP", "Standard Room": "EA" },
  'all-star-music-resort': { "Standard Room": "AA", "Preferred Room": "AP", "Family Suite": "AB" },
  'all-star-sports-resort': { "Standard Room": "SA", "Preferred Room": "SP" },
  'animal-kingdom-lodge': { "Savanna View - King Bed - Club Level": "1V", "Savanna View - King Bed": "7F", "Resort View - King Bed": "BB", "Water View - King Bed": "ZV", "Savanna View": "QC", "Resort View": "QA", "Water View": "QB", "Resort View - 1 BR Suite - Club Level": "QM", "Savanna View - Club Level": "QG", "Savanna View - 1 BR Suite - Club Level": "Q1", "2-Bedroom Suite - Club Level": "Q2", "Royal Asante Presidential Suite - Club Level": "QP" },
  'animal-kingdom-villas-jambo': { "Deluxe Studio - Savanna View (Jambo)": "U2", "1 Bedroom Villa - Savanna View (Jambo)": "U3", "3 Bedroom Grand Villa - Savanna View (Jambo)": "U5", "Studio - Value (Jambo)": "U7", "1 Bedroom Villa - Value (Jambo)": "U8", "Deluxe Studio - Resort View (Jambo)": "UR", "1 Bedroom Villa - Resort View (Jambo)": "US", "Deluxe Studio - Club Level (Jambo)": "UX", "1 Bedroom Villa - Club Level (Jambo)": "UY" },
  'animal-kingdom-villas-kidani': { "Deluxe Studio - Savanna View (Kidani)": "AU", "1 Bedroom Villa - Savanna View (Kidani)": "BU", "2 Bedroom Villa - Savanna View (Kidani)": "CU", "3 Bedroom Grand Villa - Savanna View (Kidani)": "DU", "Deluxe Studio - Resort View (Kidani)": "UA", "1 Bedroom Villa - Resort View (Kidani)": "UB", "2 Bedroom Villa - Resort View (Kidani)": "UC", "3 Bedroom Grand Villa - Resort View (Kidani)": "UD" },
  'art-of-animation-resort': { "The Little Mermaid Standard Room": "VA", "Family Suite": "VS", "The Lion King Family Suite": "VL", "Cars Family Suite": "VC", "Finding Nemo Family Suite": "VN" },
  'bay-lake-tower-at-contemporary': { "Deluxe Studio - Theme Park View": "4A", "1-Bedroom Villa - Theme Park View": "4B", "2-Bedroom Villa - Theme Park View": "4C", "3-Bedroom Grand Villa - Theme Park View": "4D", "1 Bedroom Villa - Preferred View": "4O", "Deluxe Studio - Preferred View": "4S", "2 Bedroom Villa - Preferred View": "4T", "3 Bedroom Grand Villa - Preferred View": "4V", "Deluxe Studio - Resort View": "4W", "1 Bedroom Villa - Resort View": "4X", "2 Bedroom Villa - Resort View": "4Y" },
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
  'campsites-at-fort-wilderness-resort': { "Tent or Pop-Up Campsite": "FB", "Full Hook-Up Campsite": "FD", "Preferred Campsite": "FA", "Premium Campsite": "ZZ", "Premium Meadow Campsite": "FP"},  
  'villas-at-grand-floridian-resort-and-spa': { "Deluxe Studio - Preferred View": "81", "1 Bedroom Villa - Preferred View": "82", "2 Bedroom Villa - Preferred View": "83", "3 Bedroom Grand Villa - Preferred View": "85", "Deluxe Studio - Resort View": "86", "1 Bedroom Villa - Resort View": "87", "2 Bedroom Villa - Resort View": "88", "Resort Studio - Resort View": "AAI", "Resort Studio - Preferred View": "AAN", "Resort Studio - Theme Park View": "AAT" },
  'wilderness-lodge-resort': { "Fireworks View": "JZ", "Resort View": "JB", "Resort View - King Bed": "Z3", "Water View": "JC", "Water View - King Bed": "Z9", "Fireworks View - King Bed": "Z5", "Resort View - Club Level": "JD", "Deluxe Room - Club Level Access": "JS", "Resort View - King Bed - Club Level": "ZS" },
  'yacht-club-resort': { "2 Bedroom Suite - Club Level Access": "Y2", "Resort View": "YC", "Water View": "YD", "Water View - Club Level": "YG", "Captain's Deck Suite - Club Level Access": "YH", "Resort View - Club Level": "YK", "Turret Suite - Club Level Access": "YT", "Commodore VP Suite - Club Level": "YV" }
};

// Create reverse mapping: code -> room name
const roomCodeToNameByResort = {};
for (const [resortSlug, roomMap] of Object.entries(roomMappingsByResort)) {
  roomCodeToNameByResort[resortSlug] = {};
  
  // Special handling for Fort Wilderness - add both 2025 and 2026 codes
  if (resortSlug === 'campsites-at-fort-wilderness-resort') {
    const codes2025 = {
      'FB': 'Tent or Pop-Up Campsite',
      'FD': 'Full Hook-Up Campsite',
      'FA': 'Preferred Campsite',
      'ZZ': 'Premium Campsite',
      'FP': 'Premium Meadow Campsite'
    };
    
    const codes2026 = {
      'AG0': 'Tent or Pop-Up Campsite',
      'AG1': 'Full Hook-Up Campsite',
      'AG2': 'Preferred Campsite',
      'AG3': 'Premium Campsite',
      'AG4': 'Premium Meadow Campsite'
    };
    
    roomCodeToNameByResort[resortSlug] = { ...codes2025, ...codes2026 };
  } else {
    for (const [roomName, code] of Object.entries(roomMap)) {
      roomCodeToNameByResort[resortSlug][code] = roomName;
    }
  }
}

// Helper function to get room name from code
function getRoomName(resortSlug, roomCode) {
  return roomCodeToNameByResort[resortSlug]?.[roomCode] || roomCode;
}

// Discount code validity periods
const discountCodePeriods = {
  '11296': { start: new Date('2025-10-01'), end: new Date('2025-12-31') },
  '11313': { start: new Date('2026-01-01'), end: new Date('2026-05-31') },
  '11316': { start: new Date('2026-01-01'), end: new Date('2026-07-31') }
};

// Filter discount codes based on check-in date
function getValidDiscountCodes(checkinDate, selectedCodes) {
  const checkin = new Date(checkinDate);
  const validCodes = [];
  
  for (const code of selectedCodes) {
    if (code === 'room-only') {
      validCodes.push(code);
      continue;
    }
    
    const period = discountCodePeriods[code];
    if (!period) {
      validCodes.push(code);
      continue;
    }
    
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
  let alertRoomCodeRaw = roomMappingsByResort[alert.resort_slug]?.[alert.room_category];
  
  if (!alertRoomCodeRaw) {
    console.log(`  Warning: No room code found for ${alert.room_category} at ${alert.resort_slug}`);
    return matches;
  }
  
  // Special handling for Fort Wilderness - select correct code based on check-in date
  if (alert.resort_slug === 'campsites-at-fort-wilderness-resort') {
    const correctCode = getFortWildernessRoomCode(alert.room_category, alert.check_in_date);
    alertRoomCodeRaw = correctCode;
    console.log(`  Fort Wilderness: Using code ${correctCode} for ${alert.room_category} (check-in: ${alert.check_in_date})`);
  }
  
  // Support both single codes and arrays of codes (for future use)
  const alertRoomCodes = Array.isArray(alertRoomCodeRaw) ? alertRoomCodeRaw : [alertRoomCodeRaw];
  
  for (const room of rooms) {
    if (!alertRoomCodes.includes(room.code)) continue;
    if (room.reasonUnavailable) continue;
    if (!room.displayPrice?.basePrice?.subtotal) continue;
    
    const roomPrice = Math.round(room.displayPrice.basePrice.subtotal);
    
    if (alert.availability_type === 'discounted') {
      if (room.discountCode === 'room-only') continue;
    }
    
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

// Deduplicate matches - prefer discounted over room-only
function deduplicateMatches(matches) {
  if (matches.length <= 1) return matches;
  
  const byRoomType = {};
  for (const match of matches) {
    const key = `${match.roomType}`;
    if (!byRoomType[key]) {
      byRoomType[key] = [];
    }
    byRoomType[key].push(match);
  }
  
  const deduplicated = [];
  for (const roomMatches of Object.values(byRoomType)) {
    const discounted = roomMatches.find(m => m.discountCode !== 'room-only');
    if (discounted) {
      deduplicated.push(discounted);
    } else {
      deduplicated.push(roomMatches[0]);
    }
  }
  
  return deduplicated;
}

// Check if we should send an alert (2-hour cooldown)
function shouldSendAlert(alert) {
  if (!alert.last_notification_sent) {
    return true;
  }
  
  const lastNotification = new Date(alert.last_notification_sent);
  const now = new Date();
  const hoursSince = (now - lastNotification) / (1000 * 60 * 60);
  
  if (hoursSince >= 2) {
    return true;
  }
  
  console.log(`  ⏱️  Skipping alert ${alert.id} - last sent ${hoursSince.toFixed(1)} hours ago`);
  return false;
}

// Update alert tracking in Supabase
async function updateAlertTracking(alertId, sentEmail) {
  const updates = {
    last_checked_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  if (sentEmail) {
    updates.last_notification_sent = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('alerts')
    .update(updates)
    .eq('id', alertId);
  
  if (error) {
    console.log(`  ✗ Failed to update alert ${alertId}: ${error.message}`);
  }
}

// Discount code labels
const discountLabels = {
  '11296': 'Fall 2025 Discount',
  '11313': 'Spring 2026 Discount',
  '11316': 'Package Discount'
};

// Send email alert
async function sendAlertEmail(alert, matches, roomOnlyMatches = null) {
  const uniqueMatches = deduplicateMatches(matches);
  const hasDiscount = uniqueMatches.some(m => m.discountCode !== 'room-only');
  
  // Determine what price to show
  let rateDisplay = '';
  const roomOnlyMatch = uniqueMatches.find(m => m.discountCode === 'room-only');
  
  if (roomOnlyMatch) {
    rateDisplay = `<div style="background:#1BC5D4;color:#fff;display:inline-block;padding:10px 20px;border-radius:25px;font-size:20px;margin-bottom:8px;">$${roomOnlyMatch.price}/night</div>`;
  }
  
  // Build discount section
  let discountSection = '';
  if (hasDiscount) {
    const discountItems = [];
    const discountsByCode = new Map();
    
    for (const match of uniqueMatches) {
      if (match.discountCode === 'room-only') continue;
      if (!discountsByCode.has(match.discountCode)) {
        discountsByCode.set(match.discountCode, match);
      }
    }
    
    for (const [code, match] of discountsByCode) {
      const discountLabel = discountLabels[code] || 'Promotional Discount';
      let discountDetails = '';
      
      if (roomOnlyMatches && roomOnlyMatches.length > 0) {
        const roomOnlyMatch = roomOnlyMatches.find(m => m.roomType === match.roomType);
        
        if (roomOnlyMatch && roomOnlyMatch.price > match.price) {
          const savings = roomOnlyMatch.price - match.price;
          discountDetails = `<div style="color:#10b981;font-size:14px;font-weight:600;">Save $${savings} per night!</div><div style="color:#666;font-size:13px;margin-top:4px;">Was $${roomOnlyMatch.price}/night, now $${match.price}/night</div>`;
        } else {
          discountDetails = `<div style="color:#10b981;font-size:14px;font-weight:600;">Check DTA for pricing!</div>`;
        }
      } else {
        discountDetails = `<div style="color:#10b981;font-size:14px;font-weight:600;">Check DTA for pricing!</div>`;
      }
      
      discountItems.push(`<div style="margin-bottom:10px;padding:12px;background:#ffffff;border-left:4px solid #10b981;border-radius:4px;"><strong style="color:#1F202D;font-size:16px;display:block;margin-bottom:4px;">${discountLabel}</strong>${discountDetails}</div>`);
    }
    
    if (discountItems.length > 0) {
      discountSection = `<div style="margin-bottom:20px;padding:15px;background:#f0fdf4;border:2px solid #10b981;border-radius:8px;"><h4 style="color:#10b981;margin:0 0 12px 0;font-size:18px;">Available Discounts:</h4>${discountItems.join('')}</div>`;
    }
  }
  
  const reservationRow = alert.reservation_number 
    ? `<div style="margin-bottom:8px;"><span style="color:#1F202D;font-weight:bold;margin-right:8px;">Reservation #:</span><span style="color:#1F202D;">${alert.reservation_number}</span></div>`
    : '';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#12202D;padding:30px;text-align:center;">
      <img src="http://cdn.mcauto-images-production.sendgrid.net/bde4f566d6ba3b93/edb013f5-7136-417c-abf0-60ea49ab3464/600x300.png" 
           alt="Mouse Agents" 
           width="150" 
           height="75" 
           style="width:150px;height:75px;display:block;margin:0 auto 5px;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Room Finder Alert</h1>
    </div>
    
    <div style="padding:20px;">
      <div style="border:3px solid #1BC5D4;padding:25px;text-align:center;margin-bottom:20px;">
        <h2 style="color:#1BC5D4;margin:0 0 10px 0;">${alert.resort_name}</h2>
        <h3 style="margin:0 0 10px 0;">${alert.room_category}</h3>
        ${rateDisplay}
      </div>
      
      ${discountSection}
      
      <div style="text-align:center;margin:20px 0;">
        <div style="margin-bottom:8px;">
          <span style="color:#1F202D;font-weight:bold;margin-right:8px;">Check-in:</span>
          <span style="color:#1F202D;">${formatDate(alert.check_in_date)}</span>
        </div>
        <div style="margin-bottom:8px;">
          <span style="color:#1F202D;font-weight:bold;margin-right:8px;">Check-out:</span>
          <span style="color:#1F202D;">${formatDate(alert.check_out_date)}</span>
        </div>
        <div style="margin-bottom:8px;">
          <span style="color:#1F202D;font-weight:bold;margin-right:8px;">Client:</span>
          <span style="color:#1F202D;">${alert.client_name}</span>
        </div>
        ${reservationRow}
      </div>
      
      <div style="text-align:center;margin:20px 0;">
        <a href="https://www.disneytravelagents.com/" 
           style="background:#1BC5D4;color:#fff;text-decoration:none;padding:12px 25px;border-radius:5px;display:inline-block;margin-right:10px;">
          Reserve This Room
        </a>
        <a href="https://mouseagents.com/room-finder/dashboard/" 
           style="background:#1F202D;color:#fff;text-decoration:none;padding:12px 25px;border-radius:5px;display:inline-block;">
          Manage Alerts
        </a>
      </div>
    </div>
    
    <div style="background:#1F202D;padding:15px;text-align:center;">
      <p style="color:#fff;font-size:12px;margin:0;">Mouse Agents, Inc.</p>
    </div>
  </div>
</body>
</html>`;

  const subject = `Room Finder Alert: ${alert.resort_name}`;

try {
    const msg = {
      to: alert.user_email,
      from: {
        email: 'alerts@mouseagents.com',
        name: 'Mouse Agents Room Finder'
      },
      subject: subject,
      html: html
    };
    await sgMail.send(msg);

    console.log(`  ✓ Email sent to ${alert.user_email}`);
  } catch (error) {
    console.log(`  ✗ Email error: ${error.message}`);
  }
}

// Main scraping function
async function scrapeResorts() {
  console.log('\n=== Disney Scraper Started ===');
  console.log(`Time: ${new Date().toISOString()}\n`);

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active');

  if (error) throw error;
  
  console.log(`Found ${alerts.length} active alerts`);
  
  const uniqueSearches = new Map();
  
  alerts.forEach(alert => {
    let discountCodes = alert.selected_discount_codes || ['room-only'];
    discountCodes = getValidDiscountCodes(alert.check_in_date, discountCodes);
    
    if (discountCodes.length === 0) return;
    
    if (alert.availability_type === 'discounted') {
      discountCodes = discountCodes.filter(code => code !== 'room-only');
      if (discountCodes.length === 0) return;
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
  
  const apiCache = new Map();
  
  // Sequential requests with randomized delays to avoid rate limiting
  for (const [resortSlug, searches] of searchesByResort) {
    console.log(`\n=== Scraping ${resortSlug} (${searches.length} unique searches) ===`);
    
    for (const search of searches) {
      console.log(`  API: ${search.code} | ${search.checkin} to ${search.checkout}`);
      const rooms = await fetchDisneyRooms(search.resortSlug, search.code, search.checkin, search.checkout);
      console.log(`  ✓ ${search.code} returned ${rooms.length} rooms`);
      apiCache.set(search.key, rooms);
      
      // Randomized delay between requests (1.5-2.5 seconds)
      await delay(1500 + Math.random() * 1000);
    }
    
    // Longer randomized delay between resorts (3-5 seconds)
    await delay(3000 + Math.random() * 2000);
  }
  
  console.log('\n=== Processing Results ===\n');
  
  let totalMatches = 0;
  let totalEmailsSent = 0;
  
  for (const alert of alerts) {
    let discountCodes = alert.selected_discount_codes || ['room-only'];
    discountCodes = getValidDiscountCodes(alert.check_in_date, discountCodes);
    
    if (alert.availability_type === 'discounted') {
      discountCodes = discountCodes.filter(code => code !== 'room-only');
      if (discountCodes.length === 0) {
        await updateAlertTracking(alert.id, false);
        continue;
      }
    }
    
    let allMatches = [];
    let hasDiscountCode = false;
    
    for (const code of discountCodes) {
      const key = `${alert.resort_slug}|${alert.check_in_date}|${alert.check_out_date}|${code}`;
      const rooms = apiCache.get(key);
      
      if (!rooms) continue;
      
      const matches = findMatchingRooms(rooms, alert);
      allMatches = allMatches.concat(matches);
      
      if (code !== 'room-only') {
        hasDiscountCode = true;
      }
    }
    
    if (allMatches.length > 0) {
      totalMatches += allMatches.length;
      console.log(`Alert ${alert.id}: Found ${allMatches.length} matching room(s)`);
      
      if (shouldSendAlert(alert)) {
        let roomOnlyMatches = null;
        if (hasDiscountCode) {
          const roomOnlyKey = `${alert.resort_slug}|${alert.check_in_date}|${alert.check_out_date}|room-only`;
          const roomOnlyRooms = apiCache.get(roomOnlyKey);
          
          if (roomOnlyRooms) {
            roomOnlyMatches = findMatchingRooms(roomOnlyRooms, alert);
          }
        }
        
        await sendAlertEmail(alert, allMatches, roomOnlyMatches);
        await updateAlertTracking(alert.id, true);
        totalEmailsSent++;
      } else {
        await updateAlertTracking(alert.id, false);
      }
    } else {
      await updateAlertTracking(alert.id, false);
    }
  }
  
  console.log(`\nTotal: ${totalMatches} matching rooms found across ${alerts.length} alerts`);
  console.log(`Emails sent: ${totalEmailsSent}`);
  console.log('=== Scraper Complete ===');
}

// Run the scraper
scrapeResorts().catch(console.error);
