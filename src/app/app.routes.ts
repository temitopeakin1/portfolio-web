import { Routes } from '@angular/router';
import { adminGuard, adminGuestGuard } from './core/blog/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'tech-stack', loadComponent: () => import('./pages/tech-stack/tech-stack.component').then(m => m.TechStackComponent) },
  { path: 'projects', loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent) },
  { path: 'blog', loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./pages/blog/blog-post.component').then(m => m.BlogPostComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  {
    path: 'admin/login',
    canActivate: [adminGuestGuard],
    loadComponent: () => import('./pages/admin/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'blog', pathMatch: 'full' },
      {
        path: 'blog',
        loadComponent: () => import('./pages/admin/admin-blog-list.component').then(m => m.AdminBlogListComponent),
      },
      {
        path: 'blog/new',
        loadComponent: () => import('./pages/admin/admin-blog-editor.component').then(m => m.AdminBlogEditorComponent),
      },
      {
        path: 'blog/:slug/edit',
        loadComponent: () => import('./pages/admin/admin-blog-editor.component').then(m => m.AdminBlogEditorComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
