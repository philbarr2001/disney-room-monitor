async function testWDWAPI() {
  const payload = {
    checkInDate: "2025-12-06",
    checkOutDate: "2025-12-10",
    partyMix: { adultCount: 2, childCount: 0, nonAdultAges: [] },
    region: "US",
    accessible: false,
    personalizationId: "abc123xyz",
    sendOffersCarousel: true,
    marketingOfferId: "room-only",
    affiliations: ["STD_GST"],
    postalCode: "02101"
  };

  console.log("Testing WDW API...");

  const response = await fetch(
    "https://disneyworld.disney.go.com/wdw-resorts-details-api/api/v1/resort/contemporary-resort/availability-and-prices/?storeId=wdw",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify(payload)
    }
  );

  console.log("WDW Status:", response.status);
  const text = await response.text();
  console.log("WDW Response:", text.substring(0, 300));
}

testWDWAPI().catch(console.error);
