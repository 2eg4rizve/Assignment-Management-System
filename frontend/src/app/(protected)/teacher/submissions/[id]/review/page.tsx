import { TeacherSubmissionReviewPage } from "@/features/submissions/components/teacher-submission-review-page";
export default async function TeacherSubmissionReviewRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeacherSubmissionReviewPage id={id} />; }
