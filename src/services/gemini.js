const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Send a counseling prompt to Gemini and get a response.
 * @param {string} userMessage
 * @param {object} context - { rank, category, gender, eligibleColleges }
 * @param {Array} history - prior messages [{role, content}]
 * @returns {Promise<string>}
 */
export async function askGemini(userMessage, context = {}, history = []) {
  const systemContext = `You are JoSAA Counseling Assistant — an expert academic counselor helping JEE students navigate the JoSAA admission process.

Student Profile:
- CRL Rank: ${context.rank || 'Not provided'}
- Category: ${context.category || 'Not provided'}
- Gender: ${context.gender || 'Not provided'}
- Eligible Colleges Count: ${context.eligibleColleges?.length || 0}
${context.eligibleColleges?.length > 0 ? `- Top Eligible Options: ${context.eligibleColleges.slice(0, 5).map(c => `${c.institute} - ${c.program} (Closing: ${c.closingRank})`).join(', ')}` : ''}

Instructions:
- Be specific, data-driven, and concise
- Recommend institutes/branches relevant to the student's rank
- Format responses clearly with bullet points when listing options
- Be empathetic and encouraging
- Do NOT give generic advice — tailor everything to the student's rank and profile
- If asked about placements, coding culture, or fees, give realistic assessments`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemContext + '\n\nStudent asks: ' + userMessage }],
    },
    ...history.flatMap((msg) => [
      { role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] },
    ]),
  ];

  // Move the actual question to the end if history exists
  if (history.length > 0) {
    contents.push({ role: 'user', parts: [{ text: userMessage }] });
    contents.shift(); // remove the combined first message
    contents.unshift({ role: 'user', parts: [{ text: systemContext }] });
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
}

export const PREDEFINED_PROMPTS = [
  { label: '💻 Best coding colleges', text: 'Which colleges in my eligible list are best for coding culture and competitive programming?' },
  { label: '🏛️ Safe IIT choices', text: 'Which IITs are safe choices for my rank? List branches available to me.' },
  { label: '⚖️ Branch vs College tradeoff', text: 'Should I prefer a better branch at NIT or a lower branch at IIT given my rank? Explain the tradeoffs.' },
  { label: '💼 Best placements', text: 'Which of my eligible colleges have the best placement records? Focus on CSE/IT branches.' },
  { label: '💰 Affordable good colleges', text: 'Which of my eligible colleges offer the best value — good quality at lower fees?' },
];
