"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useIsReturningUser } from "@/hooks/useIsReturningUser";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const { markAsLoggedIn } = useIsReturningUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const res = await signIn("credentials", {
        redirect: false,
        idToken,
        name,
        phone,
        action: "register"
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Store name for welcome-back greeting on future logins
      markAsLoggedIn(name || userCredential.user.email?.split("@")[0] || "");
      router.push("/onboarding/property");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("User already exists with this email.");
      } else {
        setError(err.message || "Registration failed");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      const res = await signIn("credentials", {
        redirect: false,
        idToken,
        action: "register_google"
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Store name for welcome-back greeting on future logins
      markAsLoggedIn(userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "");
      router.push("/onboarding/property");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-up failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Logo size={42} variant="auto" showTagline={true} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-main)' }}>Register a PGmate Account</h1>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

        <button 
          onClick={handleGoogleSignUp} 
          disabled={loading}
          type="button"
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
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google brand logo for OAuth registration" style={{ width: 18, height: 18 }} />
          Sign up with Google
        </button>

        <div className="flex items-center my-4">
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="flex-col flex">
          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input 
              id="name" 
              type="text" 
              className="input-field" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

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
            <label className="input-label" htmlFor="phone">Phone Number</label>
            <input 
              id="phone" 
              type="tel" 
              className="input-field" 
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account with Email"}
          </button>
        </form>

        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
