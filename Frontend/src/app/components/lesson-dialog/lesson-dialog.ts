import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider'; 

@Component({
  selector: 'app-lesson-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './lesson-dialog.html',
  styleUrl: './lesson-dialog.css'
})
export class LessonDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  printLesson() {
    const printContent = document.querySelector('.stylish-content');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

    if (WindowPrt && printContent) {
      WindowPrt.document.write(`
      <html dir="rtl">
        <head><title>${this.data.topic}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
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