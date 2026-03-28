"use server";

export async function extractFromImage(base64Image: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    throw new Error("OPENROUTER_API_KEY is not set or still has the placeholder value.");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://showcase-vault.vercel.app", 
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a shopping expert. Look at the screenshot of a store page from a video. 
Identify the store name, the type of product shown, and the platform.

Return the result in JSON format with these exact keys:
- 'shop': Store name (string)
- 'category': General product type (string, max 3 words)
- 'platform': Choose exactly one from [PinDuoDuo, TaoBao, 1688, JD]. If unsure, identify it by the UI style or logos.
- 'description': Short description of what is being recommended (string).

Keep the values concise and profesional.`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content);
  } catch (e) {
    console.error("AI extraction failed:", e);
    throw new Error(e instanceof Error ? e.message : "AI extraction failed.");
  }
}
