import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/Homepage.vue'
import Products from '@/components/Products.vue'
import Cart from '@/components/Cart.vue'
import Login from '@/components/Login.vue'
import Contact from '@/components/Contact.vue'
import FAQ from '@/components/FAQ.vue'
import Orders from '@/components/Orders.vue'
import Register from '@/components/Register.vue'
import ResetPassword from '@/components/ResetPassword.vue'
import ProductsCategory from '@/components/ProductsCategory.vue'
import ProductDetails from '@/components/ProductDetails.vue'
import EditProduct from '@/components/EditProduct.vue'
import CreateProduct from '@/components/CreateProduct.vue'
import NotFound from '@/components/NotFound.vue'
Cart
Login
import EditUser from '@/components/EditUser.vue'
import Checkout from '@/components/Checkout.vue'
import ForgotPassword from '@/components/ForgotPassword.vue'
import AppwriteService from '@/services/AppwriteService';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: { requiresAuth: false }
    },
    {
      path: '/products/:category/:id',
      name: 'ProductDetail',
      component: ProductDetails,
      meta: { requiresAuth: true }
    },
    {
      path: '/products/:category',
      name: 'Category',
      component: ProductsCategory,
      meta: { requiresAuth: false }
    },
    {
      path: '/products',
      name: 'Products',
      component: Products,
      meta: { requiresAuth: false }
    },
    {
      path: '/products/edit/:id',
      name: 'EditProduct',
      component: EditProduct,
      meta: { requiresAuth: true, isAdminOnly: true }
    },
    {
      path: '/products/create',
      name: 'CreateProduct',
      component: CreateProduct,
      meta: { requiresAuth: true, isAdminOnly: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/edit_profile',
      name: 'EditUser',
      component: EditUser,
      meta: { requiresAuth: true, isAdminOnly: false }
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart,
      meta: { requiresAuth: true, isAdminOnly: false }
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact,
      meta: { requiresAuth: false }
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: FAQ,
      meta: { requiresAuth: false }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: Orders,
      meta: { requiresAuth: true, isAdminOnly: false }
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: Checkout,
      meta: { requiresAuth: true, isAdminOnly: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { requiresAuth: false }
    },
    {
      path: '/reset_password',
      name: 'ResetPassword',
      component: ResetPassword,
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot_password',
      name: 'ForgotPassword',
      component: ForgotPassword,
      meta: { requiresAuth: false }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { requiresAuth: false }
    },

  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach(async (to, from, next) => {
  // 1. Fetch the user and their profile (including role) from Appwrite
  const user = await AppwriteService.getFullUser();

  const loggedIn = !!user;
  const isAdmin = user?.role === 'admin'; // Explicitly check for 'admin' role
  // 2. Logic for Auth-protected routes
  if (to.meta.requiresAuth && !loggedIn) {
    return next('/login');
  }

  // 3. Logic for Admin-only routes (e.g., Add Product)
  if (to.meta.adminOnly === true && !isAdmin) {
    return next('/');
  }

  // 4. Logic for Customer-only routes (e.g., if you want to hide certain pages from Admin)
  if (to.meta.adminOnly === false && isAdmin) {
    return next('/');
  }

  // 5. Allow navigation
  next();
});



export default router
