import axios from "axios";

export class LMStudioAPI {
  private baseUrl: string;
  private isLocalHost: boolean;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.trim().replace(/\/$/, "");

    // Check if it's a localhost or local IP address
    this.isLocalHost = this.checkIfLocal(this.baseUrl);

    // Only force HTTPS for non-local environments
    if (!this.isLocalHost && this.baseUrl.startsWith("http://")) {
      this.baseUrl = this.baseUrl.replace("http://", "https://");
    }
  }

  private checkIfLocal(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.16.") ||
        hostname.endsWith(".local")
      );
    } catch (error) {
      console.error("Invalid URL:", error);
      return false;
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/models`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getModels() {
    const response = await axios.get(`${this.baseUrl}/v1/models`);
    return response.data;
  }

  async chat(
    messages: { role: string; content: string }[],
    model: string,
    onChunk: (chunk: string) => void
  ) {
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from API");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Failed to create stream reader");
    }

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const content = json.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error("Failed to parse JSON:", e);
          }
        }
      }
    }
  }
}
