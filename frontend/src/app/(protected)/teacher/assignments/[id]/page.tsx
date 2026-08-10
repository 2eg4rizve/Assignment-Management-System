import { TeacherAssignmentDetailPage } from "@/features/assignments/components/teacher-assignment-detail-page";
export default async function TeacherAssignmentRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeacherAssignmentDetailPage id={id} />; }
