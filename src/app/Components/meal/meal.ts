import { Component, OnInit,signal,input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firebase } from '../../auth/firebase';
import { setDoc,doc,serverTimestamp, deleteDoc, getDoc, collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Navbar } from "../navbar/navbar";
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { ToastService } from '../../Services/toast.service';

@Component({
  selector: 'app-product',
  imports: [CommonModule, Navbar, FormsModule, LoadingSpinner],
  providers: [Firebase],
  templateUrl: './meal.html',
  styleUrl: './meal.css',
})
export class Meal implements OnInit {
  constructor(private route:ActivatedRoute,private router:Router, public firebase:Firebase, private toast: ToastService){}
  id:any;
  meal:any;
  isDisabled = signal(false)
  loading = signal(true)

  img = signal('')
  name = signal('')
  country = signal('')
  description = signal('')
  ingredients:any = signal([])
  category:any = signal('')
  author = signal('')
  posts:any = signal([])
  comments = signal<any[]>([])
  newComment = signal('')
  currentUsername = signal('')
  isOwnRecipe = signal(false)
  ratings = signal<any[]>([])
  averageRating = signal(0)
  userRating = signal(0)
  reviewText = signal('')
  reviews = signal<any[]>([])

  async getMealInfo(id:number)
  {
    try 
    {
      const data = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const res = await data.json();
      if (!res || !res.meals || res.meals.length === 0) {
        this.toast.error(`Unable to find the meal with id ${id}`);
        return null;
      }
      return res;
    }
    catch(err)
    {
      this.toast.error(`Unable to find the item with id ${id}`);
      return null;
    }
  }
  getIngredients(meal:any)
  {
    // Reset ingredients first
    this.ingredients.set([]);
    
    // Check if it's a TheMealDB meal (has strIngredient fields)
    if (meal.strIngredient1) {
      for (let i = 1; i <= 20; i++)
      {
        const ing = meal[`strIngredient${i}`]
        if (ing && ing.trim() != "")
        {
          this.ingredients.set([...this.ingredients(),ing.trim()])
        }
      }
    }
    // Otherwise it's a user post (has ingredients array)
    else if (meal.ingredients && Array.isArray(meal.ingredients)) {
      this.ingredients.set(meal.ingredients);
    }
    
    return this.ingredients();
  }

  async getUserPost(mealId:any)
  {
    // Find and return user post data from Firestore
    try 
    {
      // Convert mealId to string for comparison (Firestore document IDs are strings)
      const searchId = String(mealId);
      
      const usersRef = collection(this.firebase.db, 'users');
      const users = await getDocs(usersRef);
      for (const userDoc of users.docs) 
      {
        const coll = collection(this.firebase.db,'users',userDoc.id,'posts');
        const posts = await getDocs(coll);
        for (const postDoc of posts.docs) 
        {
          // Compare as strings to ensure match
          if (String(postDoc.id) === searchId)
          {
            // Found the post, return the post data
            return {
              data: postDoc.data(),
              userId: userDoc.id,
              postId: postDoc.id
            };
          }
        }
      }
      return null; // Post not found
    }
    catch(err:any)
    {
      console.log(`error getting user post: ${err.message}`)
      return null;
    }
  }
  async getMeal(mealId:any)
  {
    const uuid = this.firebase.user()?.uid;
    const db = this.firebase.db;
    // console.log(`uuid value is ${uuid}`)
    const refDoc = doc(db, "users", uuid, "savedRecipes", mealId);
    // mealDoc.data()
    const meal = await getDoc(refDoc)
    if (meal.exists())
    {
      console.log(meal.data())
    }
    else
    {
      return;
    }
    return meal.data();
  }
  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const id = this.route.snapshot.paramMap.get('id');
      this.id = id;
      
      // First, check if it's a user post (stored in Firestore)
      const userPost = await this.getUserPost(id);
    
    if (userPost) {
      // It's a user post - use Firestore data
      const mealData = userPost.data;
      this.name.set(mealData['name'] || '');
      this.country.set(mealData['country'] || '');
      this.description.set(mealData['description'] || '');
      this.getIngredients(mealData);
      this.img.set(mealData['image'] || '');
      this.category.set(mealData['category'] || '');
      this.author.set(mealData['publisher'] || '');
      
      // Check if current user posted this recipe (disable save if they did)
      const currentUserId = this.firebase.user()?.uid;
      if (currentUserId === userPost.userId) {
        this.isDisabled.set(true); // Disable save for own recipes
        this.isOwnRecipe.set(true); // Hide follow button for own recipes
      } else {
        // Check if current user has saved this recipe
        const savedMeal = await this.getMeal(id);
        if (savedMeal)
          this.isDisabled.set(true);
      }
    }
    else {
      // Not a user post - try TheMealDB API
      this.meal = await this.getMealInfo(Number(id));
      
      // Check if meal data was successfully retrieved
      if (!this.meal || !this.meal.meals || this.meal.meals.length === 0) {
        this.toast.error('Meal not found');
        this.router.navigate(['/home']);
        return;
      }
      
      const mealData = this.meal.meals[0];
      this.name.set(mealData.strMeal);
      this.country.set(mealData.strArea);
      this.description.set(mealData.strInstructions);
      this.getIngredients(mealData);
      this.img.set(mealData.strMealThumb);
      this.category.set(mealData.strCategory);
      this.author.set('admin');
      
      // Check if current user has saved this recipe
      const meal = await this.getMeal(id);
      if (meal)
        this.isDisabled.set(true);
    }

      // Load current username, comments, ratings, and reviews
      await this.getCurrentUsername();
      await this.loadComments();
      await this.loadRatings();
      await this.loadReviews();
      await this.checkUserRating();
    } finally {
      this.loading.set(false);
    }
  }

  async getCurrentUsername() {
    const currentUserId = this.firebase.user()?.uid;
    if (currentUserId) {
      try {
        const userDoc = await getDoc(doc(this.firebase.db, 'users', currentUserId));
        if (userDoc.exists()) {
          this.currentUsername.set(userDoc.data()['username'] || '');
        }
      } catch (err: any) {
        console.error('Error getting username:', err);
      }
    }
  }

  async loadComments() {
    try {
      const commentsColl = collection(this.firebase.db, 'meals', String(this.id), 'comments');
      const commentsQuery = query(commentsColl, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const commentsList: any[] = [];
      commentsSnapshot.docs.forEach(commentDoc => {
        const data = commentDoc.data();
        // Convert Firestore timestamp to Date if needed
        let createdAt = data['createdAt'];
        if (createdAt && createdAt.toDate) {
          createdAt = createdAt.toDate();
        } else if (createdAt && createdAt instanceof Timestamp) {
          createdAt = createdAt.toDate();
        }
        
        commentsList.push({
          id: commentDoc.id,
          ...data,
          createdAt: createdAt
        });
      });

      this.comments.set(commentsList);
    } catch (err: any) {
      console.error('Error loading comments:', err);
    }
  }

  async addComment() {
    const commentText = this.newComment().trim();
    if (!commentText) {
      this.toast.warning('Please enter a comment');
      return;
    }

    const currentUserId = this.firebase.user()?.uid;
    if (!currentUserId) {
      this.toast.warning('You must be logged in to comment');
      return;
    }

    try {
      const commentsColl = collection(this.firebase.db, 'meals', String(this.id), 'comments');
      await addDoc(commentsColl, {
        text: commentText,
        username: this.currentUsername(),
        userId: currentUserId,
        createdAt: serverTimestamp()
      });

      this.newComment.set('');
      await this.loadComments(); // Reload comments
      this.toast.success('Comment added successfully!');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      this.toast.error('Error adding comment: ' + err.message);
    }
  }

  canDeleteComment(comment: any): boolean {
    const currentUserId = this.firebase.user()?.uid;
    if (!currentUserId) return false;
    return comment.userId === currentUserId;
  }

  async deleteComment(commentId: string) {
    const currentUserId = this.firebase.user()?.uid;
    if (!currentUserId) {
      this.toast.warning('You must be logged in to delete comments');
      return;
    }

    try {
      const commentDocRef = doc(this.firebase.db, 'meals', String(this.id), 'comments', commentId);
      await deleteDoc(commentDocRef);
      await this.loadComments(); // Reload comments
      this.toast.success('Comment deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      this.toast.error('Error deleting comment: ' + err.message);
    }
  }

  async loadRatings() {
    try {
      const ratingsColl = collection(this.firebase.db, 'meals', String(this.id), 'ratings');
      const ratingsSnapshot = await getDocs(ratingsColl);
      
      const ratingsList: any[] = [];
      let totalRating = 0;
      let count = 0;

      ratingsSnapshot.docs.forEach(ratingDoc => {
        const data = ratingDoc.data();
        ratingsList.push({
          id: ratingDoc.id,
          ...data
        });
        if (data['rating']) {
          totalRating += data['rating'];
          count++;
        }
      });

      this.ratings.set(ratingsList);
      this.averageRating.set(count > 0 ? totalRating / count : 0);
    } catch (err: any) {
      console.error('Error loading ratings:', err);
    }
  }

  async checkUserRating() {
    const currentUserId = this.firebase.user()?.uid;
    if (!currentUserId) return;

    try {
      const userRatingDoc = await getDoc(
        doc(this.firebase.db, 'meals', String(this.id), 'ratings', currentUserId)
      );
      if (userRatingDoc.exists()) {
        this.userRating.set(userRatingDoc.data()['rating'] || 0);
      }
    } catch (err: any) {
      console.error('Error checking user rating:', err);
    }
  }

  async submitRating(rating: number) {
    const currentUserId = this.firebase.user()?.uid;
    if (!currentUserId) {
      this.toast.warning('You must be logged in to rate recipes');
      return;
    }

    try {
      const ratingDocRef = doc(this.firebase.db, 'meals', String(this.id), 'ratings', currentUserId);
      await setDoc(ratingDocRef, {
        rating: rating,
        userId: currentUserId,
        username: this.currentUsername(),
        createdAt: serverTimestamp()
      });

      this.userRating.set(rating);
      await this.loadRatings();
      this.toast.success('Rating submitted!');
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      this.toast.error('Error submitting rating: ' + err.message);
    }
  }

  async loadReviews() {
    try {
      const reviewsColl = collection(this.firebase.db, 'meals', String(this.id), 'reviews');
      const reviewsQuery = query(reviewsColl, orderBy('createdAt', 'desc'));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewsList: any[] = [];
      reviewsSnapshot.docs.forEach(reviewDoc => {
        const data = reviewDoc.data();
        let createdAt = data['createdAt'];
        if (createdAt && createdAt.toDate) {
          createdAt = createdAt.toDate();
        } else if (createdAt && createdAt instanceof Timestamp) {
          createdAt = createdAt.toDate();
        }
        
        reviewsList.push({
          id: reviewDoc.id,
          ...data,
          createdAt: createdAt
        });
      });

      this.reviews.set(reviewsList);
    } catch (err: any) {
      console.error('Error loading reviews:', err);
    }
  }

  async submitReview() {
    const reviewText = this.reviewText().trim();
    if (!reviewText) {
      this.toast.warning('Please write a review');
      return;
    }

    if (this.userRating() === 0) {
      this.toast.warning('Please rate the recipe first');
      return;
    }

    const currentUserId = this.firebase.user()?.uid;
    if (!currentUserId) {
      this.toast.warning('You must be logged in to review recipes');
      return;
    }

    try {
      const reviewDocRef = doc(this.firebase.db, 'meals', String(this.id), 'reviews', currentUserId);
      await setDoc(reviewDocRef, {
        text: reviewText,
        rating: this.userRating(),
        userId: currentUserId,
        username: this.currentUsername(),
        createdAt: serverTimestamp()
      });

      this.reviewText.set('');
      await this.loadReviews();
      this.toast.success('Review submitted!');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      this.toast.error('Error submitting review: ' + err.message);
    }
  }

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    return stars;
  }

  goToSaved()
  {
    this.router.navigate(['/savedMeals',this.id])
  }
  async removeRecipe()
  {
    // const user = this.firebase.user();
    const userUID = this.firebase.user()?.uid;
    try 
    {
      const docRef = doc(this.firebase.db, 'users', userUID, 'savedRecipes', this.id);
      await deleteDoc(docRef);
      this.toast.success(`${this.name()} meal deleted successfully`);
    }
    catch(error: any)
    {
      this.toast.error(`Error: Can't delete the meal.`);
    }
    this.goToSaved();
  }

  async getUsersRecipes(mealId:any)
  {
    // Find the user who created the post with the given meal ID
    try 
    {
      const usersRef = collection(this.firebase.db, 'users');
      const users = await getDocs(usersRef);
      for (const userDoc of users.docs) 
      {
        const coll = collection(this.firebase.db,'users',userDoc.id,'posts');
        const posts = await getDocs(coll);
        for (const postDoc of posts.docs) 
        {
          if (postDoc.id == mealId)
          {
            // Found the post, return the username of the user who created it
            return userDoc.data()['username'];
          }
        }
      }
      return null; // Post not found
    }
    catch(err:any)
    {
      console.log(`error from user recipes is ${err.message}`)
      return null;
    }
  }

  async followUser(id:any)
  {
    try
    {
      const currentUserId = this.firebase.user()?.uid;
      if (!currentUserId) {
        this.toast.warning('You must be logged in to follow users');
        return;
      }

      const meal = await this.getMeal(id);
      let author = null;
      let uid:any = null; // id of user to be followed (user who created the current meal)
      
      // Check if meal is saved and has a publisher
      if (meal && meal['publisher'])
      {
        author = meal['publisher'];
      }
      else
      {
        // Published by user but not saved - search through user posts
        author = await this.getUsersRecipes(id);
      }

      // If no author found or author is admin, cannot follow
      if (!author || author === 'admin') {
        this.toast.warning('Cannot follow admin or meal not found');
        return;
      }

      // Prevent following yourself - check if current user is the author
      const currentUserDoc = await getDoc(doc(this.firebase.db, 'users', currentUserId));
      if (currentUserDoc.exists() && currentUserDoc.data()['username'] === author) {
        this.toast.warning('You cannot follow yourself');
        return;
      }

      // Find the user ID by username
      const userColl = collection(this.firebase.db,'users');
      const users = await getDocs(userColl);
      for (const userDoc of users.docs) 
      {
        const user = userDoc.data();
        if (user['username'] === author)
        {
          uid = userDoc.id;
          break;
        }
      }

      if (!uid) {
        this.toast.error(`User ${author} not found`);
        return;
      }

      // Check if already following
      const followDocRef = doc(this.firebase.db, 'users', currentUserId, 'followed', uid);
      const followDoc = await getDoc(followDocRef);
      if (followDoc.exists()) {
        this.toast.info(`You are already following ${author}`);
        return;
      }

      // Get all posts from the user being followed
      const postsColl = collection(this.firebase.db, 'users', uid, 'posts');
      const postsSnapshot = await getDocs(postsColl);
      const userPosts = postsSnapshot.docs.map(postDoc => ({
        id: postDoc.id,
        ...postDoc.data()
      }));

      // Add to followed collection
      await setDoc(followDocRef, {
        username: author,
        userId: uid,
        followedAt: serverTimestamp(),
        posts: userPosts
      });

      this.toast.success(`You followed ${author}`);
    }
    catch(err:any)
    {
      console.error('Error following user:', err);
      this.toast.error(`Error: ${err.message}`);
    }
  }

  async saveRecipe()
  {
    const user = this.firebase.user();
    if (!user) {
      this.toast.warning('You must be logged in to save recipes');
      return;
    }
    
    try 
    {
      await setDoc(doc(this.firebase.db,'users',user.uid,'savedRecipes',String(this.id)),{
        savedAt: serverTimestamp(),
        id: this.id,
        name: this.name(),
        country: this.country(),
        description: this.description(),
        image: this.img(),
        category: this.category(),
        ingredients: this.ingredients(),
        publisher: this.author()
      })
      this.isDisabled.set(true); // Disable button after saving
      this.toast.success(`Meal "${this.name()}" saved successfully!`)
    }
    catch(error: any)
    {
      console.log(error.message)
      this.toast.error(`Can't store ${this.name()} meal: ${error.message}`)
    }
  }

}
