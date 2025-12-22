import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Attachment } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to guide the model's behavior as a study assistant
const SYSTEM_INSTRUCTION = `
You are StudyBuddy, an intelligent and helpful study assistant. 
Your goal is to help students learn by analyzing their uploaded documents and answering their questions.

CORE BEHAVIORS:
1. CONTEXTUAL ACCURACY: Always base your answers on the provided context/documents if available. If the answer is not in the documents, use your general knowledge but explicitly state that it is outside the provided context.
2. SYNTHESIS & COMPARISON: When asked to compare documents or topics (e.g., "Contrast document A and B"), you must synthesize information from ALL relevant parts of the uploaded files. Look for connections, contradictions, and relationships across the entire context window.
3. FORMATTING: Be concise, clear, and educational. Use formatting (bullet points, bold text, headers) to make answers easy to read.
4. SPECIALIZED CONTENT: 
   - If the user uploads code, explain it step-by-step.
   - If the user uploads images, analyze them in detail.
5. SUMMARIZATION: When asked to summarize a document, provide a structured summary including "Main Topics", "Key Takeaways", and "Crucial Definitions" if applicable.
`;

export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string,
  attachments: Attachment[],
  isCodeMode: boolean = false
): Promise<string> => {
  try {
    // 1. Convert history to Gemini Content format
    const historyContents: Content[] = history.map((msg) => {
      const parts: Part[] = [{ text: msg.text }];
      
      // Add attachments to history if they existed
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }

      return {
        role: msg.role,
        parts: parts,
      };
    });

    // 2. Prepare the current message parts
    let modifiedMessage = currentMessage;
    if (isCodeMode) {
      modifiedMessage = `${currentMessage}\n\n[SYSTEM INSTRUCTION: The user has enabled 'Code Explanation Mode'. Provide a detailed, step-by-step explanation of any code present in this message or the attached files. Break down the logic, syntax, and execution flow line-by-line where appropriate.]`;
    }

    const currentParts: Part[] = [{ text: modifiedMessage }];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        currentParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }

    // 3. Initialize model
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // Increase output limit for detailed study notes and synthesis
        maxOutputTokens: 8192, 
      },
      history: historyContents
    });

    // 4. Send message
    const result = await chat.sendMessage({
      message: currentParts
    });

    return result.text || "I processed the documents but couldn't generate a text response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
};
