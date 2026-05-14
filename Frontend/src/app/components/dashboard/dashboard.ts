import { Component, OnInit } from '@angular/core';
import { LearningApiClient } from '../../core/learning-api.client';
import { Router, RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { toEnglishUiText } from '../../shared/english-display';

interface LessonViewModel {
  topic: string;
  content: string;
  exercises: string[];
  isMock: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
  ],
})
export class Dashboard implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  subCategories: any[] = [];
  filteredSubCategories: any[] = [];

  selectedCategoryId = '';
  selectedSubCategoryId = '';

  categorySearch = '';
  subCategorySearch = '';
  userPrompt = '';
  isLoading = false;
  userName = '';
  lessonData: LessonViewModel | null = null;
  /** Shown in-page after a lesson is saved (in addition to snackbar). */
  saveSuccess = false;

  isAdmin = false;

  constructor(
    private readonly gateway: LearningApiClient,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || '';
    this.isAdmin = localStorage.getItem('role') === 'admin';
    this.loadCategories();
  }

  /** Display name from session (same script as stored on the server). */
  get greetingName(): string {
    return (this.userName || localStorage.getItem('userName') || '').trim() || 'Guest';
  }

  loadCategories(): void {
    this.gateway.fetchCategoryBranches().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : res.data || [];
        this.filteredCategories = [...this.categories];
      },
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  filterCategories(): void {
    const filterValue = this.categorySearch.toLowerCase();
    this.filteredCategories = this.categories.filter((cat) =>
      String(cat.name).toLowerCase().includes(filterValue),
    );
  }

  filterSubCategories(): void {
    const filterValue = this.subCategorySearch.toLowerCase();
    this.filteredSubCategories = this.subCategories.filter((sub) =>
      String(sub.name).toLowerCase().includes(filterValue),
    );
  }

  onCategorySelected(event: any): void {
    const selectedName = event.option.value;
    const category = this.categories.find((c) => c.name === selectedName);
    if (category) {
      this.selectedCategoryId = category._id;
      this.loadSubCategories();
    }
  }

  loadSubCategories(): void {
    if (!this.selectedCategoryId) return;
    this.gateway.fetchTopicsForBranch(this.selectedCategoryId).subscribe((res: any) => {
      this.subCategories = Array.isArray(res) ? res : res.data || [];
      this.filteredSubCategories = [...this.subCategories];
    });
  }

  logout(): void {
    localStorage.clear();
    void this.router.navigate(['/login']);
  }

  triggerEducationalPipeline(): void {
    if (!this.categorySearch || !this.userPrompt) {
      this.snackBar.open('Choose a category and enter what you want to learn.', 'OK', {
        duration: 4000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isLoading = true;
    this.lessonData = null;
    this.saveSuccess = false;

    const category = this.categories.find(
      (c) => String(c.name).toLowerCase() === this.categorySearch.toLowerCase(),
    );

    if (!category) {
      this.gateway.proposeCategoryBranch({ name: this.categorySearch }).subscribe({
        next: (newCat: any) => {
          this.categories.push(newCat);
          this.selectedCategoryId = newCat._id;
          this.handleSubCategoryAndSend();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Failed to create category', err);
          const message = err.error?.message || 'Could not create category.';
          this.snackBar.open(message, 'OK', { duration: 5000, panelClass: ['error-snackbar'] });
        },
      });
    } else {
      this.selectedCategoryId = category._id;
      this.handleSubCategoryAndSend();
    }
  }

  private handleSubCategoryAndSend(): void {
    const existingSub = this.subCategories.find(
      (s) => String(s.name).toLowerCase() === this.subCategorySearch.toLowerCase(),
    );
    this.selectedSubCategoryId = existingSub ? existingSub._id : this.subCategorySearch;
    this.sendToAI();
  }

  private sendToAI(): void {
    const userId = localStorage.getItem('userId');
    const cleanCategory = this.categorySearch;
    const cleanSubCategory = this.subCategorySearch || 'General';

    const payload = {
      user_id: userId,
      category_id: this.selectedCategoryId,
      sub_category_id: this.selectedSubCategoryId || '',
      prompt: this.userPrompt,
    };

    this.gateway.submitEducationalContentRequest(payload).subscribe({
      next: (res: any) => {
        this.applyLessonFromApiResponse(
          res,
          toEnglishUiText(cleanCategory, 'General'),
          toEnglishUiText(cleanSubCategory, 'General'),
        );
        this.isLoading = false;
        this.saveSuccess = !!this.lessonData;
        if (this.lessonData) {
          this.snackBar.open('Success — lesson saved. Scroll down to read it.', 'OK', {
            duration: 5500,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar'],
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg =
          err.error?.message || 'The lesson could not be generated. Please try again later.';
        this.snackBar.open(errorMsg, 'OK', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
        console.error('Lesson generation failed', err);
      },
    });
  }

  /**
   * Maps API `{ success, data: savedPrompt }` into the lesson card.
   * Backend stores JSON in `response` with `explanation`, `task`, optional `exercises`, `content`.
   */
  private applyLessonFromApiResponse(
    body: Record<string, unknown>,
    categoryLabel: string,
    subCategoryLabel: string,
  ): void {
    const categoryLabelEn = toEnglishUiText(categoryLabel, 'General');
    const subCategoryLabelEn = toEnglishUiText(subCategoryLabel, 'General');
    const record = (body?.['data'] ?? body) as Record<string, unknown>;
    const rawResponse = record?.['response'];
    const contentOrigin = record?.['content_origin'];

    if (rawResponse == null) {
      this.lessonData = null;
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed =
        typeof rawResponse === 'string'
          ? (JSON.parse(rawResponse) as Record<string, unknown>)
          : (rawResponse as Record<string, unknown>);
    } catch {
      this.lessonData = {
        topic: toEnglishUiText(`${categoryLabelEn} — ${subCategoryLabelEn}`, 'Lesson'),
        content: toEnglishUiText(String(rawResponse), '(No English lesson text available.)'),
        exercises: [],
        isMock: contentOrigin === 'offline_stub',
      };
      return;
    }

    const explanation = parsed['explanation'];
    const content = parsed['content'];
    const task = parsed['task'];
    const exercisesRaw = parsed['exercises'];
    const topicFromPayload = parsed['topic'];

    const exercises: string[] = [];
    if (Array.isArray(exercisesRaw)) {
      for (const ex of exercisesRaw) {
        exercises.push(toEnglishUiText(String(ex), '(Practice item omitted.)'));
      }
    } else if (typeof task === 'string' && task.trim()) {
      exercises.push(toEnglishUiText(task.trim(), '(Practice item omitted.)'));
    }

    const bodyText =
      [typeof content === 'string' ? content : '', typeof explanation === 'string' ? explanation : '']
        .map((s) => s.trim())
        .filter(Boolean)
        .join('\n\n') || 'Lesson content';

    const primaryContent = toEnglishUiText(
      typeof content === 'string' && content.trim()
        ? content.trim()
        : typeof explanation === 'string' && explanation.trim()
          ? explanation.trim()
          : bodyText,
      '(No English lesson text available.)',
    );

    const topicLabel = toEnglishUiText(
      typeof topicFromPayload === 'string' && topicFromPayload.trim()
        ? topicFromPayload.trim()
        : `${categoryLabelEn} — ${subCategoryLabelEn}`,
      'Lesson',
    );

    const isMock =
      parsed['isMock'] === true ||
      contentOrigin === 'offline_stub' ||
      String(parsed['providerChannel'] || '').includes('offline');

    this.lessonData = {
      topic: topicLabel,
      content: primaryContent,
      exercises,
      isMock,
    };
  }
}
