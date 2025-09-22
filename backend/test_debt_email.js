// Test script to trigger debt milestone email
const emailAutomationService = require('./services/emailAutomationService');

async function testDebtMilestoneEmail() {
  try {
    console.log('Testing debt milestone email automation...');
    
    // Get the user ID (assuming you're the first user)
    const userId = 1; // Adjust this to your actual user ID
    
    // Test data for first debt paid off
    const milestoneData = {
      milestoneType: 'first_debt_paid',
      debtName: 'Debt 2',
      amount: 500.00,
      percentage: 50, // Assuming this was 50% of total debt
      totalDebt: 1000.00,
      remainingDebt: 500.00
    };
    
    console.log('Triggering debt milestone email with data:', milestoneData);
    
    await emailAutomationService.triggerDebtMilestone(userId, milestoneData);
    
    console.log('✅ Debt milestone email triggered successfully!');
    console.log('Check your email inbox for the celebration message.');
    
  } catch (error) {
    console.error('❌ Error testing debt milestone email:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

testDebtMilestoneEmail();
