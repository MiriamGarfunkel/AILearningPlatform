import type { EducationalContentProvider } from './educational-content-provider';

export class OfflineEducationalContentProvider implements EducationalContentProvider {
  readonly providerChannel = 'offline_stub' as const;

  async fetchStructuredLesson(
    disciplineLabel: string,
    topicLabel: string,
  ): Promise<Record<string, unknown>> {
    return {
      topic: topicLabel,
      explanation: `המערכת במצב גיבוי (ללא ספק חיצוני). סקירה קצרה על "${topicLabel}" תחת "${disciplineLabel}".`,
      task: `סכם את "${topicLabel}" בשלושה משפטים והוסף מקור מומלץ לקריאה.`,
      isMock: true,
    };
  }
}
