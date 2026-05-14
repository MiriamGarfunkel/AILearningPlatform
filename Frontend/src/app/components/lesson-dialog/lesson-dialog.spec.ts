import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LessonDialog } from './lesson-dialog';

describe('LessonDialog', () => {
  let component: LessonDialog;
  let fixture: ComponentFixture<LessonDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonDialog],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: { topic: 'T', content: 'C', exercises: [] } }],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
