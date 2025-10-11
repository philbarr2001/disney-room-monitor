// Debug test - see raw room data

async function debugBoardwalk() {
  const response = await fetch(
    'https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/boardwalk-inn/availability-and-prices/?storeId=wdw',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        checkInDate: '2025-10-18',
        checkOutDate: '2025-10-25',
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
  
  if (response.status === 200) {
    const data = await response.json();
    const rooms = data.roomPriceLookup || {};
    
    console.log('All rooms returned:\n');
    
    Object.entries(rooms).forEach(([id, room]) => {
      console.log(`ID: ${id}`);
      console.log(`  room.code: ${room.code}`);
      console.log(`  Available: ${!room.reasonUnavailable}`);
      console.log(`  Price: $${room.displayPrice?.basePrice?.subtotal || 'N/A'}`);
      console.log('');
    });
  }
}

debugBoardwalk().catch(console.error);