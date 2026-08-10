import { SubjectDetailPage } from "@/features/subjects/components/subject-detail-page";
export default async function AdminSubjectDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <SubjectDetailPage id={id} />; }
