import { submitEducationalGenerationRequest } from './lessons.controller';
import * as sessions from '../services/educational-sessions.service';

jest.mock('../services/educational-sessions.service');

describe('Lessons controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    req = {
      body: {
        category_id: '65a123456789012345678901',
        sub_category_id: '65a123456789012345678902',
        prompt: 'הסבר לי על פייתון',
        user_id: 'user123',
      },
      user: { _id: 'user123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('invokes next with 401 when learner is unknown', async () => {
    req.user = null;
    req.body.user_id = null;

    await submitEducationalGenerationRequest(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('returns 201 when service persists attempt', async () => {
    (sessions.persistLearnerContentAttempt as jest.Mock).mockResolvedValue({
      _id: 'p1',
      user_id: 'user123',
    });

    await submitEducationalGenerationRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('surfaces 503 when service throws', async () => {
    (sessions.persistLearnerContentAttempt as jest.Mock).mockRejectedValue(new Error('fail'));

    await submitEducationalGenerationRequest(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 503 }));
  });
});
