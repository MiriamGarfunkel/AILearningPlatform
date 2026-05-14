import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonDialog } from './lesson-dialog';

describe('LessonDialog', () => {
  let component: LessonDialog;
  let fixture: ComponentFixture<LessonDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
