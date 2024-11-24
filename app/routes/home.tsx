import type { Route } from "./+types/home";
import { database } from "~/database/context";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { Table } from "~/components/Table";
import { testRuns, tests as testsTable } from "~/database/schema";
import { eq, sql } from "drizzle-orm";
import { Group, Progress, Select, Stack, Tooltip } from "@mantine/core";
import { GitBranch } from "@phosphor-icons/react";
import { useSearchParams } from "react-router";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Tests" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const branch = new URL(request.url).searchParams.get("branch");
  const db = database();
  const tests = await db
    .select({
      name: testsTable.name,
      passedCount: sql<number>`SUM(${testRuns.passed})`,
      failedCount: sql<number>`SUM(${testRuns.failed})`,
      failRatio: sql<number>`CAST(SUM(${testRuns.failed}) AS FLOAT) / (SUM(${testRuns.passed}) + SUM(${testRuns.failed})) AS failRatio`,
    })
    .from(testsTable)
    .leftJoin(testRuns, eq(testsTable.id, testRuns.testId))
    .where(branch ? eq(testRuns.branch, branch) : undefined)
    .groupBy(testsTable.id)
    .orderBy(sql`failRatio DESC`);
  const branches = await db
    .selectDistinct({
      branch: testRuns.branch,
      daysSeen: sql<number>`COUNT(*) AS daysSeen`,
    })
    .from(testRuns)
    .groupBy(testRuns.branch)
    .orderBy(sql`daysSeen DESC`);
  return { tests, branches };
}

type Test = Awaited<ReturnType<typeof loader>>["tests"][0];

function FailureRatio({ row }: { row: Row<Test> }) {
  return (
    <Tooltip label={`${(row.original.failRatio * 100).toFixed(0)}%`}>
      {/* this stack adds some height so the tooltip is easier to trigger */}
      <Stack justify="center" style={{ height: 20 }}>
        <Progress.Root size="xs">
          <Progress.Section value={row.original.failRatio * 100} color="red" />
          <Progress.Section
            value={100 - row.original.failRatio * 100}
            color="green"
          />
        </Progress.Root>
      </Stack>
    </Tooltip>
  );
}

const columnHelper = createColumnHelper<Test>();
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
  }),
  columnHelper.accessor("passedCount", {
    id: "passedCount",
    header: "Times succeeded",
  }),
  columnHelper.accessor("failedCount", {
    id: "failedCount",
    header: "Times failed",
  }),
  columnHelper.accessor("failRatio", {
    id: "failRatio",
    header: "Failure ratio",
    cell: ({ row }) => <FailureRatio row={row} />,
  }),
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const onSelectBranch = (value: string | null) => {
    if (value) {
      setSearchParams({ branch: value });
    } else {
      setSearchParams({});
    }
  };
  return (
    <Stack>
      <Group ml="auto">
        <Select
          label="Branch"
          placeholder="Filter by branch"
          clearable
          leftSection={<GitBranch />}
          value={searchParams.get("branch")}
          onChange={onSelectBranch}
          data={loaderData.branches.map((row) => row.branch)}
          width={500}
        />
      </Group>
      <Table
        columns={columns}
        data={loaderData.tests}
        striped
        stickyHeader
        stickyHeaderOffset={60}
      />
    </Stack>
  );
}
