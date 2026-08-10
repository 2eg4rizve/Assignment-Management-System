export type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type CreateSubjectInput = Pick<Subject, "code" | "name"> & {
  description?: string;
};

export type UpdateSubjectInput = CreateSubjectInput & { isActive: boolean };

export type SubjectFilters = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
};
