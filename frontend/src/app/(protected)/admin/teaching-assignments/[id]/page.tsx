import { TeachingAssignmentDetailPage } from "@/features/teaching-assignments/components/teaching-assignment-detail-page";
export default async function AdminTeachingAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeachingAssignmentDetailPage id={id} />; }
