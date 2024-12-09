import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Welcome to Hajj Connect</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Connect with pilgrims and certified Hajj agents
        </p>
        
        {/* Auth Buttons */}
        <div className="flex gap-4 mt-8">
          <Link 
            href="/login"
            className="px-6 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="px-6 py-3 border border-foreground rounded-lg hover:bg-foreground hover:text-background transition"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
