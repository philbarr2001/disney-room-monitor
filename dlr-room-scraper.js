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

function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// DLR Resort slugs
const DLR_RESORTS = [
  'grand-californian-hotel',
  'disneyland-hotel',
  'pixar-place-hotel'
];

// DLR Room code mappings from discovery
const roomMappingsByResort = {
  'grand-californian-hotel': {
    "Standard View": ["13874720"],
    "Woods Courtyard View": ["13874730"],
    "Partial View": ["13874708"],
    "Downtown Disney View": ["17281813"],
    "Pool View": ["13874706"],
    "Standard View - Club Level": ["13874700"],
    "Premium View - Club Level": ["13874696", "19172023", "19172024"],
    "1 Bedroom Suite": ["13874709"],
    "2 Bedroom Suite": ["13874711"],
    "3 Bedroom Suite": ["13874705"],
    "Arroyo Suite - 2 Bedroom": ["412421002"],
    "Arroyo Suite - 3 Bedroom": ["412422862"],
    "Mount Whitney Suite - 2 Bedroom": ["19634028"],
    "Mount Whitney Suite - 3 Bedroom": ["412422881"],
    "El Capitan Suite - 1 Bedroom": ["412422869"],
    "El Capitan Suite - 2 Bedroom": ["19634017"],
    "Arcadia Suite - 1 Bedroom": ["412422819"],
    "Arcadia Suite - 2 Bedrooms": ["19634019"]
  },
  'disneyland-hotel': {
    "Standard View": ["17282273"],
    "Deluxe View": ["17282263"],
    "Premium View": ["17282255"],
    "Premium Downtown Disney View": ["18395697"],
    "Standard View - Club Level": ["13874765"],
    "Premium View - Club Level": ["13933610"],
    "1 Bedroom Junior Suite": ["18684616"],
    "1 Bedroom Family Suite": ["13874748"],
    "2 Bedroom Junior Connecting Suite": ["18684617"],
    "2 Bedroom Family Connecting Suite": ["13874747"],
    "2 Bedroom Family Suite": ["17806652"],
    "3 Bedroom Family Connecting Suite": ["13874743"],
    "Big Thunder Suite - 2 Bedrooms": ["19634000"],
    "Pirate Suite - 2 Bedrooms": ["19633998"],
    "Mickey Mouse Suite - 2 Bedrooms": ["19634002"],
    "Adventureland Suite - 2 Bedrooms": ["19301811"]
  },
  'villas-at-disneyland-hotel': {
    "Duo Studio - Standard View": ["411717882"],
    "Duo Studio - Preferred View": ["411717883"],
    "Duo Studio Garden": ["411717885"],
    "Deluxe Studio - Standard View": ["411700276"],
    "Deluxe Studio - Preferred View": ["411711478"],
    "Deluxe Studio Garden": ["411711480"],
    "1 Bedroom Villa - Preferred View": ["411711477"],
    "2 Bedroom Villa - Preferred View": ["411717877"],
    "3 Bedroom Grand Villa - Preferred View": ["411717880"]
  },
  'pixar-place-hotel': {
    "Standard View": ["17275201"],
    "Premium View": ["17275198"],
    "Standard View - Club Level": ["17274985"],
    "Pool Terrace - Club Level": ["411977970"],
    "Premium View - Club Level": ["17274931"],
    "1 Bedroom Suite": ["17216962"],
    "2 Bedroom Family Connecting Suite": ["17806667"],
    "Pixel Suite - 1 Bedroom": ["412422883"],
    "Sketch Suite - 1 Bedroom": ["412422892"],
    "Pixel Suite - 2 Bedroom": ["19634007"],
    "Sketch Suite - 2 Bedrooms": ["19634005"],
    "Pixel Suite - 3 Bedroom": ["412422887"]
  }
};

// Create reverse mapping: code -> room name
const roomCodeToNameByResort = {};
for (const [resortSlug, roomMap] of Object.entries(roomMappingsByResort)) {
  roomCodeToNameByResort[resortSlug] = {};
  for (const [roomName, codes] of Object.entries(roomMap)) {
    for (const code of codes) {
      roomCodeToNameByResort[resortSlug][code] = roomName;
    }
  }
}

// Get room name from code
function getRoomName(resortSlug, roomCode) {
  return roomCodeToNameByResort[resortSlug]?.[roomCode] || roomCode;
}

// Get all room codes for a category (handles multiple codes like Premium View Club Level)
function getRoomCodes(resortSlug, roomCategory) {
  return roomMappingsByResort[resortSlug]?.[roomCategory] || [];
}

// Standard offer ID (non-discounted)
const STANDARD_OFFER_ID = "7010";

