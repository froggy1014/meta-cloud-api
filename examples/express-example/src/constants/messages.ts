// Command constants
export const COMMANDS = {
    HELLO: ['hello', 'hi'],
    HELP: 'help',
    INFO: 'info',
    TEMPLATE: 'template',
    INTERACTIVE: 'interactive',
    FLOW: 'flow',
    FEEDBACK: 'feedback',
} as const;

// Button ID constants
export const BUTTON_IDS = {
    HELP: 'help_button',
    INFO: 'info_button',
} as const;

// Message templates
export const MESSAGE_TEMPLATES = {
    HELP: `Available commands:
- hello/hi: Get a greeting
- help: Show this help message
- info: Get account information
- template: See a template example
- interactive: See interactive message example
- feedback: Start the feedback flow`,

    GREETING: 'Hello! How can I help you today?',

    TEMPLATE_ERROR: "Sorry, couldn't send template. Ensure you have an approved template configured.",

    IMAGE_RECEIVED: "Thanks for the image! I've received it.",

    DOCUMENT_RECEIVED: "Thanks for the document! I've received it.",

    AUDIO_RECEIVED: "Thanks for the audio message! I've received it.",

    VIDEO_RECEIVED: "Thanks for the video! I've received it.",

    INTERACTIVE_PROMPT: 'What would you like to do?',
} as const;

// Function to generate user info message
export const getUserInfoMessage = (from: string, profileName?: string, displayPhoneNumber?: string) =>
    `Your WhatsApp number: ${from}
Profile name: ${profileName}
Our phone: ${displayPhoneNumber}`;

// Function to generate default response
export const getDefaultResponse = (userMessage: string) =>
    `You said: "${userMessage}"\nType "help" to see available commands.`;
