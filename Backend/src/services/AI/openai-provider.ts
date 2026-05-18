import OpenAI from 'openai';
import type { EducationalContentProvider, LessonGenerationContext } from './ai-provider';

const SYSTEM_PROMPT = `You are an expert educational assistant.
Rules:
- Write EVERY string in the JSON output in English only (topic, explanation, task, and any other fields).
- Never include Hebrew, Arabic, Cyrillic, or any non-Latin script in JSON values. If source labels are non-English, translate the teaching content into English; you may mention the original topic once in Latin transliteration only if essential.
- Do not write lesson body text in Hebrew or any non-English language.
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
${learner ? `The learner also asked: "${learner}". Address this in your explanation and task, all in English.\n` : ''}
Return a single JSON object with exactly these keys:
- "topic": short English title for this module
- "explanation": clear English explanation suitable for a student
- "task": one practical English task for the student

Remember: all values must be English text only.`;

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
