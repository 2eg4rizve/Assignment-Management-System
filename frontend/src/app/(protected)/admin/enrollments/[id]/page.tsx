import { EnrollmentDetailPage } from "@/features/enrollments/components/enrollment-detail-page";
export default async function AdminEnrollmentDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EnrollmentDetailPage id={id} />; }