// Fetch room availability from DLR API
async function fetchDLRRooms(resortSlug, checkinDate, checkoutDate) {
  try {
    const response = await fetch(
      `https://disneyland.disney.go.com/dlr-resort-details-api/api/v1/availability-and-prices/${resortSlug}?storeId=dlr&accessible=false`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          checkInDate: checkinDate,
          checkOutDate: checkoutDate,
          accessible: false,
          affiliations: ['STD_GST'],
          partyMix: {
            adultCount: 2,
            childCount: 0,
            nonAdultAges: []
          }
        })
      }
    );

    if (!response.ok) {
      console.log(`  ✗ ${resortSlug} API error: ${response.status}`);
      return { rooms: [], offers: {} };
    }

    const data = await response.json();
    const roomPriceLookup = data.roomPriceLookup || {};
    const marketingOfferLookup = data.marketingOfferLookup || {};

    const rooms = Object.entries(roomPriceLookup).map(([id, room]) => ({
      id,
      ...room
    }));

    return { rooms, offers: marketingOfferLookup };

  } catch (error) {
    console.log(`  ✗ ${resortSlug} fetch error: ${error.message}`);
    return { rooms: [], offers: {} };
  }
}

// Find matching rooms based on alert criteria
function findMatchingRooms(rooms, offers, alert) {
  const matches = [];
  const alertRoomCodes = getRoomCodes(alert.resort_slug, alert.room_category);

  if (alertRoomCodes.length === 0) {
    console.log(`  Warning: No room codes found for ${alert.room_category} at ${alert.resort_slug}`);
    return matches;
  }

  for (const room of rooms) {
    // Check if this room matches any of our target codes
    if (!alertRoomCodes.includes(room.id)) continue;

    // Skip unavailable rooms
    if (room.reasonUnavailable) continue;

    // Skip rooms without pricing
    if (!room.displayPrice?.basePrice?.subtotal) continue;

    const roomPrice = Math.round(parseFloat(room.displayPrice.basePrice.subtotal));
    const isDiscounted = room.marketingOfferId !== STANDARD_OFFER_ID;
    const offerInfo = offers[room.marketingOfferId] || {};

    // Filter based on availability type preference
    if (alert.availability_type === 'discounted' && !isDiscounted) {
      continue; // Skip non-discounted rooms if user wants discounted only
    }

    // Check max price if set
    if (alert.max_price && roomPrice > alert.max_price) continue;

    matches.push({
      roomType: getRoomName(alert.resort_slug, room.id),
      roomCode: room.id,
      price: roomPrice,
      isDiscounted,
      marketingOfferId: room.marketingOfferId,
      offerName: offerInfo.names?.displayName || 'Standard Price',
      offerLongName: offerInfo.names?.longName || ''
    });
  }

  return matches;
}

