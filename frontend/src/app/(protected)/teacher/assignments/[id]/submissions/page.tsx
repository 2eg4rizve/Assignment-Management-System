import { SubmissionsListPage } from "@/features/submissions/components/submissions-list-page";
export default async function AssignmentSubmissionsRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SubmissionsListPage mode="teacher" assignmentId={id} />; }
