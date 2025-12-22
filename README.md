# StudyBuddy AI 🧠📚

StudyBuddy AI is a powerful, Retrieval-Augmented Generation (RAG) powered study companion designed to help students and professionals master complex subjects.

Leveraging **Google's Gemini 3 Flash** model and its massive context window, StudyBuddy allows you to upload entire textbooks, research papers, code repositories, and diagrams to chat directly with your study materials—no vector databases required.

## ✨ Features

- **Long-Context RAG**: Upload documents (PDFs, Images, Code, Text) up to 50MB. The AI reads the entire context without traditional chunking.
- **Multimodal Analysis**:
  - 📄 **Documents**: Summarize and query PDFs, Markdown, and text files.
  - 🖼️ **Images**: Analyze diagrams, charts, and handwritten notes.
  - 💻 **Code Mode**: Specialized mode to explain syntax, logic, and debugging step-by-step.
- **Robust Local Persistence**: Switched from LocalStorage to **IndexedDB** to handle large file storage and chat history without quota limits.
- **Smart Session Management**: Organize studies by session, tag messages for quick reference, and search through history.
- **Rich Text Editor**: Markdown support with code syntax highlighting.
- **Authentication**: Supports both Google Sign-In (for potential cloud syncing) and Guest Access (for quick, anonymous use).
- **Theming**: Beautiful, fully responsive Dark and Light modes.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 3 Flash (via `@google/genai` SDK)
- **State/Storage**: IndexedDB (`idb-keyval`) for large payloads, LocalStorage for preferences.
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

1.  **Google Gemini API Key**
2.  **Google OAuth Client ID**: (Optional) For Google Login functionality, set up a project in Google Cloud Console.

### Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AshishDayal7/StudyBuddy-AI.git
    cd StudyBuddy-AI
    ```

2.  **Environment Configuration**
    Ensure you have an environment variable or build configuration for the API Key. The app expects:
    `process.env.API_KEY` to be available in the execution context.

3.  **Run the Application**
    This application uses ESM imports via `index.html`. You can run it using a static file server or a bundler like Vite.
    
    If using a simple static server:
    ```bash
    npx serve .
    ```

## 📖 Usage Guide

1.  **Login**: Choose **Guest Access** for local-only storage or **Google Login**.
2.  **Upload**: Click the paperclip icon 📎 to upload PDFs, images, or code files (supports up to 50MB per file).
3.  **Chat**:
    - Ask questions like *"Summarize this document"* or *"Explain the relationship between file A and B"*.
    - Toggle **Code Mode** `</>` in the header for technical explanations.
4.  **Organize**:
    - Use the sidebar to create new sessions.
    - Click the tag icon 🏷️ on messages to bookmark important answers.
    - Edit your previous messages to refine queries.

## 🛡️ Privacy & Limitations

- **Local Storage**: All files and chat history are stored in your browser's IndexedDB. Clearing browser data will remove your study sessions.
- **Gemini Context**: While Gemini has a large context window (1M+ tokens), extremely large datasets may still require optimization.

