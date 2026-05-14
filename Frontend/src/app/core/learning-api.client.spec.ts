import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LearningApiClient } from './learning-api.client';
import { environment } from '../../environments/environment';

describe('LearningApiClient', () => {
  let client: LearningApiClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(LearningApiClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(client).toBeTruthy();
  });

  it('loads categories from configured base URL', () => {
    client.fetchCategoryBranches().subscribe();
    const req = httpMock.expectOne(`${environment.api_public_base}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
