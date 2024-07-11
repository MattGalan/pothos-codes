import { Group, Text } from "@mantine/core";
import { IconAmpersand, IconArrowRight } from "@tabler/icons-react";
import { LABELS_PER_PAGE } from "./PDF";

export function PageCount({ count }: { count: number }) {
  const pageCount = Math.ceil(count / LABELS_PER_PAGE);

  const wastedLabels =
    count % LABELS_PER_PAGE === 0
      ? 0
      : LABELS_PER_PAGE - (count % LABELS_PER_PAGE);

  return (
    <Group flex={1} gap={8}>
      <Text>
        {count} label{count === 1 ? "" : "s"}
      </Text>
      <IconArrowRight size={16} color="gray" />
      <Text>
        {pageCount} sheet{pageCount === 1 ? "" : "s"}
      </Text>
      <IconAmpersand size={16} color="gray" />
      <Text c={wastedLabels === 0 ? "green" : "gray"}>
        {wastedLabels} wasted label{wastedLabels === 1 ? "" : "s"}
      </Text>
    </Group>
  );
}
