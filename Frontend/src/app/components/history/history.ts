import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LearningApiClient } from '../../core/learning-api.client';
import { LessonDialog } from '../lesson-dialog/lesson-dialog';
import { toEnglishUiText } from '../../shared/english-display';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class History implements OnInit {
  displayedColumns: string[] = ['date', 'subject', 'prompt', 'actions'];
  historyData: any[] = [];
  isLoading: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private readonly gateway: LearningApiClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.isAdmin = localStorage.getItem('role') === 'admin';
    this.loadHistory();
  }

  loadHistory() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.isLoading = true;
    const historyCall = this.isAdmin
      ? this.gateway.fetchGlobalStudyLedgerPage()
      : this.gateway.fetchLearnerTimeline(userId);

    historyCall.subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.historyData = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.isLoading = false;
      },
    });
  }

  rowTopic(row: any): string {
    // sub_category_id is stored as a name snapshot string, not a populated object
    const raw = typeof row.sub_category_id === 'object' && row.sub_category_id?.name
      ? row.sub_category_id.name
      : row.sub_category_name ?? row.sub_category_id ?? '';
    const isMongoId = /^[a-f\d]{24}$/i.test(String(raw));
    return isMongoId ? (row.sub_category_name ?? '—') : (String(raw) || '—');
  }

  rowPrompt(row: any): string {
    return String(row.prompt ?? '—');
  }

viewLesson(element: any) {
    let parsedResponse;
    try {
      parsedResponse = typeof element.response === 'string' 
        ? JSON.parse(element.response) 
        : element.response;
    } catch (e) {
      parsedResponse = { content: element.response };
    }

    const topicRaw = element.sub_category_id?.name || element.sub_category_id || 'Saved lesson';
    const contentRaw = parsedResponse.content || parsedResponse.explanation || element.response;
    const exercisesRaw = parsedResponse.exercises || (parsedResponse.task ? [parsedResponse.task] : []);

    const dialogData = {
      topic: String(topicRaw),
      content: String(contentRaw),
      exercises: exercisesRaw.map((x: unknown) => String(x)),
    };

    this.dialog.open(LessonDialog, {
      width: '640px',
      maxWidth: '95vw',
      data: dialogData,
    });
  }

}
