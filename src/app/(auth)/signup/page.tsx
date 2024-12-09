import SignUpForm from '@/components/SignUpForm'

export default function SignUpPage() {
  return (
    <>
      <h2 className="text-center text-3xl font-bold">Create your account</h2>
      <div className="mt-8">
        <SignUpForm />
      </div>
    </>
  )
}