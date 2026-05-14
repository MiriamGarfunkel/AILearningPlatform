import type { EducationalContentProvider, LessonGenerationContext } from './educational-content-provider';

export class OfflineEducationalContentProvider implements EducationalContentProvider {
  readonly providerChannel = 'offline_stub' as const;

  async fetchStructuredLesson(
    _disciplineLabel: string,
    _topicLabel: string,
    _context?: LessonGenerationContext,
  ): Promise<Record<string, unknown>> {
    return {
      topic: 'Offline study module (English)',
      explanation:
        'This placeholder runs when no live AI provider is available. All catalog labels and learner questions are processed on the server with an English-only policy for generated text. Connect OpenAI (OPENAI_API_KEY) for full lessons tied to your categories.',
      task:
        'In English, write three sentences stating what you want to learn next, then name one English book or article you will search for.',
      isMock: true,
    };
  }
}
