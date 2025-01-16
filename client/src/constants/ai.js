export const AI_MODELS = {
  GPT35: {
    name: "GPT-3.5",
    provider: "openai",
    requiresKey: true,
  },
  GPT4: {
    name: "GPT-4",
    provider: "openai",
    requiresKey: true,
  },
  CLAUDE: {
    name: "Claude",
    provider: "anthropic",
    requiresKey: true,
  },
  LLAMA: {
    name: "Llama 2",
    provider: "meta",
    requiresKey: false,
  },
};
