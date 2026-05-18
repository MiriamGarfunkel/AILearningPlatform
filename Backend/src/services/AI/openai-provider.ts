import OpenAI from 'openai';
import type { EducationalContentProvider, LessonGenerationContext } from './ai-provider';

const SYSTEM_PROMPT = `You are an expert educational assistant.
Rules:
- If the learner's question is in Hebrew, write all JSON values in Hebrew.
- If the learner's question is in English, write all JSON values in English.
- Return only valid JSON matching the user's schema. No markdown fences.`;

export class OpenAiEducationalContentProvider implements EducationalContentProvider {
  readonly providerChannel = 'openai_chat' as const;

  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async fetchStructuredLesson(
    disciplineLabel: string,
    topicLabel: string,
    context?: LessonGenerationContext,
  ): Promise<Record<string, unknown>> {
    const learner = context?.learnerQuestion?.trim();
    const userMessage = `Create a learning module for the discipline "${disciplineLabel}" focused on "${topicLabel}".
${learner ? `The learner asked: "${learner}". Detect the language of this question and respond in that same language.\n` : ''}
Return a single JSON object with exactly these keys:
- "topic": short title for this module
- "explanation": detailed explanation suitable for a student (at least 3-4 paragraphs, with examples)
- "task": one practical task for the student

Respond in the same language as the learner's question.`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content;
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    parsed.topic = (parsed.topic as string) || topicLabel;
    return parsed;
  }
}
