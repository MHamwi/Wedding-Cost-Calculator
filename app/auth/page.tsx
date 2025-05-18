import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-3xl font-bold text-center mb-8">تسجيل الدخول / إنشاء حساب</h1>
        <AuthForm />
      </div>
    </div>
  )
}
