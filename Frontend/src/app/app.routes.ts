import { Routes } from "@angular/router";
import { Dashboard } from "./components/dashboard/dashboard";
import { History } from "./components/history/history";
import { Admin } from "./components/admin/admin";
import { authGuard } from "./guards/auth-guard";
import { adminGuard } from "./guards/admin-guard";
import { Login } from "./components/login/login";
import { Register } from "./components/register/register";
import { Welcome } from "./components/welcome/welcome";

export const routes: Routes = [
    { path: 'welcome', component: Welcome },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'history', component: History, canActivate: [authGuard] },
    { path: 'admin', component: Admin, canActivate: [adminGuard] },
    { path: '', redirectTo: '/welcome', pathMatch: 'full' }
];
