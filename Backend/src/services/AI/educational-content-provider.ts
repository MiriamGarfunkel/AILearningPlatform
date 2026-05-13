/**
 * Pluggable lesson-content backends (OpenAI, offline stub, or future vendors).
 */
export interface EducationalContentProvider {
  /** Stable identifier for telemetry / persistence tagging */
  readonly providerChannel: 'openai_chat' | 'offline_stub';

  /**
   * Produce a JSON-serializable lesson object for the given discipline + topic labels.
   */
  fetchStructuredLesson(disciplineLabel: string, topicLabel: string): Promise<Record<string, unknown>>;
}
