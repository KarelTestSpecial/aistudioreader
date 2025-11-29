// main.js - DEFINITIEVE CORRECTIE MET AFSLUITENDE HAAK

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

    // --- Event Listeners ---

    // Settings Event Listeners
    const saveSettings = () => {
        const settings = {
            roleHeaderLevel: roleHeaderLevelSelect.value,
            topContentHeaderLevel: topContentHeaderLevelSelect.value,
            wrapInCodeBlock: wrapInCodeBlockCheckbox.checked
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
        }
    };

    roleHeaderLevelSelect.addEventListener('change', saveSettings);
    topContentHeaderLevelSelect.addEventListener('change', saveSettings);
    wrapInCodeBlockCheckbox.addEventListener('change', saveSettings);

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
                if (data.chunkedPrompt && data.chunkedPrompt.chunks) {
                    const originalFileName = file.name.includes('.') ? file.name.split('.').slice(0, -1).join('.') : file.name;
                    const markdownContent = convertToMarkdown(data, file.name);
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
        return md;
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