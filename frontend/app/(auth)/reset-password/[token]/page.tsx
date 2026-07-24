import NewPasswordForm from "../../components/NewPasswordForm";

export default async function NewPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <NewPasswordForm token={token} />;
}
