'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { districtAuthApi } from "@/lib/api/districtAuth";

export default function DistrictRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    district: "",
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
      await districtAuthApi.register(form);
      router.push("/district/login");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">District Authority Register</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input name="full_name" type="text" placeholder="Full Name" required value={form.full_name} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} />
          <Input name="district" type="text" placeholder="District" required value={form.district} onChange={handleChange} />
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
        </form>
        {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <a href="/district/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
}
