require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testSupabase() {
  console.log('Testing Supabase connection...\n');
  
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')
    .limit(3);
  
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log(`✅ Success! Found ${alerts.length} active alerts\n`);
  
  alerts.forEach(alert => {
    console.log(`Alert: ${alert.client_name}`);
    console.log(`  Resort: ${alert.resort_name}`);
    console.log(`  Room: ${alert.room_category}`);
    console.log(`  Dates: ${alert.check_in_date} to ${alert.check_out_date}`);
    console.log(`  Type: ${alert.availability_type}`);
    console.log('');
  });
}

testSupabase().catch(console.error);
