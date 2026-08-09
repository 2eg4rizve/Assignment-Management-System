import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable, type DataTableColumn } from "./data-table";

type CourseRow = {
  code: string;
  id: string;
  name: string;
};

const columns: readonly DataTableColumn<CourseRow>[] = [
  { cell: (course) => course.code, header: "Code", id: "code" },
  { cell: (course) => course.name, header: "Name", id: "name" },
];

describe("DataTable", () => {
  it("renders typed rows", () => {
    render(
      <DataTable
        columns={columns}
        getRowKey={(course) => course.id}
        items={[{ code: "DEMO-101", id: "1", name: "Demo Course" }]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Code" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "Demo Course" })).toBeVisible();
  });

  it("renders a useful empty state", () => {
    render(
      <DataTable
        columns={columns}
        getRowKey={(course) => course.id}
        items={[]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "No records found" }),
    ).toBeVisible();
  });
});
