import { Group, NumberInput, TextInput } from "@mantine/core";

export interface Plant {
  commonName: string;
  latinName: string;
  sku: string;
  price: number;
  count: number;
}

export default function PlantRow() {
  return (
    <Group>
      <TextInput label="Common name" />
      <TextInput label="Latin name" />
      <TextInput label="SKU" />
      <NumberInput label="Price" />
      <NumberInput label="Count" min={0} />
    </Group>
  );
}
