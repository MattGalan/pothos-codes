import { ActionIcon, Table } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { SquareItem } from "./App";
import { searchMatch } from "./utils";

export function SquareItemRow({
  item,
  addItem,
  search,
  onAddButtonEscape,
}: {
  item: SquareItem;
  addItem: () => void;
  search: string;
  onAddButtonEscape: () => void;
}) {
  const matchesSearch =
    searchMatch(search, item["Item Name"]) || searchMatch(search, item.SKU);

  return (
    <Table.Tr display={matchesSearch ? "table-row" : "none"}>
      <Table.Td>{item["Item Name"]}</Table.Td>
      <Table.Td>{item["SKU"]}</Table.Td>
      <Table.Td>{item["Price"]}</Table.Td>
      <Table.Td>
        <ActionIcon
          variant="transparent"
          onClick={addItem}
          onKeyDown={(k) => {
            if (k.code === "Escape") onAddButtonEscape();
          }}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
