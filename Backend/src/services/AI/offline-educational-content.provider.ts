import type { EducationalContentProvider, LessonGenerationContext } from './educational-content-provider';

export class OfflineEducationalContentProvider implements EducationalContentProvider {
  readonly providerChannel = 'offline_stub' as const;

  async fetchStructuredLesson(
    disciplineLabel: string,
    topicLabel: string,
    context?: LessonGenerationContext,
  ): Promise<Record<string, unknown>> {
    const subject = [disciplineLabel, topicLabel].filter(Boolean).join(' — ');
    const question = context?.learnerQuestion?.trim() ?? '';
    const questionLine = question ? `You asked: "${question}". ` : '';
    return {
      topic: `${subject} (Offline demo)`,
      explanation:
        `${questionLine}This is an offline lesson about ${subject}. ` +
        `To get a real AI-generated answer, add your OpenAI API key to the OPENAI_API_KEY variable in Backend/.env and restart.`,
      task:
        `Write 3 things you already know about ${subject}, then write 2 questions you still have.`,
      isMock: true,
    };
  }
}
