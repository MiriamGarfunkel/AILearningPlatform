export type LessonGenerationContext = {
  readonly learnerQuestion?: string;
};

export interface EducationalContentProvider {
  readonly providerChannel: 'openai_chat' | 'offline_stub';

  fetchStructuredLesson(
    disciplineLabel: string,
    topicLabel: string,
    context?: LessonGenerationContext,
  ): Promise<Record<string, unknown>>;
}
