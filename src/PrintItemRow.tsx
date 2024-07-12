import { Table, TextInput, NumberInput, ActionIcon } from "@mantine/core";
import { IconCurrencyDollar, IconTrash } from "@tabler/icons-react";
import { memo } from "react";
import { PrintItem } from "./App";
import { validatePrice } from "./utils";

export const PrintItemRow = memo(function ({
  item,
  updateItem,
  removeItem,
}: {
  item: PrintItem;
  updateItem: <T extends keyof PrintItem>(
    token: string,
    property: T,
    value: PrintItem[T]
  ) => void;
  removeItem: (token: string) => void;
}) {
  return (
    <Table.Tr>
      <Table.Td>
        <TextInput
          value={item["Item Name"]}
          error={!item["Item Name"]}
          onChange={(e) => {
            updateItem(item.Token, "Item Name", e.target.value);
          }}
        />
      </Table.Td>
      <Table.Td>
        <TextInput
          value={item["SKU"]}
          error={!item["SKU"]}
          onChange={(e) => {
            updateItem(item.Token, "SKU", e.target.value);
          }}
        />
      </Table.Td>
      <Table.Td>
        <TextInput
          value={item["Price"]}
          error={!item["Price"] || validatePrice(item["Price"])}
          leftSection={<IconCurrencyDollar size={16} />}
          onChange={(e) => {
            updateItem(item.Token, "Price", e.target.value);
          }}
        />
      </Table.Td>
      <Table.Td>
        <NumberInput
          value={item["count"]}
          error={!item["count"]}
          min={0}
          onChange={(e) => {
            updateItem(item.Token, "count", e === "" ? "" : Number(e));
          }}
        />
      </Table.Td>
      <Table.Td>
        <ActionIcon
          variant="transparent"
          onClick={() => removeItem(item.Token)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
});
