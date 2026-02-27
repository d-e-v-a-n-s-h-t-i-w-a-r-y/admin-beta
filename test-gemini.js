const GEMINI_API_KEY = 'AIzaSyAmfkCbQMHdsII725mZnN6U6_wLiLM83zM';
const MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

async function test() {
    try {
        const res = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say hello in one word" }] }]
            }),
        });

        const data = await res.json();
        console.log("Status:", res.status);
        if (res.ok) {
            console.log("SUCCESS! Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("ERROR:", JSON.stringify(data.error, null, 2));
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
