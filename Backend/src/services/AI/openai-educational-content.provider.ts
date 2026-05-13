import OpenAI from 'openai';
import type { EducationalContentProvider } from './educational-content-provider';

export class OpenAiEducationalContentProvider implements EducationalContentProvider {
  readonly providerChannel = 'openai_chat' as const;

  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async fetchStructuredLesson(
    disciplineLabel: string,
    topicLabel: string,
  ): Promise<Record<string, unknown>> {
    const userMessage = `Create a learning module for ${disciplineLabel} specifically about ${topicLabel}.
Return the response in JSON format with the following fields:
- topic: the sub-category name
- explanation: a clear explanation of the topic.
- task: a practical task for the student to perform.`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content;
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    parsed.topic = (parsed.topic as string) || topicLabel;
    return parsed;
  }
}