// Deduplicate matches - prefer discounted over standard
function deduplicateMatches(matches) {
  if (matches.length <= 1) return matches;

  const byRoomType = {};
  for (const match of matches) {
    const key = match.roomType;
    if (!byRoomType[key]) {
      byRoomType[key] = [];
    }
    byRoomType[key].push(match);
  }

  const deduplicated = [];
  for (const roomMatches of Object.values(byRoomType)) {
    // Prefer discounted match
    const discounted = roomMatches.find(m => m.isDiscounted);
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
    .from('dlr_alerts')
    .update(updates)
    .eq('id', alertId);

  if (error) {
    console.log(`  ✗ Failed to update alert ${alertId}: ${error.message}`);
  }
}

// Resort display names
const resortDisplayNames = {
  'grand-californian-hotel': "Disney's Grand Californian Hotel & Spa",
  'disneyland-hotel': "Disneyland Hotel",
  'villas-at-disneyland-hotel': "The Villas at Disneyland Hotel",
  'pixar-place-hotel': "Pixar Place Hotel"
};

// Send email alert
async function sendAlertEmail(alert, matches) {
  const uniqueMatches = deduplicateMatches(matches);
  const hasDiscount = uniqueMatches.some(m => m.isDiscounted);

  // Get best match for display
  const bestMatch = uniqueMatches.find(m => m.isDiscounted) || uniqueMatches[0];

  // Build rate display
  let rateDisplay = `<div style="background:#1BC5D4;color:#fff;display:inline-block;padding:10px 20px;border-radius:25px;font-size:20px;margin-bottom:8px;">$${bestMatch.price}/night</div>`;

  // Build discount section
  let discountSection = '';
  if (hasDiscount) {
    const discountedMatch = uniqueMatches.find(m => m.isDiscounted);
    if (discountedMatch) {
      discountSection = `
        <div style="margin-bottom:20px;padding:15px;background:#f0fdf4;border:2px solid #10b981;border-radius:8px;">
          <h4 style="color:#10b981;margin:0 0 12px 0;font-size:18px;">🎉 Discounted Rate Available!</h4>
          <div style="margin-bottom:10px;padding:12px;background:#ffffff;border-left:4px solid #10b981;border-radius:4px;">
            <strong style="color:#1F202D;font-size:16px;display:block;margin-bottom:4px;">${discountedMatch.offerName}</strong>
            <div style="color:#666;font-size:13px;">${discountedMatch.offerLongName}</div>
          </div>
        </div>`;
    }
  }

  const reservationRow = alert.reservation_number
    ? `<div style="margin-bottom:8px;"><span style="color:#1F202D;font-weight:bold;margin-right:8px;">Reservation #:</span><span style="color:#1F202D;">${alert.reservation_number}</span></div>`
    : '';

  const resortName = resortDisplayNames[alert.resort_slug] || alert.resort_slug;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <!-- Header -->
    <div style="background:#12202D;padding:30px;text-align:center;">
      <img src="http://cdn.mcauto-images-production.sendgrid.net/bde4f566d6ba3b93/edb013f5-7136-417c-abf0-60ea49ab3464/600x300.png"
           alt="Mouse Agents"
           width="150"
           height="75"
           style="width:150px;height:75px;display:block;margin:0 auto 5px;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Room Finder Alert</h1>
      <p style="color:#1BC5D4;margin:5px 0 0 0;font-size:14px;">Disneyland Resort</p>
    </div>

    <div style="padding:20px;">
      <!-- Resort Info Card -->
      <div style="border:3px solid #1BC5D4;padding:25px;text-align:center;margin-bottom:20px;">
        <h2 style="color:#1BC5D4;margin:0 0 10px 0;">${resortName}</h2>
        <h3 style="margin:0 0 10px 0;">${alert.room_category}</h3>
        ${rateDisplay}
        ${hasDiscount ? '<div style="color:#10b981;font-size:14px;margin-top:8px;">✨ Discounted Rate!</div>' : ''}
      </div>

      ${discountSection}

      <!-- Booking Details -->
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

      <!-- Action Buttons -->
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

    <!-- Footer -->
    <div style="background:#1F202D;padding:15px;text-align:center;">
      <p style="color:#fff;font-size:12px;margin:0;">Mouse Agents, Inc.</p>
    </div>
  </div>
</body>
</html>`;

  const msg = {
    to: alert.user_email,
    from: {
      email: 'alerts@mouseagents.com',
      name: 'Mouse Agents Room Finder'
    },
    subject: `🏰 DLR Room Alert: ${resortName}`,
    html: html
  };

  try {
    await sgMail.send(msg);
    console.log(`  ✓ Email sent to ${alert.user_email}`);
  } catch (error) {
    console.log(`  ✗ Email error: ${error.message}`);
  }
}

// Main scraping function
async function scrapeResorts() {
  console.log('\n=== DLR Room Scraper Started ===');
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Fetch active DLR alerts
  const { data: alerts, error } = await supabase
    .from('dlr_alerts')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.log(`Database error: ${error.message}`);
    return;
  }

  console.log(`Found ${alerts.length} active DLR alerts`);

  if (alerts.length === 0) {
    console.log('No active alerts to process');
    return;
  }

  // Group alerts by unique search parameters (resort + dates)
  const uniqueSearches = new Map();

  alerts.forEach(alert => {
    const key = `${alert.resort_slug}|${alert.check_in_date}|${alert.check_out_date}`;
    if (!uniqueSearches.has(key)) {
      uniqueSearches.set(key, {
        resortSlug: alert.resort_slug,
        checkin: alert.check_in_date,
        checkout: alert.check_out_date,
        alertIds: []
      });
    }
    uniqueSearches.get(key).alertIds.push(alert.id);
  });

  console.log(`Deduplicated to ${uniqueSearches.size} unique API calls\n`);

  // Execute API calls and cache results
  const apiCache = new Map();

  for (const [key, search] of uniqueSearches) {
    console.log(`Fetching: ${search.resortSlug} | ${search.checkin} to ${search.checkout}`);

    const { rooms, offers } = await fetchDLRRooms(
      search.resortSlug,
      search.checkin,
      search.checkout
    );

    console.log(`  ✓ Returned ${rooms.length} rooms`);

    apiCache.set(key, { rooms, offers });

    // Rate limiting delay between resorts
    await delay(500);
  }

  console.log('\n=== Processing Results ===\n');

  let totalMatches = 0;
  let totalEmailsSent = 0;

  // Process each alert
  for (const alert of alerts) {
    const key = `${alert.resort_slug}|${alert.check_in_date}|${alert.check_out_date}`;
    const cached = apiCache.get(key);

    if (!cached) {
      await updateAlertTracking(alert.id, false);
      continue;
    }

    const matches = findMatchingRooms(cached.rooms, cached.offers, alert);

    if (matches.length > 0) {
      totalMatches += matches.length;
      const discountedCount = matches.filter(m => m.isDiscounted).length;
      console.log(`Alert ${alert.id}: Found ${matches.length} match(es) (${discountedCount} discounted)`);

      if (shouldSendAlert(alert)) {
        await sendAlertEmail(alert, matches);
        await updateAlertTracking(alert.id, true);
        totalEmailsSent++;
      } else {
        await updateAlertTracking(alert.id, false);
      }
    } else {
      await updateAlertTracking(alert.id, false);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total matches: ${totalMatches}`);
  console.log(`Emails sent: ${totalEmailsSent}`);
  console.log(`=== DLR Scraper Complete ===\n`);
}

// Run the scraper
scrapeResorts().catch(console.error);
