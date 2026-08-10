import { AdminAssignmentDetailPage } from "@/features/assignments/components/admin-assignment-detail-page";
export default async function AdminAssignmentRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminAssignmentDetailPage id={id} />; }
