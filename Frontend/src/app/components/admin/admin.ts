import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ApiClient } from '../../core/learning-api.client';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LessonDialog } from '../lesson-dialog/lesson-dialog';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatButtonModule,
    MatIcon,
    RouterLink,
    MatPaginatorModule,
    MatDialogModule,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  allUsers: any[] = [];
  allHistory: any[] = [];
  totalUsers = 0;
  totalHistory = 0;
  userPageSize = 10;
  historyPageSize = 10;
  userPageIndex = 0;
  historyPageIndex = 0;
  /** When set, the history table shows one learner’s timeline until reset. */
  scopedLearnerId: string | null = null;

  userColumns: string[] = ['name', 'phone', 'role', 'actions'];
  historyColumns: string[] = ['userName', 'date', 'prompt', 'view'];

  constructor(
    private readonly gateway: ApiClient,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadUsers(1, this.userPageSize);
    this.loadGlobalHistory(1, this.historyPageSize);
  }

  loadUsers(page = 1, limit = 10) {
    this.gateway.fetchUsers(page, limit).subscribe({
      next: (res) => {
        this.allUsers = res.data ?? [];
        this.totalUsers = res.total ?? 0;
      },
      error: (err) => console.error('Error loading users', err),
    });
  }

  loadGlobalHistory(page = 1, limit = 10) {
    this.scopedLearnerId = null;
    this.gateway.getAllHistory(page, limit).subscribe({
      next: (res: any) => {
        this.allHistory = res.data ?? [];
        this.totalHistory = res.total ?? 0;
      },
      error: (err) => console.error('Error loading history', err),
    });
  }

  onUserPageChange(event: PageEvent) {
    this.userPageIndex = event.pageIndex;
    this.userPageSize = event.pageSize;
    this.loadUsers(event.pageIndex + 1, event.pageSize);
  }

  onHistoryPageChange(event: PageEvent) {
    this.historyPageIndex = event.pageIndex;
    this.historyPageSize = event.pageSize;
    if (this.scopedLearnerId) {
      this.loadScopedHistory(this.scopedLearnerId, event.pageIndex + 1, event.pageSize);
    } else {
      this.loadGlobalHistory(event.pageIndex + 1, event.pageSize);
    }
  }

  viewHistory(userId: string) {
    this.scopedLearnerId = userId;
    this.historyPageIndex = 0;
    this.loadScopedHistory(userId, 1, this.historyPageSize);
  }

  private loadScopedHistory(userId: string, page: number, limit: number) {
    this.gateway.getUserHistory(userId).subscribe({
      next: (res: any) => {
        const rows = Array.isArray(res) ? res : [];
        const skip = (page - 1) * limit;
        this.allHistory = rows.slice(skip, skip + limit);
        this.totalHistory = rows.length;
      },
      error: (err) => console.error('Error loading learner history', err),
    });
  }

  displayUserName(user: { name?: string }): string {
    return String(user?.name ?? '—');
  }

  displayLearner(entry: { user_id?: { name?: string } }): string {
    return String(entry.user_id?.name ?? 'Unknown user');
  }

  displayPrompt(entry: { prompt?: string }): string {
    return String(entry.prompt ?? '—');
  }

  resetHistoryScope() {
    this.historyPageIndex = 0;
    this.loadGlobalHistory(1, this.historyPageSize);
  }

  openLessonEntry(entry: any) {
    let parsedResponse: Record<string, unknown>;
    try {
      parsedResponse =
        typeof entry.response === 'string' ? JSON.parse(entry.response) : entry.response;
    } catch {
      parsedResponse = { content: entry.response };
    }

    const topicRaw = entry.sub_category_id?.name || entry.sub_category_id || 'Saved lesson';
    const contentRaw =
      (parsedResponse as { content?: string }).content ||
      (parsedResponse as { explanation?: string }).explanation ||
      entry.response;
    const exercisesRaw =
      (parsedResponse as { exercises?: string[] }).exercises ||
      ((parsedResponse as { task?: string }).task
        ? [(parsedResponse as { task?: string }).task!]
        : []);

    const dialogData = {
      topic: String(topicRaw),
      content: String(contentRaw),
      exercises: exercisesRaw.map((x) => String(x)),
    };

    this.dialog.open(LessonDialog, {
      width: '640px',
      maxWidth: '95vw',
      data: dialogData,
    });
  }
}
