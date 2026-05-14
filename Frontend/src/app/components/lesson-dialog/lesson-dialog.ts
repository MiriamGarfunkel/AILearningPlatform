import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { toEnglishUiText } from '../../shared/english-display';

export interface LessonDialogData {
  topic: string;
  content: string;
  exercises: string[];
}

@Component({
  selector: 'app-lesson-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './lesson-dialog.html',
  styleUrl: './lesson-dialog.css',
})
export class LessonDialog {
  readonly data: LessonDialogData;

  constructor(@Inject(MAT_DIALOG_DATA) raw: Record<string, unknown>) {
    const exercisesIn = Array.isArray(raw['exercises']) ? (raw['exercises'] as unknown[]) : [];
    this.data = {
      topic: toEnglishUiText(String(raw['topic'] ?? ''), 'Lesson'),
      content: toEnglishUiText(String(raw['content'] ?? ''), '(No English text in this record.)'),
      exercises: exercisesIn.map((x) => toEnglishUiText(String(x), '—')),
    };
  }

  printLesson() {
    const printContent = document.querySelector('.stylish-content');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

    if (WindowPrt && printContent) {
      WindowPrt.document.write(`
      <html dir="ltr" lang="en">
        <head><title>${this.data.topic}</title></head>
        <body style="font-family: system-ui, sans-serif; padding: 40px; background:#000; color:#fff;">
          <h1>${this.data.topic}</h1>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    }
  }
}
