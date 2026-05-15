import type { LessonContentOrigin } from '../models/Prompt';
import { readAiRuntimeMode, hasOpenAiCredential } from '../config/env';
import { OpenAiEducationalContentProvider } from './AI/openai-provider';
import { OfflineEducationalContentProvider } from './AI/offline-provider';

const offlineProvider = new OfflineEducationalContentProvider();

export interface LessonResult {
  readonly payload: Record<string, unknown>;
  readonly content_origin: LessonContentOrigin;
}

export async function getLesson(
  disciplineLabel: string,
  topicLabel: string,
  learnerQuestion?: string,
): Promise<LessonResult> {
  const mode = readAiRuntimeMode();
  const ctx = { learnerQuestion };

  if (mode === 'offline') {
    const payload = await offlineProvider.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
    return { payload, content_origin: 'offline_stub' };
  }

  if (mode === 'remote' && hasOpenAiCredential()) {
    const remote = new OpenAiEducationalContentProvider(process.env.OPENAI_API_KEY!.trim());
    const payload = await remote.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
    return { payload, content_origin: 'live_model' };
  }

  if (mode === 'remote' && !hasOpenAiCredential()) {
    const payload = await offlineProvider.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
    return { payload, content_origin: 'offline_stub' };
  }

  // auto
  if (hasOpenAiCredential()) {
    try {
      const remote = new OpenAiEducationalContentProvider(process.env.OPENAI_API_KEY!.trim());
      const payload = await remote.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
      return { payload, content_origin: 'live_model' };
    } catch (err) {
      console.warn('OpenAI failed, using offline stub.', err);
    }
  }

  const payload = await offlineProvider.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
  return { payload, content_origin: 'offline_stub' };
}
