class OpenAIProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

class GeminiProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid Gemini response structure");
    }
    return data.candidates[0].content.parts[0].text;
  }
}

class GroqProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    this.model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export interface AIProvider {
  chat(systemPrompt: string, userPrompt: string): Promise<string>;
}

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  switch (provider) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
      return new OpenAIProvider();
    case "gemini":
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
      return new GeminiProvider();
    case "groq":
      if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");
      return new GroqProvider();
    default:
      throw new Error(`Unsupported AI provider: ${provider}. Use 'groq', 'openai', or 'gemini'.`);
  }
}
