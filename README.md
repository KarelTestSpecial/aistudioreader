# Google AI Studio - File Reader

This is a simple, privacy-focused Chrome extension designed to convert exported conversation logs from Google's AI Studio into a readable Markdown format.

## Functionality

Google AI Studio conversations are stored in the 'Google AI Studio' folder on your Google Drive. This file has no extension but is saved in a `.json` data format. While this format is useful for machine processing, it is not ideal for quick reading or sharing. This extension solves that problem.

-   **Local Processing**: All file processing is done entirely on your own computer. Your files are never uploaded to an external server.
-   **Simple Interface**: A clean and simple interface allows you to select or drag and drop a file for conversion.
-   **Markdown Conversion**: The extension converts the JSON data into a well-organized Markdown file, with a clear separation between user input and model responses.
-   **Customizable Output**: Configure header levels for roles (User/Model) and content, and optionally wrap content in code blocks. Your settings are automatically saved.
-   **Automatic Download**: After conversion, the `.md` file is automatically downloaded to your computer.

## How to use

1.  **Install the extension** from the Chrome Web Store.
2.  **Click the extension icon** in your browser toolbar. A new tab will open with the conversion page.
3.  **Configure settings (Optional)**: Adjust the header levels for User/Model roles and content, or enable code block wrapping using the provided options.
4.  **Select your Google AI Studio file** from the 'Google AI Studio' folder on your Google Drive or wherever you have placed the file:
    -   Click the "Select File" button and choose the Google AI Studio file. AI Studio conversations are stored in the 'Google AI Studio' folder on your Google Drive. This file has no extension but is normally indicated with a blue icon and has the title of your conversation in Google AI Studio as its name.
    -   If you cannot select the file via the file picker (e.g., because you are working with different accounts), download the file first: go to the 'Google AI Studio' folder on your Google Drive and right-click on the file and choose 'Download'. The file will now be saved in your local 'Downloads' folder. You can now select the file with the file picker of the Google AI Studio - File Reader in your local 'Downloads' folder, or you can drag the file from the local 'Downloads' folder (opened in your local File Manager) to the designated area on the Google AI Studio - File Reader tab in your browser.
5.  **Wait for the conversion**: The extension processes the file immediately.
6.  **Download**: The download of the converted `.md` file starts automatically.

## Privacy

Your privacy is of the utmost importance. As mentioned, all processing takes place locally. The extension does not collect or transmit any personal data. For more details, see our privacy policy.

## Technical Details

-   **Manifest V3**: Built with the latest Chrome extension standards for enhanced security and performance.
-   **No special permissions**: The extension does not require any special permissions, as it uses the standard browser APIs for file processing.
