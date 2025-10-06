'use client'
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/providers/AuthProvider';

export default function DistrictLoginPage() {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Call the district authority login endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/district-authority/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      // Refresh user in AuthProvider so navbar updates
      await refreshUser();
      window.location.href = '/district/dashboard';
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">District Authority Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} />
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
        </form>
        {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <a href="/district/register" className="text-blue-600 hover:underline">Register</a>
        </div>
        {/* Demo credentials for testing */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="font-semibold mb-1">Demo Credentials:</div>
          <div>Email: <span className="font-mono">user@example.com</span></div>
          <div>Password: <span className="font-mono">12345</span></div>
        </div>
      </div>
    </div>
  );
}
