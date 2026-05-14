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
    const raw = row.sub_category_id?.name ?? row.sub_category_id ?? 'General';
    return toEnglishUiText(String(raw), 'General');
  }

  rowPrompt(row: any): string {
    return toEnglishUiText(String(row.prompt ?? ''), '—');
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
      topic: toEnglishUiText(String(topicRaw), 'Saved lesson'),
      content: toEnglishUiText(String(contentRaw), '(No English text in this record.)'),
      exercises: exercisesRaw.map((x: unknown) => toEnglishUiText(String(x), '(Item omitted.)')),
    };

    this.dialog.open(LessonDialog, {
      width: '640px',
      maxWidth: '95vw',
      data: dialogData,
      direction: 'ltr',
    });
  }

}
