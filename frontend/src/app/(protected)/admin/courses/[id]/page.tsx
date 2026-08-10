import { CourseDetailPage } from "@/features/courses/components/course-detail-page";
export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CourseDetailPage id={id} />; }
