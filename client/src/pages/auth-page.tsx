import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { api } from "@shared/routes";

// Background Pattern
const HeroPattern = () => (
  <svg className="absolute inset-0 -z-10 h-full w-full stroke-primary/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
    <defs>
      <pattern id="983e3e43-1341-4310-a9e9-fe15da681a87" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
        <path d="M.5 200V.5H200" fill="none" />
      </pattern>
    </defs>
    <svg x="50%" y="-1" className="overflow-visible fill-primary/5">
      <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" strokeWidth="0" />
    </svg>
    <rect width="100%" height="100%" strokeWidth="0" fill="url(#983e3e43-1341-4310-a9e9-fe15da681a87)" />
  </svg>
);

export default function AuthPage() {
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();

  const loginForm = useForm<z.infer<typeof api.auth.login.input>>({
    resolver: zodResolver(api.auth.login.input),
  });

  const registerForm = useForm<z.infer<typeof api.auth.register.input>>({
    resolver: zodResolver(api.auth.register.input),
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      <div className="hidden lg:flex flex-col justify-center p-12 relative bg-primary/95 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://pixabay.com/get/g1bb7f000b8b5e7530800146b598ccf4379b6af1075cb57d9131e1d747a73d124cfbe79fd38b228a21ebd4543ca27cfc793507ba7224724af5e9f5bdf34fd69e9_1280.jpg')] bg-cover bg-center opacity-20 mix-blend-multiply"></div>
        {/* Unsplash: Vintage family photo aesthetic */}
        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-5xl font-bold mb-6 leading-tight">
            Preserving Our Heritage, Connecting Our Future.
          </h1>
          <p className="text-xl opacity-90 leading-relaxed">
            Welcome to the Falohun Family Tree. A place to explore our roots, 
            celebrate our ancestors, and stay connected with relatives across the globe.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 relative">
        <HeroPattern />
        <Card className="w-full max-w-md shadow-2xl border-primary/10 glass-panel">
          <CardHeader className="space-y-1 text-center">
            <h2 className="text-2xl font-bold font-display text-primary">Falohun Family</h2>
            <CardDescription>
              Enter your credentials to access the family portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit((d) => login(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username / Email</Label>
                    <Input id="username" {...loginForm.register("username")} placeholder="Enter your username" />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...loginForm.register("password")} placeholder="••••••••" />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoginPending}>
                    {isLoginPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit((d) => register(d))} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username / Email</Label>
                    <Input id="reg-username" {...registerForm.register("username")} placeholder="Choose a username" />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" {...registerForm.register("password")} placeholder="Choose a secure password" />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-code">Invite Code</Label>
                    <Input id="invite-code" {...registerForm.register("inviteCode")} placeholder="Enter code from admin" />
                    {registerForm.formState.errors.inviteCode && (
                      <p className="text-sm text-destructive">{registerForm.formState.errors.inviteCode.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">You need an invite code from a family administrator to join.</p>
                  </div>
                  <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" disabled={isRegisterPending}>
                    {isRegisterPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center text-xs text-muted-foreground">
            Protected by secure family authentication
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
