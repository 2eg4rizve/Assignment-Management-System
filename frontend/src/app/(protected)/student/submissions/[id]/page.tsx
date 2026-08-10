import { StudentSubmissionDetailPage } from "@/features/submissions/components/student-submission-detail-page";
export default async function StudentSubmissionRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentSubmissionDetailPage id={id} />;
}
