import { EditAssignmentPage } from "@/features/assignments/components/edit-assignment-page";
export default async function EditAssignmentRoute({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EditAssignmentPage id={id} />; }
