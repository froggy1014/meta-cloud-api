import WhatsApp from 'whatsapp';

import dotenv from 'dotenv';

dotenv.config();

// Your test sender phone number
const wa = new WhatsApp(Number(process.env.WA_PHONE_NUMBER_ID));

// Enter the recipient phone number
const recipient_number = 821089791169;

async function send_message() {
    try {
        // wa.updateAccessToken(process.env.CLOUD_API_ACCESS_TOKEN as string);

        const sent_text_message = wa.messages.text({ body: 'Hello world' }, recipient_number);

        await sent_text_message.then((res) => {
            console.log(res.rawResponse());
        });
    } catch (e) {
        console.log(JSON.stringify(e));
    }
}

send_message();
