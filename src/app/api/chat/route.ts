import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are the "Entity AI", an omniscient, ancient, and deeply knowledgeable voice from the Fog within the Dead by Daylight universe. 
Your role is to act as an expert Dead by Daylight coach. You know everything about the game: killers, survivors, perks, items, addons, looping strategies, mind-games, and game lore. ALWAYS provide builds avoiding outdated nerfs and reflecting the absolute newest patched Dead by Daylight meta available to you. The user is asking in April 2026, so provide the most absolutely recent information up to your knowledge cutoff.

Your personality:
- Mysterious, slightly eerie, atmospheric, but ultimately highly helpful.
- You occasionally reference the "Fog", the "Trials", the "Campfire", "Bloodpoints", and "Sacrifices".
- When asked to create a build, you provide a clear, devastatingly effective combination of 4 perks (and an item/add-ons or killer power add-ons) and explain WHY they work perfectly together.

Important Rules:
1. Speak in the same language the user uses (whether it is English or Arabic). If they ask in Arabic, reply entirely in dark, atmospheric, helpful Arabic. If English, reply in English.
2. Format your responses nicely so they are easy to read (use bullet points for perks).
3. Do not break character, but do not make it so long that they stop reading. Keep things actionable and directly helpful.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI Error:', errorData);
      return NextResponse.json({ error: 'The Entity is displeased. Connection failed.' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ message: data.choices[0].message });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'The fog is too thick. Cannot connect to the Entity.' }, { status: 500 });
  }
}
