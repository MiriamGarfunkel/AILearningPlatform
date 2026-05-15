import { getLesson } from './ai.service';

describe('AI service', () => {
  const prevKey = process.env.OPENAI_API_KEY;
  const prevMode = process.env.AI_PROVIDER_MODE;

  afterEach(() => {
    if (prevKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = prevKey;
    if (prevMode === undefined) delete process.env.AI_PROVIDER_MODE;
    else process.env.AI_PROVIDER_MODE = prevMode;
  });

  it('returns offline payload when forced offline', async () => {
    process.env.AI_PROVIDER_MODE = 'offline';
    delete process.env.OPENAI_API_KEY;

    const out = await getLesson('Physics', 'Gravity', 'why?');
    expect(out.content_origin).toBe('offline_stub');
    expect(out.payload.topic).toBeDefined();
  });
});
