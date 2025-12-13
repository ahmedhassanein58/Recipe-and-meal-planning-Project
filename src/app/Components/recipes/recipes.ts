import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { MealCard } from '../meal-card/meal-card';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { ToastService } from '../../Services/toast.service';
import { Firebase } from '../../auth/firebase';
import { Router, ActivatedRoute } from '@angular/router';
import { collection, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-recipes',
  imports: [CommonModule, FormsModule, Navbar, MealCard, LoadingSpinner],
  providers: [Firebase],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css',
})
export class Recipes implements OnInit {
  allRecipes = signal<any[]>([]);
  filteredRecipes = signal<any[]>([]);
  userPosts = signal<any[]>([]);
  
  searchQuery = signal('');
  selectedCuisine = signal('');
  selectedCategory = signal('');
  selectedIngredient = signal('');
  cookingTimeFilter = signal('');
  
  cuisines = signal<string[]>([]);
  categories = signal<any[]>([]);
  ingredients = signal<string[]>([]);
  loading = signal(false);

  constructor(
    private firebase: Firebase, 
    private router: Router, 
    private toast: ToastService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    // Check for category query parameter
    const categoryParam = this.route.snapshot.queryParams['category'];
    if (categoryParam) {
      this.selectedCategory.set(categoryParam);
    }

    await this.loadAllRecipes();
    await this.loadCategories();
    await this.loadUserPosts();
    this.extractCuisines();
    this.extractIngredients();
    
    // Apply filters after loading data if category was set
    if (this.selectedCategory()) {
      this.applyFilters();
    }
  }

  async loadAllRecipes() {
    this.loading.set(true);
    try {
      const recipes: any[] = [];
      const letters = [];
      
      // Load recipes from TheMealDB API
      for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        try {
          const data = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
          const res = await data.json();
          if (res.meals) {
            res.meals.forEach((meal: any) => {
              recipes.push({
                ...meal,
                publisher: 'admin',
                id: meal.idMeal,
                source: 'themealdb'
              });
            });
          }
        } catch (err) {
          console.error(`Error loading recipes for letter ${letter}:`, err);
        }
      }
      
      this.allRecipes.set(recipes);
      this.filteredRecipes.set(recipes);
    } catch (err: any) {
      console.error('Error loading recipes:', err);
      this.toast.error('Error loading recipes');
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserPosts() {
    try {
      const usersRef = collection(this.firebase.db, 'users');
      const users = await getDocs(usersRef);
      const posts: any[] = [];
      
      for (const userDoc of users.docs) {
        const postsColl = collection(this.firebase.db, 'users', userDoc.id, 'posts');
        const postsSnapshot = await getDocs(postsColl);
        postsSnapshot.docs.forEach(postDoc => {
          posts.push({
            id: postDoc.id,
            ...postDoc.data(),
            source: 'user',
            publisher: postDoc.data()['publisher'] || 'Unknown'
          });
        });
      }
      
      this.userPosts.set(posts);
      // Merge user posts with all recipes
      const all = [...this.allRecipes(), ...posts];
      this.allRecipes.set(all);
      this.filteredRecipes.set(all);
    } catch (err: any) {
      console.error('Error loading user posts:', err);
    }
  }

  async loadCategories() {
    try {
      const data = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
      const res = await data.json();
      if (res.categories) {
        this.categories.set(res.categories);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
    }
  }

  extractCuisines() {
    const cuisineSet = new Set<string>();
    this.allRecipes().forEach(recipe => {
      if (recipe.strArea) {
        cuisineSet.add(recipe.strArea);
      } else if (recipe.country) {
        cuisineSet.add(recipe.country);
      }
    });
    this.cuisines.set(Array.from(cuisineSet).sort());
  }

  extractIngredients() {
    const ingredientSet = new Set<string>();
    this.allRecipes().forEach(recipe => {
      if (recipe.source === 'themealdb') {
        for (let i = 1; i <= 20; i++) {
          const ing = recipe[`strIngredient${i}`];
          if (ing && ing.trim() !== '') {
            ingredientSet.add(ing.trim());
          }
        }
      } else if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ing: string) => {
          if (ing && ing.trim() !== '') {
            ingredientSet.add(ing.trim());
          }
        });
      }
    });
    this.ingredients.set(Array.from(ingredientSet).sort());
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allRecipes()];
    const query = this.searchQuery().toLowerCase().trim();
    const cuisine = this.selectedCuisine();
    const category = this.selectedCategory();
    const ingredient = this.selectedIngredient();
    const cookingTime = this.cookingTimeFilter();

    // Search query filter
    if (query) {
      filtered = filtered.filter(recipe => {
        const name = (recipe.strMeal || recipe.name || '').toLowerCase();
        const description = (recipe.strInstructions || recipe.description || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    // Cuisine filter
    if (cuisine) {
      filtered = filtered.filter(recipe => {
        const area = recipe.strArea || recipe.country || '';
        return area === cuisine;
      });
    }

    // Category filter
    if (category) {
      filtered = filtered.filter(recipe => {
        const cat = recipe.strCategory || recipe.category || '';
        return cat === category;
      });
    }

    // Ingredient filter
    if (ingredient) {
      filtered = filtered.filter(recipe => {
        if (recipe.source === 'themealdb') {
          for (let i = 1; i <= 20; i++) {
            const ing = recipe[`strIngredient${i}`];
            if (ing && ing.toLowerCase().includes(ingredient.toLowerCase())) {
              return true;
            }
          }
          return false;
        } else {
          const ingredients = recipe.ingredients || [];
          return ingredients.some((ing: string) => 
            ing.toLowerCase().includes(ingredient.toLowerCase())
          );
        }
      });
    }

    // Cooking time filter (estimated based on instructions length)
    if (cookingTime) {
      filtered = filtered.filter(recipe => {
        const instructions = recipe.strInstructions || recipe.description || '';
        const wordCount = instructions.split(' ').length;
        
        if (cookingTime === 'quick' && wordCount < 100) return true;
        if (cookingTime === 'medium' && wordCount >= 100 && wordCount < 200) return true;
        if (cookingTime === 'long' && wordCount >= 200) return true;
        return false;
      });
    }

    this.filteredRecipes.set(filtered);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCuisine.set('');
    this.selectedCategory.set('');
    this.selectedIngredient.set('');
    this.cookingTimeFilter.set('');
    this.filteredRecipes.set([...this.allRecipes()]);
  }

  getRecipeName(recipe: any): string {
    return recipe.strMeal || recipe.name || 'Unknown';
  }

  getRecipeImage(recipe: any): string {
    return recipe.strMealThumb || recipe.image || '';
  }

  getRecipeCategory(recipe: any): string {
    return recipe.strCategory || recipe.category || 'Uncategorized';
  }

  getRecipeArea(recipe: any): string {
    return recipe.strArea || recipe.country || 'Unknown';
  }

  getRecipeId(recipe: any): string {
    return recipe.idMeal || recipe.id || '';
  }
}
