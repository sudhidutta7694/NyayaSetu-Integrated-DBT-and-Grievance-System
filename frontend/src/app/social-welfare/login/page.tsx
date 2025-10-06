
'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, User, Lock } from "lucide-react";
import { socialWelfareAuthApi } from "@/lib/api/socialWelfareAuth";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from 'react-hot-toast';

export default function SocialWelfareLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await socialWelfareAuthApi.login(form);
      localStorage.setItem("access_token", response.access_token);
      await refreshUser();
      toast.success('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push("/social-welfare/dashboard");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4">
          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50">
              <CardTitle className="text-center text-xl font-semibold text-gray-800">
                User Authentication
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Use your email and password for secure login
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-3">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="pl-10 border-2 border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="pl-10 border-2 border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 pt-2 border-t border-gray-200 text-center">
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <a href="/social-welfare/register" className="text-sm text-orange-600 font-medium hover:underline hover:text-orange-700">
                  Create Account
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Demo Credentials</h3>
                <div className="mt-2 space-y-1 text-sm text-yellow-700">
                  <div>Email: <span className="font-mono">socialwelfareadmin@mail.com</span></div>
                  <div>Password: <span className="font-mono">12345</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
