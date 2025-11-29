// Mock DOM elements
const roleHeaderLevelSelect = { value: '3' };
const topContentHeaderLevelSelect = { value: '0' };
const wrapInCodeBlockCheckbox = { checked: false };

// Mock convertToMarkdown function (copied from main.js with minor adjustments for node)
const convertToMarkdown = (data, originalName) => {
    const roleHeaderLevel = parseInt(roleHeaderLevelSelect.value, 10);
    const topContentHeaderLevel = parseInt(topContentHeaderLevelSelect.value, 10);
    const wrapInCodeBlock = wrapInCodeBlockCheckbox.checked;
    const roleHeaderHashes = '#'.repeat(roleHeaderLevel);

    let md = `# Conversation Log from ${originalName}\n\n`;

    data.chunkedPrompt.chunks.forEach(chunk => {
        const role = chunk.role;
        let text = chunk.text;
        const isThought = chunk.isThought || false;

        if (!text) return;

        // Apply content transformations
        if (wrapInCodeBlock) {
            text = `\`\`\`text\n${text}\n\`\`\``;
        } else {
            // Shift headers if not wrapped in code block
            const shiftAmount = topContentHeaderLevel; // Value is now relative (e.g., -1, 0, 1)
            if (shiftAmount !== 0) {
                text = text.split('\n').map(line => {
                    const headerMatch = line.match(/^(\#{1,6})\s+(.*)/);
                    if (headerMatch) {
                        const currentLevel = headerMatch[1].length;
                        let newLevel = currentLevel + shiftAmount;

                        // Clamp to H1 if it goes below 1
                        if (newLevel < 1) newLevel = 1;

                        if (newLevel <= 6) {
                            return `${'#'.repeat(newLevel)} ${headerMatch[2]}`;
                        } else {
                            // Overflow strategy: Convert to bold
                            return `**${headerMatch[2]}**`;
                        }
                    }
                    return line;
                }).join('\n');
            }
        }

        if (role === 'user') {
            md += `${roleHeaderHashes} 👤 User\n\n${text}\n\n---\n\n`;
        } else if (role === 'model') {
            if (isThought) {
                md += `${roleHeaderHashes} 🧠 Model (Thought)\n\n*Thought process:*\n\`\`\`\n${text}\n\`\`\`\n\n`;
            } else {
                md += `${roleHeaderHashes} ▶️ Model (Answer)\n\n${text}\n\n---\n\n`;
            }
        }
    });
    return md;
};

// Test Data
const testData = {
    chunkedPrompt: {
        chunks: [
            { role: 'user', text: 'Hello' },
            { role: 'model', text: '# Header 1\n## Header 2\nNormal text' }
        ]
    }
};

// Test 1: Default Settings (Role H3, Content Shift 0)
console.log('--- Test 1: Default Settings (Shift 0) ---');
roleHeaderLevelSelect.value = '3';
topContentHeaderLevelSelect.value = '0';
wrapInCodeBlockCheckbox.checked = false;
console.log(convertToMarkdown(testData, 'Test1'));

// Test 2: Role H1, Content Shift +1
console.log('\n--- Test 2: Role H1, Content Shift +1 ---');
roleHeaderLevelSelect.value = '1';
topContentHeaderLevelSelect.value = '1'; // Shift +1
console.log(convertToMarkdown(testData, 'Test2'));

// Test 3: Negative Shift (Clamp to H1)
console.log('\n--- Test 3: Negative Shift (-2) ---');
// Input has H1 and H2. H1 - 2 = -1 -> Clamp to H1. H2 - 2 = 0 -> Clamp to H1.
roleHeaderLevelSelect.value = '3';
topContentHeaderLevelSelect.value = '-2';
console.log(convertToMarkdown(testData, 'Test3'));

// Test 4: Wrap in Code Block
console.log('\n--- Test 4: Wrap in Code Block ---');
wrapInCodeBlockCheckbox.checked = true;
console.log(convertToMarkdown(testData, 'Test4'));

// Test 5: Header Overflow (H6 + 1 -> Bold)
console.log('\n--- Test 5: Header Overflow ---');
const overflowData = {
    chunkedPrompt: {
        chunks: [
            { role: 'model', text: '###### Header 6' }
        ]
    }
};
roleHeaderLevelSelect.value = '3';
topContentHeaderLevelSelect.value = '1'; // Shift +1
wrapInCodeBlockCheckbox.checked = false;
console.log(convertToMarkdown(overflowData, 'Test5'));
