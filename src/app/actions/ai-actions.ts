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
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a shopping expert. Look at the screenshot of a store page from a video. 
Identify the store name, the type of product shown, and the platform.

The result MUST be in the same language as the text in the image (e.g., if the screenshot is in Chinese, provide Chinese results; if in English, provide English results).

Return the result in JSON format with these exact keys:
- 'shop': Store name (string)
- 'category': General product type (string, max 3 words)
- 'platform': Choose exactly one from [拼多多, 淘宝, 1688, 京东]. If unsure, identify it by the UI style or logos.
- 'description': Short description of what is being recommended (string).

Keep the values concise and professional.`
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
