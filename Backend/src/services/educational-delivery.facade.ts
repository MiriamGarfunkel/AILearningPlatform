import type { LessonContentOrigin } from '../models/Prompt';
import { readAiRuntimeMode, hasOpenAiCredential } from '../config/env';
import { OpenAiEducationalContentProvider } from './AI/openai-educational-content.provider';
import { OfflineEducationalContentProvider } from './AI/offline-educational-content.provider';

const offlineProvider = new OfflineEducationalContentProvider();

export interface ResolvedEducationalPayload {
  readonly payload: Record<string, unknown>;
  readonly content_origin: LessonContentOrigin;
}

/**
 * Resolves the active AI stack from environment and returns structured lesson JSON.
 * Swap behaviour with AI_PROVIDER_MODE=auto|remote|offline and OPENAI_API_KEY.
 */
export async function resolveEducationalPayloadForLabels(
  disciplineLabel: string,
  topicLabel: string,
  learnerQuestion?: string,
): Promise<ResolvedEducationalPayload> {
  const mode = readAiRuntimeMode();
  const ctx = { learnerQuestion };

  if (mode === 'offline') {
    const payload = await offlineProvider.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
    return { payload: enrichWithLearnerQuestion(payload, learnerQuestion), content_origin: 'offline_stub' };
  }

  if (mode === 'remote' && hasOpenAiCredential()) {
    const remote = new OpenAiEducationalContentProvider(process.env.OPENAI_API_KEY!.trim());
    const payload = await remote.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
    return { payload, content_origin: 'live_model' };
  }

  if (mode === 'remote' && !hasOpenAiCredential()) {
    const payload = await offlineProvider.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
    return { payload: enrichWithLearnerQuestion(payload, learnerQuestion), content_origin: 'offline_stub' };
  }

  // auto
  if (hasOpenAiCredential()) {
    try {
      const remote = new OpenAiEducationalContentProvider(process.env.OPENAI_API_KEY!.trim());
      const payload = await remote.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
      return { payload, content_origin: 'live_model' };
    } catch (err) {
      console.warn('Remote educational provider failed; falling back to offline stub.', err);
    }
  }

  const payload = await offlineProvider.fetchStructuredLesson(disciplineLabel, topicLabel, ctx);
  return { payload: enrichWithLearnerQuestion(payload, learnerQuestion), content_origin: 'offline_stub' };
}

function enrichWithLearnerQuestion(
  base: Record<string, unknown>,
  learnerQuestion?: string,
): Record<string, unknown> {
  if (!learnerQuestion?.trim()) return base;
  const explanation = String(base.explanation ?? '');
  return {
    ...base,
    explanation: `${explanation}\n\nAdditional learner input was sent with this request; its intent should be honored when studying this material (original wording is not duplicated here to keep the lesson English-only in the archive).`,
  };
}
