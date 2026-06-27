"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useIsReturningUser } from "@/hooks/useIsReturningUser";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { markAsLoggedIn } = useIsReturningUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const res = await signIn("credentials", {
        redirect: false,
        idToken,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Mark login so the welcome-back animation plays on their next login
      markAsLoggedIn(userCredential.user.displayName || email.split("@")[0]);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      const res = await signIn("credentials", {
        redirect: false,
        idToken,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Mark login so the welcome-back animation plays on their next login
      markAsLoggedIn(userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Logo size={42} variant="dark" showTagline={true} />
          <p style={{ marginTop: '0.5rem' }}>Welcome back! Please login to your account.</p>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="w-full mb-4 flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: '#fff', 
            color: '#333', 
            border: '1px solid #ddd', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="flex-col flex">
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              className="input-field" 
              placeholder="owner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="input-label" htmlFor="password">Password</label>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <input 
              id="password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
          

        </form>

        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
