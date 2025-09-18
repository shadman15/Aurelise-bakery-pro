import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
  });

  const handleSignIn = async (data: SignInForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    
    if (!error) {
      onClose();
      signInForm.reset();
    }
  };

  const handleSignUp = async (data: SignUpForm) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, {
      first_name: data.firstName,
      last_name: data.lastName
    });
    setLoading(false);
    
    if (!error) {
      onClose();
      signUpForm.reset();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    
    if (!error) {
      onClose();
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    signInForm.reset();
    signUpForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-heading">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>

          {isSignUp ? (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    {...signUpForm.register('firstName')}
                    type="text"
                    placeholder="John"
                    disabled={loading}
                  />
                  {signUpForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    {...signUpForm.register('lastName')}
                    type="text"
                    placeholder="Doe"
                    disabled={loading}
                  />
                  {signUpForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...signUpForm.register('email')}
                  type="email"
                  placeholder="john@example.com"
                  disabled={loading}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...signUpForm.register('password')}
                  type="password"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  {...signUpForm.register('confirmPassword')}
                  type="password"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...signInForm.register('email')}
                  type="email"
                  placeholder="john@example.com"
                  disabled={loading}
                />
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...signInForm.register('password')}
                  type="password"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          )}

          <div className="text-center">
            <Button variant="link" onClick={toggleMode} className="text-sm">
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}