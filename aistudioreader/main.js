// main.js - DEFINITIEVE CORRECTIE MET AFSLUITENDE HAAK

// --- Pure conversielogica (DOM-onafhankelijk, testbaar via Node) ---

const extractRuns = (json) => {
    if (!json) return null;

    // Standaard AI Studio export
    if (json.chunkedPrompt && json.chunkedPrompt.chunks) {
        return [{ runSettings: json.runSettings || {}, chunkedPrompt: json.chunkedPrompt }];
    }

    // Compare Mode export: { comparisonPrompt: { data: [ { chunkedPrompt, runSettings }, ... ] } }
    if (json.comparisonPrompt && Array.isArray(json.comparisonPrompt.data)) {
        const runs = json.comparisonPrompt.data
            .filter(item => item && item.chunkedPrompt && item.chunkedPrompt.chunks)
            .map(item => ({ runSettings: item.runSettings || {}, chunkedPrompt: item.chunkedPrompt }));
        if (runs.length > 0) return runs;
    }

    return null;
};

const convertToMarkdown = (runs, originalName, opts) => {
    const roleHeaderLevel = opts.roleHeaderLevel;
    const topContentHeaderLevel = opts.topContentHeaderLevel;
    const wrapInCodeBlock = opts.wrapInCodeBlock;
    const includeThoughtProcess = opts.includeThoughtProcess;
    const roleHeaderHashes = '#'.repeat(roleHeaderLevel);
    const sectionHeaderHashes = '#'.repeat(Math.max(1, roleHeaderLevel - 1));

    let md = `# Conversation Log from ${originalName}\n\n`;

    runs.forEach((run, index) => {
        if (runs.length > 1) {
            const model = run.runSettings && run.runSettings.model
                ? run.runSettings.model.replace(/^models\//, '')
                : `Run ${index + 1}`;
            md += `${sectionHeaderHashes} 🆚 Compare Run ${index + 1}: ${model}\n\n`;
        }

        run.chunkedPrompt.chunks.forEach(chunk => {
            const role = chunk.role;
            let text = chunk.text;
            const isThought = chunk.isThought || false;

            if (!text) return;
            if (isThought && !includeThoughtProcess) return;

            // Apply content transformations
            if (wrapInCodeBlock) {
                text = `\`\`\`text\n${text}\n\`\`\``;
            } else {
                // Shift headers if not wrapped in code block
                const shiftAmount = -topContentHeaderLevel; // Value is now relative (e.g., -1, 0, 1)
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
    });
    return md;
};

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const fileNameDisplay = document.getElementById('fileName');
    const successMessage = document.getElementById('successMessage');

    // Settings Elements
    const roleHeaderLevelSelect = document.getElementById('roleHeaderLevel');
    const topContentHeaderLevelSelect = document.getElementById('topContentHeaderLevel');
    const wrapInCodeBlockCheckbox = document.getElementById('wrapInCodeBlock');
    const includeThoughtProcessCheckbox = document.getElementById('includeThoughtProcess');

    // --- Event Listeners ---

    // Settings Event Listeners
    const saveSettings = () => {
        const settings = {
            roleHeaderLevel: roleHeaderLevelSelect.value,
            topContentHeaderLevel: topContentHeaderLevelSelect.value,
            wrapInCodeBlock: wrapInCodeBlockCheckbox.checked,
            includeThoughtProcess: includeThoughtProcessCheckbox.checked
        };
        localStorage.setItem('aiStudioReaderSettings', JSON.stringify(settings));
    };

    const loadSettings = () => {
        const savedSettings = localStorage.getItem('aiStudioReaderSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            roleHeaderLevelSelect.value = settings.roleHeaderLevel || '3';
            topContentHeaderLevelSelect.value = settings.topContentHeaderLevel || '0';
            wrapInCodeBlockCheckbox.checked = settings.wrapInCodeBlock || false;
            includeThoughtProcessCheckbox.checked = settings.includeThoughtProcess !== undefined ? settings.includeThoughtProcess : true;
        }
    };

    roleHeaderLevelSelect.addEventListener('change', saveSettings);
    topContentHeaderLevelSelect.addEventListener('change', saveSettings);
    wrapInCodeBlockCheckbox.addEventListener('change', saveSettings);
    includeThoughtProcessCheckbox.addEventListener('change', saveSettings);

    // Initialize settings
    loadSettings();

    uploadButton.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    uploadArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = event.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // --- Kernlogica ---
    const handleFile = (file) => {
        fileNameDisplay.textContent = `Processing: ${file.name}`;
        successMessage.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const runs = extractRuns(data);
                if (runs) {
                    const originalFileName = file.name.includes('.') ? file.name.split('.').slice(0, -1).join('.') : file.name;
                    const markdownContent = convertToMarkdown(runs, file.name, {
                        roleHeaderLevel: parseInt(roleHeaderLevelSelect.value, 10),
                        topContentHeaderLevel: parseInt(topContentHeaderLevelSelect.value, 10),
                        wrapInCodeBlock: wrapInCodeBlockCheckbox.checked,
                        includeThoughtProcess: includeThoughtProcessCheckbox.checked
                    });
                    triggerDownload(markdownContent, originalFileName);
                    fileNameDisplay.textContent = `${file.name} processed.`;
                    successMessage.classList.remove('hidden');
                } else {
                    fileNameDisplay.textContent = 'Error: Not a valid AI Studio file.';
                }
            } catch (error) {
                fileNameDisplay.textContent = 'Error: Invalid JSON format.';
                console.error('JSON Parse Error:', error);
            }
        };
        reader.onerror = () => {
            fileNameDisplay.textContent = 'Error reading the file.';
        };
        reader.readAsText(file);
    };

    const triggerDownload = (content, filename) => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

}); // <--- DEZE AFSLUITING ONTBRAK EN IS NU TOEGEVOEGD.

// Node-testsupport (wordt in de browser genegeerd)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractRuns, convertToMarkdown };
}