import { AdminSubmissionDetailPage } from "@/features/submissions/components/admin-submission-detail-page";
export default async function AdminSubmissionRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminSubmissionDetailPage id={id} />;
}
