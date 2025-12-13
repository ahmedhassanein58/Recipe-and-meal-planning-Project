import { Component, OnInit, signal } from '@angular/core';
import { Firebase } from '../auth/firebase';
import { collection,getDocs } from 'firebase/firestore';
import { CommonModule } from '@angular/common';
import { Navbar } from "../Components/navbar/navbar";
import { LoadingSpinner } from '../Components/loading-spinner/loading-spinner';

interface ShoppingItem {
  name: string;
  mealName: string;
  checked: boolean;
}

@Component({
  selector: 'app-shopping-list',
  imports: [CommonModule, Navbar, LoadingSpinner],
  templateUrl: './shopping-list.html',
  styleUrl: './shopping-list.css',
})
export class ShoppingList implements OnInit {
  constructor(private store:Firebase){}
  mealIngredients = signal(new Map<string,string[]>()); // key value for name and ingred
  mealNames:any = signal([]) // split the meal ingredients
  mealIngreds:any = signal([]) // split the meal ingredients
  shoppingItems = signal<ShoppingItem[]>([]);
  checkedItems = signal<Set<string>>(new Set());
  loading = signal(true);

  async getPlannedMeals()
  {
    const coll = collection(this.store.db,'users',this.store.user()?.uid,'plannedMeals');
    const allMeals = await getDocs(coll)
    
    const itemsMap = new Map<string, Set<string>>(); // ingredient -> set of meal names
    
    allMeals.docs.forEach(item => {
      const mealData = item.data();
      const mealName = mealData['name'];
      const ingredients = mealData['ingredients'] || [];
      
      ingredients.forEach((ingredient: string) => {
        if (ingredient && typeof ingredient === 'string' && ingredient.trim() !== '') {
          if (!itemsMap.has(ingredient)) {
            itemsMap.set(ingredient, new Set());
          }
          itemsMap.get(ingredient)!.add(mealName);
        }
      });
    });

    // Convert to shopping items array
    const items: ShoppingItem[] = [];
    itemsMap.forEach((mealNames, ingredient) => {
      items.push({
        name: ingredient,
        mealName: Array.from(mealNames).join(', '),
        checked: this.checkedItems().has(ingredient)
      });
    });

    // Sort alphabetically
    items.sort((a, b) => a.name.localeCompare(b.name));
    this.shoppingItems.set(items);
  }

  toggleItem(item: ShoppingItem) {
    const checked = this.checkedItems();
    if (checked.has(item.name)) {
      checked.delete(item.name);
    } else {
      checked.add(item.name);
    }
    this.checkedItems.set(new Set(checked));
    
    // Update the item's checked status
    const items = this.shoppingItems();
    const index = items.findIndex(i => i.name === item.name);
    if (index !== -1) {
      items[index].checked = checked.has(item.name);
      this.shoppingItems.set([...items]);
    }
  }

  removeItem(item: ShoppingItem) {
    const items = this.shoppingItems();
    const filtered = items.filter(i => i.name !== item.name);
    this.shoppingItems.set(filtered);
    this.checkedItems().delete(item.name);
  }

  getCheckedCount(): number {
    return this.checkedItems().size;
  }

  getTotalCount(): number {
    return this.shoppingItems().length;
  }

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      await this.getPlannedMeals()
    } finally {
      this.loading.set(false);
    }
  }
}
