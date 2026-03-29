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
        model: "qwen/qwen3.5-flash-02-23",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `你是一位购物专家。请查看视频中的商店页面截图。
识别其中的商店名称、商品种类和平台。

结果应尽可能使用中文。除非是一些专有名词（例如 WiFi），否则请提供中文的识别结果。

以 JSON 格式返回以下键值：
- 'shop': 商店名称 (string)
- 'category': 商品类别 (string, 最多 3 个词)
- 'platform': 从 [拼多多, 淘宝, 1688, 京东] 中准确选择一个。如果不确定，请根据 UI 界面风格或 Logo 进行识别。
- 'description': 被推荐商品的简短描述 (string)。

保持数值简洁且专业。`
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
