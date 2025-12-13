import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { ToastService } from '../../Services/toast.service';
import { Firebase } from '../../auth/firebase';
import { ActivatedRoute, Router } from '@angular/router';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { MealCard } from '../meal-card/meal-card';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Navbar, MealCard, LoadingSpinner],
  providers: [Firebase],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  userId: string | null = null;
  username = signal('');
  email = signal('');
  userPosts = signal<any[]>([]);
  followersCount = signal(0);
  followingCount = signal(0);
  isOwnProfile = signal(false);
  loading = signal(true);

  constructor(
    private firebase: Firebase,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    // Get user ID from route or use current user
    const routeUserId = this.route.snapshot.paramMap.get('id');
    const currentUserId = this.firebase.user()?.uid;

    if (routeUserId) {
      this.userId = routeUserId;
      this.isOwnProfile.set(routeUserId === currentUserId);
    } else if (currentUserId) {
      this.userId = currentUserId;
      this.isOwnProfile.set(true);
    } else {
      // Not logged in and no user ID provided
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);
    try {
      await this.loadUserProfile();
      await this.loadUserPosts();
      await this.loadFollowersCount();
      await this.loadFollowingCount();
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserProfile() {
    if (!this.userId) return;

    try {
      const userDoc = await getDoc(doc(this.firebase.db, 'users', this.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.username.set(userData['username'] || '');
        this.email.set(userData['email'] || '');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      this.toast.error('Error loading profile');
    }
  }

  async loadUserPosts() {
    if (!this.userId) return;

    try {
      const postsColl = collection(this.firebase.db, 'users', this.userId, 'posts');
      const postsSnapshot = await getDocs(postsColl);
      const posts: any[] = [];
      
      postsSnapshot.docs.forEach(postDoc => {
        posts.push({
          id: postDoc.id,
          ...postDoc.data()
        });
      });

      this.userPosts.set(posts);
    } catch (err: any) {
      console.error('Error loading posts:', err);
    }
  }

  async loadFollowersCount() {
    if (!this.userId) return;

    try {
      // Count how many users have this user in their 'followed' collection
      const usersRef = collection(this.firebase.db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      let count = 0;

      for (const userDoc of usersSnapshot.docs) {
        const followedRef = doc(this.firebase.db, 'users', userDoc.id, 'followed', this.userId);
        const followedDoc = await getDoc(followedRef);
        if (followedDoc.exists()) {
          count++;
        }
      }

      this.followersCount.set(count);
    } catch (err: any) {
      console.error('Error loading followers:', err);
    }
  }

  async loadFollowingCount() {
    if (!this.userId) return;

    try {
      const followedColl = collection(this.firebase.db, 'users', this.userId, 'followed');
      const followedSnapshot = await getDocs(followedColl);
      this.followingCount.set(followedSnapshot.docs.length);
    } catch (err: any) {
      console.error('Error loading following:', err);
    }
  }

  goToMeal(mealId: string) {
    this.router.navigate(['/meal', mealId]);
  }
}

