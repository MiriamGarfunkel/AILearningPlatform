/**
 * Pluggable lesson-content backends (OpenAI, offline stub, or future vendors).
 */
export type LessonGenerationContext = {
  /** Optional learner question; providers should address it in English. */
  readonly learnerQuestion?: string;
};

export interface EducationalContentProvider {
  /** Stable identifier for telemetry / persistence tagging */
  readonly providerChannel: 'openai_chat' | 'offline_stub';

  /**
   * Produce a JSON-serializable lesson object for the given discipline + topic labels.
   * All human-readable strings MUST be written in English.
   */
  fetchStructuredLesson(
    disciplineLabel: string,
    topicLabel: string,
    context?: LessonGenerationContext,
  ): Promise<Record<string, unknown>>;
}
