import { useState } from "react";
import { aiService } from "../services/aiService";

export function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await aiService.generateText(prompt);
      setResult(response.generated_text);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error generating text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-generator">
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={4}
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button type="submit" disabled={loading || !prompt}>
          {loading ? "Generating..." : "Generate Text"}
        </button>
      </form>
      {result && (
        <div className="result" style={{ marginTop: "1rem" }}>
          <h3>Generated Text:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
