'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, User, Mail, Lock } from "lucide-react";
import { socialWelfareAuthApi } from "@/lib/api/socialWelfareAuth";
import toast from 'react-hot-toast';


export default function SocialWelfareRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
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
      await socialWelfareAuthApi.register(form);
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push("/social-welfare/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-green-50">
              <CardTitle className="text-center text-xl font-semibold text-gray-800">
                Account Registration
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Create your social welfare account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      value={form.full_name}
                      onChange={handleChange}
                      className="pl-10 border-2 border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      placeholder="Create a secure password"
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <a href="/social-welfare/login" className="text-sm text-orange-600 font-medium hover:underline hover:text-orange-700">
                  Sign In
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
