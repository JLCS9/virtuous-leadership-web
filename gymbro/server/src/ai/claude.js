import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';

export async function chat({ system, messages, maxTokens = 1024 }) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  return text;
}

export async function chatJson({ system, messages, maxTokens = 1024 }) {
  const raw = await chat({
    system: `${system}\n\nResponde SIEMPRE con un objeto JSON válido y nada más. Sin texto antes ni después, sin bloques de código.`,
    messages,
    maxTokens,
  });

  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
