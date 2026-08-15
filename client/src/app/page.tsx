import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect root route (http://localhost:3000/) directly to /login
  redirect('/login');
}
