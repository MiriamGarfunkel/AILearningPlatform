import { Component, OnInit } from '@angular/core';
import { LearningApiClient } from '../../core/learning-api.client';
import { Router, RouterModule } from '@angular/router'; // הוספת RouterModule עבור ה-routerLink

// ייבוא המודולים הנדרשים
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
    MatSnackBarModule
  ],
})
export class Dashboard implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  subCategories: any[] = [];
  filteredSubCategories: any[] = [];

  selectedCategoryId: string = '';
  selectedSubCategoryId: string = '';

  categorySearch: string = '';
  subCategorySearch: string = '';
  userPrompt: string = '';
  aiResponse: string = '';
  isLoading: boolean = false;
  userName: string = '';
  lessonData: any = null;

  isAdmin: boolean = false;

  constructor(
    private readonly gateway: LearningApiClient,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.userName = localStorage.getItem('userName') || 'אורח/ת';

    const userRole = localStorage.getItem('role');
    this.isAdmin = userRole === 'admin';

    this.loadCategories();
  }

  loadCategories() {
    this.gateway.fetchCategoryBranches().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : (res.data || []);
        this.filteredCategories = [...this.categories];
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  filterCategories() {
    const filterValue = this.categorySearch.toLowerCase();
    this.filteredCategories = this.categories.filter(cat =>
      cat.name.toLowerCase().includes(filterValue)
    );
  }

  filterSubCategories() {
    const filterValue = this.subCategorySearch.toLowerCase();
    this.filteredSubCategories = this.subCategories.filter(sub =>
      sub.name.toLowerCase().includes(filterValue)
    );
  }

  onCategorySelected(event: any) {
    const selectedName = event.option.value;
    const category = this.categories.find(c => c.name === selectedName);
    if (category) {
      this.selectedCategoryId = category._id;
      this.loadSubCategories();
    }
  }

  loadSubCategories() {
    if (!this.selectedCategoryId) return;
    this.gateway.fetchTopicsForBranch(this.selectedCategoryId).subscribe((res: any) => {
      this.subCategories = Array.isArray(res) ? res : (res.data || []);
      this.filteredSubCategories = [...this.subCategories];
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  async triggerEducationalPipeline() {
    if (!this.categorySearch || !this.userPrompt) {
      alert('אנא מלא קטגוריה ושאילתה');
      return;
    }

    this.isLoading = true;

    let category = this.categories.find(c =>
      c.name.toLowerCase() === this.categorySearch.toLowerCase()
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
        }
      });
    } else {
      this.selectedCategoryId = category._id;
      this.handleSubCategoryAndSend();
    }
  }

  private handleSubCategoryAndSend() {
    const existingSub = this.subCategories.find(s =>
      s.name.toLowerCase() === this.subCategorySearch.toLowerCase()
    );
    this.selectedSubCategoryId = existingSub ? existingSub._id : this.subCategorySearch;
    this.sendToAI();
  }

  private sendToAI() {
    const userId = localStorage.getItem('userId');
    const cleanCategory = this.categorySearch;
    const cleanSubCategory = this.subCategorySearch;

    const payload = {
      user_id: userId,
      category_id: this.selectedCategoryId,
      sub_category_id: this.selectedSubCategoryId || '',
      prompt: this.userPrompt
    };

    this.gateway.submitEducationalContentRequest(payload).subscribe({
      next: (res: any) => {
        const rawResponse = res.data && res.data.response ? res.data.response : res.response;

        try {
          let parsedData = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
          parsedData.topic = `${cleanCategory} - ${cleanSubCategory}`;

          if (parsedData.exercises && Array.isArray(parsedData.exercises)) {
            parsedData.exercises = parsedData.exercises.map((ex: string) =>
              ex.replace(new RegExp(this.selectedCategoryId, 'g'), cleanCategory)
            );
          }

          this.lessonData = parsedData;
          this.aiResponse = 'SUCCESS';
        } catch (e) {
          this.lessonData = {
            topic: `${cleanCategory} - ${cleanSubCategory}`,
            content: rawResponse
          };
          this.aiResponse = rawResponse;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'השיעור לא נמסר עקב בעיות בחיבור ל-AI';
        this.snackBar.open(errorMsg, 'הבנתי', {
          duration: 5000, // יוצג ל-5 שניות
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });

        console.error('AI Generation failed', err);
      }
    });
  }
}