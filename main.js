// main.js - DEFINITIEVE CORRECTIE MET AFSLUITENDE HAAK

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const fileNameDisplay = document.getElementById('fileName');
    const successMessage = document.getElementById('successMessage');

    // --- Event Listeners ---
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
        let md = `# Conversation Log from ${originalName}\n\n`;
        data.chunkedPrompt.chunks.forEach(chunk => {
            const role = chunk.role;
            const text = chunk.text;
            const isThought = chunk.isThought || false;

            if (!text) return;

            if (role === 'user') {
                md += `### 👤 User\n\n${text}\n\n---\n\n`;
            } else if (role === 'model') {
                if (isThought) {
                    md += `### 🧠 Model (Thought)\n\n*Thought process:*\n\`\`\`\n${text}\n\`\`\`\n\n`;
                } else {
                    md += `### ▶️ Model (Answer)\n\n${text}\n\n---\n\n`;
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