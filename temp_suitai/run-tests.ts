#!/usr/bin/env tsx

import testSessionUpdateEndpoint from './__tests__/session-update-endpoint.test';

async function runTests() {
  await testSessionUpdateEndpoint();
}

runTests();
