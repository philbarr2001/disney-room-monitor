import https from 'https';

async function testDLRAPI() {
  const payload = JSON.stringify({
    checkInDate: "2025-12-06",
    checkOutDate: "2025-12-10",
    partyMix: { adultCount: 2, childCount: 0, nonAdultAges: [] },
    accessible: false,
    affiliations: ["STD_GST"]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'disneyland.disney.go.com',
      path: '/dlr-resort-details-api/api/v1/availability-and-prices/grand-californian-hotel?storeId=dlr&accessible=false',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data.substring(0, 500));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

testDLRAPI().catch(console.error);
