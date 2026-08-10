import { StudentAssignmentDetailPage } from "@/features/assignments/components/student-assignment-detail-page";
export default async function StudentAssignmentRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <StudentAssignmentDetailPage id={id} />; }
