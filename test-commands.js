#!/usr/bin/env node
/**
 * Comprehensive test script for NNTP commands using test data
 */

const net = require('net');

class NNTPTestClient {
    constructor(host = 'localhost', port = 5555) {
        this.host = host;
        this.port = port;
        this.client = null;
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.client = new net.Socket();
            
            this.client.connect(this.port, this.host, () => {
                console.log(`\n✓ Connected to ${this.host}:${this.port}\n`);
                resolve();
            });

            this.client.on('error', (err) => {
                reject(err);
            });
        });
    }

    async sendCommand(command, description) {
        return new Promise((resolve, reject) => {
            let buffer = '';
            let complete = false;

            const dataHandler = (data) => {
                buffer += data.toString();
                
                // Check if response is complete
                if (buffer.includes('\r\n.\r\n') || 
                    (buffer.match(/\r\n/g) || []).length >= 1 && 
                    !buffer.includes('follows') && 
                    !buffer.includes('list:') &&
                    !command.startsWith('LIST')) {
                    if (!complete) {
                        complete = true;
                        this.client.removeListener('data', dataHandler);
                        
                        // Log the test
                        console.log(`\n━━━ ${description} ━━━`);
                        console.log(`Command: ${command}`);
                        console.log(`Response:\n${buffer.trim()}\n`);
                        
                        resolve(buffer);
                    }
                }
            };

            this.client.on('data', dataHandler);
            this.client.write(command + '\r\n');

            setTimeout(() => {
                if (!complete) {
                    complete = true;
                    this.client.removeListener('data', dataHandler);
                    resolve(buffer);
                }
            }, 2000);
        });
    }

    test(name, condition, actual, expected) {
        if (condition) {
            this.results.passed++;
            this.results.tests.push(`✓ ${name}`);
            return true;
        } else {
            this.results.failed++;
            this.results.tests.push(`✗ ${name} (expected: ${expected}, got: ${actual})`);
            return false;
        }
    }

    disconnect() {
        if (this.client) {
            this.client.destroy();
        }
    }

    printResults() {
        console.log('\n' + '═'.repeat(70));
        console.log('TEST RESULTS');
        console.log('═'.repeat(70) + '\n');
        
        this.results.tests.forEach(test => console.log(test));
        
        console.log('\n' + '─'.repeat(70));
        console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        console.log('═'.repeat(70) + '\n');
    }
}

async function runTests() {
    const client = new NNTPTestClient();
    
    try {
        await client.connect();

        // Wait for greeting
        const greeting = await new Promise((resolve) => {
            client.client.once('data', (data) => {
                console.log('Server Greeting:', data.toString().trim());
                resolve(data.toString());
            });
        });

        console.log('\n' + '═'.repeat(70));
        console.log('NNTP SERVER TEST SUITE - Testing with test-group.testserver');
        console.log('═'.repeat(70));

        // Test 1: CAPABILITIES
        let resp = await client.sendCommand('CAPABILITIES', 'CAPABILITIES command');
        client.test('CAPABILITIES returns 101', resp.includes('101'), resp.substring(0, 3), '101');

        // Test 2: LIST
        resp = await client.sendCommand('LIST', 'LIST command');
        client.test('LIST returns 215', resp.includes('215'), resp.substring(0, 3), '215');
        client.test('LIST includes test-group', resp.includes('test-group.testserver'), 'found', 'test-group.testserver');

        // Test 3: GROUP
        resp = await client.sendCommand('GROUP test-group.testserver', 'GROUP command');
        client.test('GROUP returns 211', resp.includes('211'), resp.substring(0, 3), '211');
        client.test('GROUP shows 3 articles', resp.includes('3'), 'found', '3 articles');

        // Test 4: LISTGROUP
        resp = await client.sendCommand('LISTGROUP test-group.testserver', 'LISTGROUP command');
        client.test('LISTGROUP returns 211', resp.includes('211'), resp.substring(0, 3), '211');
        client.test('LISTGROUP shows article 1', resp.includes('\n1\r\n'), 'found', 'article 1');

        // Test 5: ARTICLE
        resp = await client.sendCommand('ARTICLE 1', 'ARTICLE 1 command');
        client.test('ARTICLE returns 220', resp.includes('220'), resp.substring(0, 3), '220');
        client.test('ARTICLE includes headers', resp.includes('From:'), 'found', 'headers');
        client.test('ARTICLE includes body', resp.includes('first test article'), 'found', 'body text');

        // Test 6: HEAD
        resp = await client.sendCommand('HEAD 2', 'HEAD 2 command');
        client.test('HEAD returns 221', resp.includes('221'), resp.substring(0, 3), '221');
        client.test('HEAD includes Subject', resp.includes('Subject:'), 'found', 'Subject header');
        client.test('HEAD excludes body', !resp.includes('This is a reply'), 'excluded', 'body text');

        // Test 7: BODY
        resp = await client.sendCommand('BODY 3', 'BODY 3 command');
        client.test('BODY returns 222', resp.includes('222'), resp.substring(0, 3), '222');
        client.test('BODY includes text', resp.includes('Welcome'), 'found', 'body text');
        client.test('BODY excludes headers', !resp.includes('From:'), 'excluded', 'headers');

        // Test 8: STAT
        resp = await client.sendCommand('STAT 1', 'STAT 1 command');
        client.test('STAT returns 223', resp.includes('223'), resp.substring(0, 3), '223');

        // Test 9: XOVER
        resp = await client.sendCommand('XOVER 1-3', 'XOVER 1-3 command');
        client.test('XOVER returns 224', resp.includes('224'), resp.substring(0, 3), '224');
        client.test('XOVER returns overview data', resp.includes('Test Article'), 'found', 'overview data');

        // Test 10: DATE
        resp = await client.sendCommand('DATE', 'DATE command');
        client.test('DATE returns 111', resp.includes('111'), resp.substring(0, 3), '111');

        // Test 11: HELP
        resp = await client.sendCommand('HELP', 'HELP command');
        client.test('HELP returns 100', resp.includes('100'), resp.substring(0, 3), '100');

        // Test 12: MODE READER
        resp = await client.sendCommand('MODE READER', 'MODE READER command');
        client.test('MODE READER accepted', resp.includes('201') || resp.includes('200'), 'accepted', '200/201');

        // Test 13: LIST OVERVIEW.FMT (RFC 3977)
        resp = await client.sendCommand('LIST OVERVIEW.FMT', 'LIST OVERVIEW.FMT command');
        client.test('LIST OVERVIEW.FMT returns format', resp.includes('Subject:'), 'found', 'overview format');

        // Test 14: QUIT
        resp = await client.sendCommand('QUIT', 'QUIT command');
        client.test('QUIT returns 205', resp.includes('205'), resp.substring(0, 3), '205');

        client.printResults();
        
        return client.results.failed === 0;

    } catch (err) {
        console.error('\n✗ Test error:', err.message);
        client.disconnect();
        return false;
    }
}

// Run tests
console.log('\nStarting NNTP Server Test Suite...\n');
console.log('Make sure the server is running: node server.js\n');

runTests().then(success => {
    process.exit(success ? 0 : 1);
});
