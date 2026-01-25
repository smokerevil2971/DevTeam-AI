/**
 * LLM Integration Test Script
 *
 * To run: npx ts-node packages/agents/test-llm.ts
 *
 * Make sure you have set one of these environment variables:
 * - GEMINI_API_KEY (or GOOGLE_AI_API_KEY)
 * - OPENAI_API_KEY
 * - ANTHROPIC_API_KEY (or CLAUDE_API_KEY)
 */

import {
  createLLMClient,
  createClientFromEnv,
  GeminiProvider,
  estimateTokens,
  CostTracker,
} from './llm';

async function testLLMIntegration() {
  console.log('🧪 Testing LLM Integration...\n');

  // 1. Test token estimation
  console.log('1️⃣ Token Estimation');
  const testText = 'Hello, how are you doing today?';
  const tokens = estimateTokens(testText);
  console.log(`   Text: "${testText}"`);
  console.log(`   Estimated tokens: ${tokens}`);
  console.log('   ✅ Token estimation works!\n');

  // 2. Test cost tracker
  console.log('2️⃣ Cost Tracker');
  const tracker = new CostTracker();
  tracker.record('gemini-2.0-flash', 1000, 500, { agentType: 'test' });
  tracker.record('gpt-4o-mini', 500, 200, { agentType: 'test' });
  const summary = tracker.getSummary();
  console.log(`   Total cost: $${summary.totalCost.toFixed(6)}`);
  console.log(`   Total tokens: ${summary.totalTokens}`);
  console.log(`   Requests: ${summary.requestCount}`);
  console.log('   ✅ Cost tracking works!\n');

  // 3. Test LLM client (if API key available)
  console.log('3️⃣ LLM Client');

  // Check for API keys
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (!geminiKey && !openaiKey && !claudeKey) {
    console.log('   ⚠️  No API key found. Set one of:');
    console.log('      - GEMINI_API_KEY');
    console.log('      - OPENAI_API_KEY');
    console.log('      - ANTHROPIC_API_KEY');
    console.log('   Skipping live API test.\n');
  } else {
    try {
      const client = createClientFromEnv();
      console.log(
        `   Using provider: ${geminiKey ? 'Gemini' : openaiKey ? 'OpenAI' : 'Claude'}`,
      );

      // Test simple chat
      console.log('   Sending test message...');
      const response = await client.chat(
        'You are a helpful assistant. Be very brief.',
        'Say hello in exactly 5 words.',
        { maxTokens: 50 },
      );
      console.log(`   Response: "${response.trim()}"`);

      // Show cost summary
      const costSummary = client.getCostSummary();
      if (costSummary) {
        console.log(`   Cost: $${costSummary.totalCost.toFixed(6)}`);
        console.log(`   Tokens used: ${costSummary.totalTokens}`);
      }

      console.log('   ✅ LLM client works!\n');
    } catch (error) {
      console.log(`   ❌ Error: ${(error as Error).message}\n`);
    }
  }

  // 4. Test streaming (if API key available)
  console.log('4️⃣ Streaming (if API key available)');
  if (geminiKey || openaiKey || claudeKey) {
    try {
      const client = createClientFromEnv();
      console.log('   Streaming response: ');
      process.stdout.write('   "');

      for await (const chunk of client.stream({
        systemPrompt: 'Be very brief.',
        messages: [{ role: 'user', content: 'Count from 1 to 5' }],
        maxTokens: 50,
      })) {
        process.stdout.write(chunk);
      }

      console.log('"\n   ✅ Streaming works!\n');
    } catch (error) {
      console.log(`   ❌ Streaming error: ${(error as Error).message}\n`);
    }
  } else {
    console.log('   ⚠️  Skipped (no API key)\n');
  }

  console.log('🎉 LLM Integration Test Complete!\n');
}

// Run the test
testLLMIntegration().catch(console.error);
