// app/login/page.tsx (Simplified)
import { Suspense } from "react";

import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Logo from "@/components/customUI/logo";
import LoginForm from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* County Branding - Minimal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-3 py-1 mb-3">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">
              Nairobi City County
            </span>
          </div>
          <div className="flex justify-center mb-2">
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center">
              <Logo />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center border-b border-border/50 pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Suspense
              fallback={<div className="text-center py-4">Loading...</div>}
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Secure login • Powered by Smart Nairobi
        </p>
      </div>
    </div>
  );
}
