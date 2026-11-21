// Test: Compare Mode export + standaard export + fallback
// Uitvoering: node test_compare.js

global.document = { addEventListener: () => {} };
global.window = {};

const { extractRuns, convertToMarkdown } = require('./aistudioreader/main.js');
const fs = require('fs');
const path = require('path');

const defaultOpts = {
    roleHeaderLevel: 3,
    topContentHeaderLevel: 0,
    wrapInCodeBlock: false,
    includeThoughtProcess: true
};

let failures = 0;
const check = (label, cond) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}: ${label}`);
    if (!cond) failures++;
};

// --- Test 1: Compare Mode bestand (echt exportbestand) ---
const comparePath = path.join(__dirname, 'test-fixtures', 'compare-mode-export.json');
const compareJson = JSON.parse(fs.readFileSync(comparePath, 'utf8'));
const compareRuns = extractRuns(compareJson);
check('Compare export wordt herkend', Array.isArray(compareRuns) && compareRuns.length === 2);
const compareMd = convertToMarkdown(compareRuns, 'Explaining The Monty Hall Problem', defaultOpts);
check('Twee secties in markdown', (compareMd.match(/Compare Run/g) || []).length === 2);
check('Modelnaam opgenomen', compareMd.includes('antigravity-preview-09-2026'));
check('Antwoord aanwezig', compareMd.includes('Model (Answer)'));
check('User-prompt aanwezig', compareMd.includes('User'));
console.log('--- kop van output ---');
console.log(compareMd.split('\n').slice(0, 8).join('\n'));

// --- Test 2: Standaard export (regressie) ---
const standardJson = {
    chunkedPrompt: {
        chunks: [
            { role: 'user', text: 'Hello' },
            { role: 'model', text: 'Hi there' }
        ]
    }
};
const standardRuns = extractRuns(standardJson);
check('Standaard export wordt herkend', standardRuns && standardRuns.length === 1);
const standardMd = convertToMarkdown(standardRuns, 'Standard', defaultOpts);
check('Standaard export zonder Compare-sectiekop', !standardMd.includes('Compare Run'));
check('Standaard export bevat conversie', standardMd.includes('Hi there'));

// --- Test 3: Ongeldig bestand ---
check('Ongeldig object -> null', extractRuns({ foo: 'bar' }) === null);
check('Compare zonder geldige data -> null', extractRuns({ comparisonPrompt: { data: [{ foo: 1 }] } }) === null);

// --- Test 4: Opties (thought verbergen, header shift) ---
const noThoughtMd = convertToMarkdown(compareRuns, 'X', { ...defaultOpts, includeThoughtProcess: false });
check('Thought-process weggefilterd', !noThoughtMd.includes('Thought process'));

console.log(failures === 0 ? '\nALLE TESTS GESLAAGD' : `\n${failures} TEST(S) MISLUKT`);
process.exit(failures === 0 ? 0 : 1);
