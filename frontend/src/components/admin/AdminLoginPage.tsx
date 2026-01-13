import { useState, useEffect } from 'react';
import { useRouter } from '../Router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

export function AdminLoginPage() {
  const { navigate } = useRouter();
  const { login, user: authUser, logout } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in and is admin
  useEffect(() => {
    if (authUser) {
      const isAdmin = authUser.roles.some(r => r.name === 'ADMIN');
      
      if (isAdmin) {
        navigate('admin-dashboard');
      } else {
        // User is logged in but not admin, show error and logout
        toast.error('Access denied. Admin privileges required.');
        logout();
      }
    }
  }, [authUser, navigate, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Access restricted to administrators only
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="admin@sajilokaam.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
